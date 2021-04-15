import React, {forwardRef} from 'react';
import {View, Text} from 'react-native';
import {ScaledSheet, verticalScale} from 'react-native-size-matters';
import {TEXT_STYLES, APP_COLORS} from '../utils/designSystem';
import SectionedMultiSelect, {
  SectionedMultiSelectProps,
} from 'react-native-sectioned-multi-select';
import {BigButton, IconButton} from './buttons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const icons = {
  search: {
    name: 'search', // search input
    size: 24,
  },
  arrowUp: {
    name: 'menu-up', // dropdown toggle
    size: 22,
  },
  arrowDown: {
    name: 'menu-down', // dropdown toggle
    size: 22,
  },
  selectArrowDown: {
    name: 'menu-down', // select
    size: 24,
  },
  close: {
    name: 'close', // chip close
    size: 16,
  },
  check: {
    name: 'check', // selected item
    size: 16,
  },
  cancel: {
    name: 'close', // cancel button
    size: 32,
  },
};

const Header = ({title, onCancel}: {title: string; onCancel: () => void}) => (
  <View style={styles.header}>
    <Text
      style={[
        TEXT_STYLES.body,
        {
          color: APP_COLORS.Gray,
        },
      ]}>
      {title}
    </Text>
    <IconButton name="close" color={APP_COLORS.Gray} onPress={onCancel} />
  </View>
);

const Select = forwardRef(
  (
    props: {
      showFooter: boolean;
      title: string;
      buttonTitle?: string;
    } & SectionedMultiSelectProps<any>,
    ref,
  ) => (
    //@ts-ignore
    <SectionedMultiSelect
      showDropDowns={false}
      showChips={false}
      showCancelButton={false}
      hideConfirm={true}
      hideSearch={true}
      IconRenderer={Icon}
      icons={icons}
      hideSelect
      ref={ref}
      modalSupportedOrientations={['portrait']}
      modalWithSafeAreaView={true}
      alwaysShowSelectText={true}
      headerComponent={
        <Header
          title={props.title}
          onCancel={() => ref?.current?._toggleSelector()}
        />
      }
      stickyFooterComponent={
        props.showFooter ? (
          <BigButton title={props.buttonTitle} onPress={props.onConfirm} />
        ) : null
      }
      selectedIconComponent={
        <Icon
          name="check"
          size={verticalScale(16)}
          color={APP_COLORS.Accent}
          style={{marginRight: verticalScale(4)}}
        />
      }
      styles={{
        container: styles.content,
        item: styles.item,
        scrollView: {paddingHorizontal: 0},
        separator: {backgroundColor: APP_COLORS.Secondary},
        itemText: [
          TEXT_STYLES.body,
          {
            fontWeight: 'normal',
          },
        ],
      }}
      colors={{itemBackground: APP_COLORS.Primary}}
      {...props}
    />
  ),
);

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  content: {
    backgroundColor: APP_COLORS.Dark,
  },

  header: {
    flexDirection: 'row',
    height: '56@vs',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: APP_COLORS.Secondary,
    paddingLeft: '12@vs',
  },
  item: {
    backgroundColor: APP_COLORS.Dark,
    height: '48@vs',
    paddingHorizontal: '12@vs',
  },
});

export default Select;
