import React, {forwardRef, useRef} from 'react';
import {View, Text, Modal} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import {TEXT_STYLES, APP_COLORS} from '../utils/designSystem';
import SectionedMultiSelect, {
  SectionedMultiSelectProps,
} from 'react-native-sectioned-multi-select';
import {SafeAreaView} from 'react-native-safe-area-context';
import {IconButton} from './buttons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const icons = {
  search: {
    name: 'search', // search input
    size: 24,
  },
  arrowUp: {
    name: 'close', // dropdown toggle
    size: 22,
  },
  arrowDown: {
    name: 'close', // dropdown toggle
    size: 22,
  },
  selectArrowDown: {
    name: 'close', // select
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

const Select = forwardRef((props: SectionedMultiSelectProps<any>, ref) => (
  // <Modal visible={visible} transparent>
  //   <View style={styles.container}>
  //     <SafeAreaView style={styles.content}>
  //       <View style={styles.header}>
  //         <Text style={TEXT_STYLES.body}>Title</Text>
  //         <IconButton name="close" onPress={onClose} color="white" />
  //       </View>

  <SectionedMultiSelect
    showDropDowns={false}
    showChips={false}
    showCancelButton={false}
    hideConfirm={false}
    hideSearch={true}
    IconRenderer={Icon}
    icons={icons}
    single={false}
    hideSelect
    ref={ref}
    alwaysShowSelectText={true}
    styles={{
      modalWrapper: styles.container,
      container: styles.content,
      //listContainer: styles.listContainer,
    }}
    {...props}
  />
));

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  container: {
    paddingVertical: '64@vs',
  },
  content: {
    backgroundColor: APP_COLORS.Dark,
  },
  listContainer: {
    padding: 0,
    height: 2,
  },
  header: {
    flexDirection: 'row',
    height: '56@vs',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: APP_COLORS.Secondary,
    paddingLeft: '12@vs',
  },
});

export default Select;
