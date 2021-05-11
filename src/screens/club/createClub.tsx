import React, {useContext, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {AppContext} from '../../context/appContext';
import {AuthContext} from '../../context/authContext';
import {IClub, IUserLeague} from '../../utils/interface';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {LeagueStackType} from '../league/league';
import {FormView, FormContent} from '../../components/templates';
import {BigButton} from '../../components/buttons';
import TextField from '../../components/textField';
import FullScreenLoading from '../../components/loading';
import {LeagueContext} from '../../context/leagueContext';
import analytics from '@react-native-firebase/analytics';
import {t, Trans} from '@lingui/macro';
import i18n from '../../utils/i18n';
import {Text, View} from 'react-native';
import {APP_COLORS, TEXT_STYLES} from '../../utils/designSystem';
import {verticalScale} from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'Create Club'>;

type ScreenRouteProp = RouteProp<LeagueStackType, 'Create Club'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();

export default function CreateClub({route, navigation}: Props) {
  const [clubName, setClubName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState({
    clubName: '',
  });

  const user = useContext(AuthContext);
  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);

  const leagueId = leagueContext.leagueId;

  const uid = user.uid!;
  //const isAdmin = route?.params?.isAdmin;
  const acceptClub = route.params.acceptClub;
  const username = context.userData!.username;
  const scheduled = route?.params?.scheduled;

  const onChangeText = (text: string) => {
    setClubName(text);

    if (error.clubName && clubName !== '') {
      setError({...error, clubName: ''});
    }
  };

  const fieldValidation = async () => {
    if (clubName === '') {
      setError({...error, clubName: i18n._(t`Field can't be empty`)});
      return false;
    }
    if (clubName.length < 4 && clubName !== '') {
      setError({...error, clubName: i18n._(t`At least ${4} letters`)});
      return false;
    }
    return true;
  };

  const onCreateClub = () => {
    fieldValidation().then(async (noErrors) => {
      if (noErrors) {
        setLoading(true);
        const batch = db.batch();
        const leagueRef = db.collection('leagues').doc(leagueId);
        const userRef = db.collection('users').doc(uid);
        const clubRef = leagueRef.collection('clubs').doc();

        const clubInfo: IClub = {
          name: clubName.trim(),
          managerId: uid,
          managerUsername: username,
          accepted: acceptClub,
          roster: {
            [uid]: {
              accepted: true,
              username: username,
            },
          },
          created: firestore.Timestamp.now(),
          leagueId: leagueId,
        };
        const userInfo: IUserLeague = {
          clubId: clubRef.id,
          manager: true,
          clubName: clubName.trim(),
          accepted: acceptClub,
        };

        let updateLeagueInfo = {...leagueContext.league};

        if (acceptClub) {
          batch.update(leagueRef, {
            acceptedClubs: firestore.FieldValue.increment(1),
          });
          batch.set(
            leagueRef,
            {
              clubIndex: {
                [clubRef.id]: clubName,
              },
            },
            {merge: true},
          );
          updateLeagueInfo.acceptedClubs += 1;
          updateLeagueInfo.clubIndex = {
            ...updateLeagueInfo.clubIndex,
            [clubRef.id]: clubName.trim(),
          };
        }
        batch.set(clubRef, clubInfo);
        batch.set(
          userRef,
          {
            leagues: {
              [leagueId]: userInfo,
            },
          },
          {merge: true},
        );
        try {
          await Promise.all([
            batch.commit(),
            analytics().logJoinGroup({
              group_id: leagueContext.leagueId,
            }),
          ]);

          let userData = {...context.userData};

          if (userData.leagues?.[leagueId]) {
            userData.leagues[leagueId] = {
              ...userData.leagues[leagueId],
              ...userInfo,
            };
          } else {
            userData.leagues = {[leagueId]: userInfo};
          }

          let userLeagues = {...context.userLeagues};

          userLeagues = {
            ...userLeagues,
            [leagueId]: updateLeagueInfo,
          };
          leagueContext.setLeague(updateLeagueInfo);
          context.setUserData(userData);
          context.setUserLeagues(userLeagues);
          setLoading(false);
          navigation.goBack();
        } catch (err) {
          console.log(err);

          setLoading(false);
          throw new Error(err);
        }
      }
    });
  };

  if (loading) {
    return <FullScreenLoading visible={loading} />;
  }

  return (
    <FormView>
      <FormContent>
        <TextField
          onChangeText={(text) => onChangeText(text.trimStart())}
          value={clubName}
          placeholder={i18n._(t`Club Name`)}
          autoCorrect={false}
          label={i18n._(t`Club Name`)}
          error={error.clubName}
          helper={i18n._(t`Minimum ${4} letters, no profanity`)}
          maxLength={15}
        />
        {scheduled && (
          <View
            style={{
              padding: verticalScale(16),
              borderWidth: 1,
              borderColor: APP_COLORS.Accent,
              borderRadius: 3,
              marginTop: verticalScale(16),
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',

                marginBottom: verticalScale(8),
              }}>
              <Icon
                name="information-outline"
                size={verticalScale(24)}
                color={APP_COLORS.Accent}
                style={{
                  marginRight: verticalScale(8),
                }}
              />
              <Text
                style={[
                  TEXT_STYLES.display4,
                  {
                    color: APP_COLORS.Accent,
                  },
                ]}>
                Waiting List
              </Text>
            </View>
            <Text
              style={[
                TEXT_STYLES.body,
                {
                  paddingLeft: verticalScale(32),
                },
              ]}>
              <Trans>
                As this league is already scheduled, you will be placed on the
                waiting list until league admin accepts your club.
              </Trans>
            </Text>
          </View>
        )}
      </FormContent>

      <BigButton onPress={onCreateClub} title={i18n._(t`Create Club`)} />
    </FormView>
  );
}
