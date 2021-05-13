import React, {useState, useLayoutEffect} from 'react';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import {FormContent, FormView} from '../../components/templates';
import TextField from '../../components/textField';
import Picker from '../../components/picker';
import {Platform} from 'react-native';
import {APP_COLORS} from '../../utils/designSystem';
import {BigButton} from '../../components/buttons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Settings'>;

// type Props = {
//   navigation: ScreenNavigationProp;
// };

export default function Settings() {
  const [tempData, setTempData] = useState('en');
  const [data, setData] = useState('en');

  useLayoutEffect(() => {
    const getLanguage = async () => {
      try {
        const value = await AsyncStorage.getItem('@language');

        if (value !== null) {
          setData(value);
          setTempData(value);
        }
      } catch (e) {
        console.log(e);
        throw new Error(e);
      }
    };
    getLanguage();
  }, []);

  const setLanguage = async () => {
    try {
      await AsyncStorage.setItem('@language', data);
      i18n.activate(data);
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  };

  const pickerItemColor =
    Platform.OS === 'ios' ? APP_COLORS.Light : APP_COLORS.Dark;

  return (
    <FormView>
      <FormContent>
        <Picker
          onValueChange={(itemValue) =>
            Platform.OS === 'ios' ? setTempData(itemValue) : setData(itemValue)
          }
          onDonePress={() => {
            setData(tempData);
          }}
          items={[
            {label: 'English', value: 'en', color: pickerItemColor},
            {label: 'Español', value: 'es', color: pickerItemColor},
          ]}
          value={Platform.OS === 'ios' ? tempData : data}>
          <TextField
            value={data === 'en' ? 'English' : 'Español'}
            label={i18n._(t`Language`)}
            placeholder={i18n._(t`Language`)}
            editable={false}
            fieldIco="chevron-down"
          />
        </Picker>
      </FormContent>
      <BigButton
        title={i18n._(t`Update`)}
        onPress={() => {
          setLanguage();
        }}
      />
    </FormView>
  );
}
