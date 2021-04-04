import React from 'react';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import analytics from '@react-native-firebase/analytics';
import {t} from '@lingui/macro';
import i18n from '../../../utils/i18n';
import {Share, Platform} from 'react-native';

const shareLeagueLink = (leagueName: string, leagueId: string) => {
  const linkBuilder = async () => {
    const link = await dynamicLinks().buildShortLink(
      {
        link: `https://l.proclubs.zone/lgu/${leagueId}`,
        domainUriPrefix: 'https://l.proclubs.zone/lgu',
        ios: {
          bundleId: 'com.proclubszone',
          appStoreId: '1551138800',
          minimumVersion: '1',
          //      fallbackUrl: 'https://proclubs.zone',
        },
        android: {
          packageName: 'com.proclubszone',
          minimumVersion: '1',
          //      fallbackUrl: 'https://proclubs.zone',
        },
        social: {
          title: leagueName,
          descriptionText: `Join ${leagueName} on Pro Clubs Zone!`,
          imageUrl:
            'https://storage.googleapis.com/pro-clubs-zone-v2.appspot.com/web/dynamic-share.jpg',
        },
      },
      dynamicLinks.ShortLinkType.SHORT,
    );

    return link;
  };

  linkBuilder().then(async (link) => {
    const message = i18n._(t`Join ${leagueName} on Pro Clubs Zone!`);
    try {
      const result = await Share.share(
        {
          message: Platform.OS === 'ios' ? message : link,
          url: link,
          title: message,
        },
        {
          dialogTitle: i18n._(t`Invite clubs`),
        },
      );
      if (result.action === Share.sharedAction) {
        await analytics().logShare({
          content_type: 'league_invite',
          item_id: leagueId,
          method: result.activityType,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
};

export default shareLeagueLink;
