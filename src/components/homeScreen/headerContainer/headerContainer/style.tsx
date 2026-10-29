import { StyleSheet } from 'react-native';
import { commonStyles } from '../../../../styles/commonStyle';
import { fontSizes, windowWidth } from '@src/themes';
import { appColors } from '@src/themes'; 

const styles = StyleSheet.create({
  texify: {
    ...commonStyles.mediumText23,
    fontWeight: '700',
    fontSize: fontSizes.FONT25,
    color: appColors.whiteColor,
  },
  logoContainer: {
    width: windowWidth(120),
    height: windowWidth(120) * 725 / 2170,
  },
  logo: {
    width: windowWidth(120),
    height: windowWidth(120) * 725 / 2170,
    resizeMode: 'contain',
    tintColor: appColors.whiteColor,
  }
});
export { styles };
