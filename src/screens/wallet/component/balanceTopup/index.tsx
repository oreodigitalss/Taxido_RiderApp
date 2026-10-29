import React, { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppSelector as useSelector } from '@src/api/store/hooks';
import { appFonts } from '@src/themes';
import { useAppNavigation } from '@src/utils/navigation';
import { Wallet as WalletIcon } from '@src/utils/icons';

export function BalanceTopup({ balance }: { balance: number | string }) {
  const { navigate } = useAppNavigation();
  const { zoneValue } = useSelector((state: any) => state.zone);
  const [visible, setVisible] = useState(true);
  const amount = Number(balance ?? 0);
  return (
    <LinearGradient colors={['#00684F', '#009E70', '#00523D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Total Balance</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={visible ? 'Hide balance' : 'Show balance'} onPress={() => setVisible(!visible)}>
            <Text style={styles.amount}>{visible ? `${zoneValue?.currency_symbol || '\u20B9'}${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}` : '\u2022\u2022\u2022\u2022'}</Text>
          </TouchableOpacity>
        </View>
        <WalletIcon colors="#FFFFFF" />
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={() => navigate('TopUpWallet')} style={styles.button}>
        <Text style={styles.buttonText}>Add Money</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  card: { margin: 20, marginTop: 16, borderRadius: 22, padding: 24, minHeight: 164, elevation: 3, shadowColor: '#007D59', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: '#DEF5EC', fontFamily: appFonts.medium, fontSize: 14 },
  amount: { color: '#FFFFFF', fontFamily: appFonts.bold, fontSize: 34, marginTop: 6 },
  button: { alignSelf: 'flex-end', backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 25, paddingVertical: 11, marginTop: 8 },
  buttonText: { color: '#142B36', fontFamily: appFonts.medium, fontSize: 13 },
});
