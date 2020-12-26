import {Platform} from 'react-native';
import {verticalScale} from 'react-native-size-matters';

export enum APP_COLORS {
  Gray = '#9C9C9C',
  Accent = '#FECD51',
  Primary = '#3D3E4D',
  Secondary = '#4B4D5D',
  Green = '#55B35A',
  Red = '#FF4444',
  Light = '#FFFFFF',
  Dark = '#292933',
}

export enum FONT_SIZES {
  XXSS = 12,
  XXS = 14,
  XS = 16,
  S = 20,
  M = 24,
  L = 28,
  XL = 32,
  XXL = 36,
}

interface FontSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  color: APP_COLORS;
  backgroundColor: 'transparent';
  letterSpacing?: number;
}

interface FontStyles {
  display1: FontSettings;
  display2: FontSettings;
  display3: FontSettings;
  display4: FontSettings;
  display5: FontSettings;
  small: FontSettings;
  body: FontSettings;
}

type FontFamily = {
  display: 'Montserrat-Bold';
  body: 'System' | 'Roboto';
};

const fontFamilies: FontFamily = {
  ...Platform.select({
    ios: {
      display: 'Montserrat-Bold',
      body: 'System',
    },
    android: {
      display: 'Montserrat-Bold',
      body: 'Roboto',
    },
  }),
};

export const FONTS: FontStyles = {
  display1: {
    fontSize: verticalScale(FONT_SIZES.XXL),
    fontFamily: fontFamilies.display,
    lineHeight: verticalScale(40),
    color: APP_COLORS.Light,
    backgroundColor: 'transparent',
    letterSpacing: verticalScale(0.5),
  },
  display2: {
    fontSize: verticalScale(FONT_SIZES.XL),
    fontFamily: fontFamilies.display,
    lineHeight: verticalScale(32),
    color: APP_COLORS.Light,
    backgroundColor: 'transparent',
    letterSpacing: verticalScale(0.5),
  },
  display3: {
    fontSize: verticalScale(FONT_SIZES.L),
    fontFamily: fontFamilies.display,
    lineHeight: verticalScale(24),
    color: APP_COLORS.Light,
    backgroundColor: 'transparent',
    letterSpacing: verticalScale(0.5),
  },
  display4: {
    fontSize: verticalScale(FONT_SIZES.S),
    fontFamily: fontFamilies.display,
    lineHeight: verticalScale(23),
    color: APP_COLORS.Light,
    backgroundColor: 'transparent',
    letterSpacing: verticalScale(0.5),
  },
  display5: {
    fontSize: verticalScale(FONT_SIZES.XS),
    fontFamily: fontFamilies.display,
    lineHeight: verticalScale(17),
    color: APP_COLORS.Light,
    backgroundColor: 'transparent',
    letterSpacing: verticalScale(0.4),
  },
  // headline: {
  //   color: COLORS.Light,
  //   fontSize: verticalScale(FONT_SIZES[4]),
  //   fontFamily: fontFamilies.body,
  //   fontWeight: "bold",
  //   lineHeight: verticalScale(24)
  // },
  // title: {
  //   color: COLORS.Light,
  //   fontSize: verticalScale(FONT_SIZES[5]),
  //   fontFamily: fontFamilies.body,
  //   fontWeight: "bold",
  //   lineHeight: verticalScale(24)
  // },
  body: {
    fontSize: verticalScale(FONT_SIZES.XS),
    fontFamily: fontFamilies.body,
    lineHeight: verticalScale(20),
    color: APP_COLORS.Light,
    backgroundColor: 'transparent',
  },
  // bodyBold: {
  //   fontSize: verticalScale(FONT_SIZES[6]),
  //   fontFamily: fontFamilies.body,
  //   fontWeight: "bold",
  //   lineHeight: verticalScale(20),
  //   color: COLORS.Light,
  //   backgroundColor: "transparent"
  // },
  // link: {
  //   fontSize: verticalScale(FONT_SIZES[7]),
  //   fontFamily: fontFamilies.body,
  //   lineHeight: verticalScale(16),
  //   color: COLORS.Accent,
  //   backgroundColor: "transparent"
  // },
  // caption: {
  //   fontSize: verticalScale(FONT_SIZES[7]),
  //   fontFamily: fontFamilies.body,
  //   lineHeight: verticalScale(16),
  //   color: COLORS.Gray,
  //   backgroundColor: "transparent"
  // },
  small: {
    fontSize: verticalScale(FONT_SIZES.XXSS),
    fontFamily: fontFamilies.body,
    lineHeight: verticalScale(16),
    color: APP_COLORS.Light,
    backgroundColor: 'transparent',
  },
  // smallBold: {
  //   fontSize: verticalScale(FONT_SIZES[7]),
  //   fontFamily: fontFamilies.body,
  //   fontWeight: "bold",
  //   lineHeight: verticalScale(16),
  //   color: COLORS.Light,
  //   backgroundColor: "transparent"
  // },
  // buttonLabel: {
  //   fontFamily: fontFamilies.body,
  //   fontSize: verticalScale(FONT_SIZES[7]),
  //   color: COLORS.Dark,
  //   fontWeight: "bold",
  //   textAlign: "center",
  //   letterSpacing: verticalScale(0.2)
  // },
  // playerBold: {
  //   color: COLORS.Dark,
  //   fontFamily: fontFamilies.playerBold,
  //   textAlign: "center"
  // },
  // tabInactive: {
  //   color: "rgba(0,0,0,0.5)",
  //   fontSize: verticalScale(14)
  // }
};

export const NavTheme = {
  dark: true,
  colors: {
    primary: APP_COLORS.Primary,
    background: APP_COLORS.Dark,
    card: APP_COLORS.Accent,
    text: APP_COLORS.Dark,
    border: 'transparent',
    notification: APP_COLORS.Red,
  },
};
