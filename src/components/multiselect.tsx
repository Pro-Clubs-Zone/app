import React from 'react';
import {View, Text, Modal} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import {TEXT_STYLES, APP_COLORS} from '../utils/designSystem';
import MultiSelect from 'react-native-multiple-select';

export default function Select({visible}) {
  return (
    <Modal presentationStyle="fullScreen" visible={visible}>
      <MultiSelect
        hideTags
        hideDropdown
        items={roster}
        uniqueKey="id"
        // ref={(component) => { this.multiSelect = component }}
        // onSelectedItemsChange={this.onSelectedItemsChange}
        // selectedItems={selectedItems}
        selectText="Pick Items"
        // onChangeInput={ (text)=> console.log(text)}
        // tagRemoveIconColor="#CCC"
        // tagBorderColor="#CCC"
        // tagTextColor="#CCC"
        // selectedItemTextColor="#CCC"
        // selectedItemIconColor="#CCC"
        //itemTextColor="#000"
        displayKey="username"
        //searchInputStyle={{ color: '#CCC' }}
        //submitButtonColor="#CCC"
        submitButtonText="Submit"
      />
    </Modal>
  );
}

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  badge: {
    position: 'absolute',
    right: '16@vs',
    top: '16@vs',
    height: '20@vs',
    width: '20@vs',
    borderRadius: '20@vs',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.Red,
  },
});
