import React from 'react';
import {FlatList, Linking} from 'react-native';
import {IFlatList} from '../../utils/interface';
import {ListSeparator, OneLine} from '../../components/listItems';
import {APP_COLORS} from '../../utils/designSystem';

export default function AppInfo() {
  const links: IFlatList[] = [
    {
      data: {
        link: 'https://twitter.com/proclubszone',
        name: 'Twitter',
        color: '#1da1f2',
      },
      id: 'twitter',
    },
    {
      data: {
        link: 'https://discord.gg/bEdPt6ec4Y',
        name: 'Discord',
        color: '#7289da',
      },
      id: 'discord',
    },
    {
      data: {
        link: 'https://www.youtube.com/channel/UCx-u1tBHplWCiLACV6umcjQ',
        name: 'Youtube',
        color: '#ff0000',
      },
      id: 'youtube',
    },
    {
      data: {
        link: 'https://www.twitch.tv/proclubszone',
        name: 'Twitch',
        color: '#9146ff',
      },
      id: 'twitch',
    },
    {
      data: {
        link: 'https://facebook.com/proclubszone',
        name: 'Facebook',
        color: '#3b5998',
      },
      id: 'facebook',
    },
    {
      data: {
        link: 'https://proclubs.zone',
        name: 'Website',
        color: APP_COLORS.Accent,
      },
      id: 'earth',
    },
  ];
  return (
    <FlatList
      data={links}
      ItemSeparatorComponent={() => <ListSeparator />}
      renderItem={({item}) => (
        <OneLine
          title={item.data.name}
          leftIcon={item.id}
          iconColor={item.data.color}
          onPress={() => Linking.openURL(item.data.link)}
        />
      )}
      keyExtractor={(item) => item.id}
    />
  );
}
