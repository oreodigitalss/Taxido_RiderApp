import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Notification } from '@utils/icons';
import { appColors, appFonts } from '@src/themes';
import { useAppNavigation } from '@src/utils/navigation';
import { useAppSelector as useSelector } from '@src/api/store/hooks';
import { useValues } from '@src/utils/context';

export function HeaderComponent() {
  const { navigate } = useAppNavigation();
  const { self } = useSelector((state: any) => state.account);
  const { isDark, viewRTLStyle } = useValues();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning,' : hour < 17 ? 'Good Afternoon,' : 'Good Evening,';
  return (
    <View style={[styles.row, { flexDirection: viewRTLStyle }]}>
      <View>
        <Text style={[styles.greeting, isDark && styles.light]}>{greeting}</Text>
        <Text style={[styles.name, isDark && styles.light]}>{self?.name?.split(' ')[0] || 'Welcome'} {'\uD83D\uDC4B'}</Text>
      </View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => navigate('Notifications')} style={styles.bell}>
        <Notification />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  greeting: { fontFamily: appFonts.medium, fontSize: 16, color: appColors.primaryText },
  name: { fontFamily: appFonts.bold, fontSize: 24, color: appColors.primaryText, marginTop: 5 },
  light: { color: appColors.whiteColor },
  bell: { width: 42, height: 42, borderRadius: 21, backgroundColor: appColors.primary, alignItems: 'center', justifyContent: 'center' },
});
