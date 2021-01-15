import React from 'react';
import {View, Text, Image, ImageBackground} from 'react-native';
import {APP_COLORS, TEXT_STYLES} from '../utils/designSystem';
import {PrimaryButton} from './buttons';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import {IMatchNavData} from '../utils/interface';
import defaultLogo from '../assets/images/defaultLogo.png';
import {t, Trans} from '@lingui/macro';
import i18n from '../utils/i18n';

type Props = {
  editable: boolean;
  onSubmit?: () => void;
  data: IMatchNavData;
  children?: any;
};

const ScoreBoard = ({data, editable, onSubmit, children}: Props) => {
  const homeTeamScore = data.result?.[data.homeTeamId];
  const awayTeamScore = data.result?.[data.awayTeamId];

  const Team = ({teamName}: {teamName: string}) => (
    <View style={styles.team}>
      <Image source={defaultLogo} style={styles.teamLogo} />
      <Text
        style={[
          TEXT_STYLES.small,
          {
            textAlign: 'center',
            fontWeight: 'bold',
          },
        ]}>
        {teamName}
      </Text>
    </View>
  );

  return (
    <ImageBackground source={{uri: 'scoreboard-bg'}} style={styles.bg}>
      <View style={styles.container}>
        <View style={styles.firstRow}>
          <Team teamName={data.homeTeamName} />

          <View>
            {!editable ? (
              <View
                style={{
                  marginTop: verticalScale(8),
                }}>
                {data.result && (
                  <Text
                    style={[
                      TEXT_STYLES.display2,
                      {
                        textAlign: 'center',
                        color: APP_COLORS.Accent,
                      },
                    ]}>
                    {homeTeamScore} - {awayTeamScore}
                  </Text>
                )}
                <Text
                  style={[
                    TEXT_STYLES.body,
                    {
                      textAlign: 'center',
                    },
                  ]}>
                  {`${data.leagueName} \n`}
                  <Text style={TEXT_STYLES.small}>Division One</Text>
                </Text>
                {/*   <Text
                style={[
                  TEXT_STYLES.small,
                  {
                    textAlign: 'center',
                  },
                ]}>
                {data.date}
              </Text> */}
              </View>
            ) : (
              <View style={styles.scoreInput}>
                <Text
                  style={[
                    TEXT_STYLES.small,
                    {
                      textAlign: 'center',
                    },
                  ]}>
                  <Trans>Enter Score</Trans>
                </Text>
                <View style={styles.textInputs}>{children}</View>
              </View>
            )}
          </View>
          <Team teamName={data.awayTeamName} />
        </View>
      </View>
      {
        editable && (
          // data.usertype === "manager" &&
          // !data.editable &&
          //   ((data.score1 == '' ||
          //     data.score2 == '' ||
          //     data.isFinishedMatch) &&
          //   data.showSubmit ? ( // To-Do - here we check if score is published or not
          <View style={styles.secondRow}>
            <PrimaryButton
              title="Submit"
              onPress={onSubmit}
              // disabled={
              //   data.disabled || false // To-do - if score is submitted by one manager - disable button ONLY FOR HIM with label "Score Submitted"
              // }
            />
          </View>
        )
        // ) : null)
      }
    </ImageBackground>
  );
};

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  firstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  team: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '80@vs',
  },
  teamLogo: {
    height: '56@vs',
    width: '56@vs',
    marginBottom: '16@vs',
  },
  bg: {
    padding: '16@vs',
    minHeight: '144@vs',
  },
  scoreInput: {
    justifyContent: 'space-around',
    flex: 1,
  },
  textInputs: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    height: '3@vs',
    width: '8@vs',
    backgroundColor: APP_COLORS.Accent,
    marginHorizontal: '8@vs',
  },
  secondRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '16@vs',
  },
});

export default ScoreBoard;
