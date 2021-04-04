import {IMatchNavData} from '../../../utils/interface';
import {Share} from 'react-native';
import i18n from '../../../utils/i18n';
import {t} from '@lingui/macro';

const shareMatchDetails = async (matchData: IMatchNavData) => {
  const content = `PRZ Match Report:\nLeague Name: ${
    matchData.leagueName
  },\nLeague ID: ${matchData.leagueId.slice(
    0,
    5,
  )},\nMatch ID: ${matchData.matchId.slice(
    0,
    5,
  )},\nPlease describe the issue:\n`;
  await Share.share(
    {
      message: content,
      title: i18n._(t`Share report with admin`),
    },
    {
      dialogTitle: i18n._(t`Report Match`),
    },
  );
};

export default shareMatchDetails;
