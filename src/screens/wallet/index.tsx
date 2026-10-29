import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { BalanceTopup, List } from "./component/index";
import { Header, notificationHelper } from "@src/commonComponent";
import { useValues } from '@src/utils/context/index';
import { appColors } from "@src/themes";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from '@src/api/store/hooks';
import Images from "@src/utils/images";
import { NoInternet } from "@src/components";
import styles from "./styles";
import { SkeltonAppPage } from "../bottomTab/profileTab/appPageScreen/component";
import { useAppNavigation } from "@src/utils/navigation";
import { paymentsData, walletData, couponListData } from "@src/api/store/actions";
import { clearValue } from "@src/utils/localstorage";

export function Wallet() {
  const dispatch = useDispatch();
  const { textColorStyle, isDark, bgFullLayout } = useValues();
  const { walletTypedata, statusCode } = useSelector((state: any) => state.wallet);
  const [loading, setLoading] = useState(true);
  const { translateData } = useSelector((state: any) => state.setting);
  const navigation = useAppNavigation();
  const [showTransactions, setShowTransactions] = useState(false);
  const histories = Array.isArray(walletTypedata?.histories)
    ? walletTypedata.histories
    : walletTypedata?.histories?.data || [];

  useEffect(() => {
    dispatch(walletData());
    dispatch(couponListData());
    dispatch(paymentsData())
      .unwrap()
      .then(async (res: any) => {
        if (res?.status == 403) {
          notificationHelper('', translateData.loginAgain, 'error');
          await clearValue('token');
          navigation.reset({
            index: 0,
            routes: [{ name: 'SignIn' }],
          });
          return;
        }
      })
      .catch((error: any) => {
        console.error('Error fetching paymentsData:', error);
      })
      .finally(() => setLoading(false));
  }, []);


  return (
    <View
      style={[
        styles.main,
        {
          backgroundColor: isDark ? appColors.primaryText : appColors.lightGray,
        },
      ]}
    >
      <Header value={translateData?.myWallet || "Wallet"} />
      <BalanceTopup balance={walletTypedata?.balance || 0} />
      <View style={[walletStyles.menu, { backgroundColor: bgFullLayout }]}>
        <TouchableOpacity accessibilityRole="button" style={walletStyles.row} onPress={() => setShowTransactions(value => !value)}>
          <Text style={[walletStyles.icon, { color: appColors.primary }]}>{'\u21BA'}</Text>
          <Text style={{ flex: 1, color: textColorStyle }}>Transactions</Text>
          <Text style={{ color: appColors.regularText }}>{showTransactions ? '\u2303' : '\u203A'}</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={walletStyles.row} onPress={() => navigation.navigate('PromoCodeScreen', { from: 'wallet' })}>
          <Text style={[walletStyles.icon, { color: appColors.primary }]}>%</Text>
          <Text style={{ flex: 1, color: textColorStyle }}>Coupons</Text>
          <Text style={{ color: appColors.regularText }}>{'\u203A'}</Text>
        </TouchableOpacity>
      </View>
      {showTransactions && <Text style={[styles.title, { color: textColorStyle }]}>{translateData?.history || 'Transactions'}</Text>}

      {showTransactions && (loading ? (
        <View
          style={[
            styles.dataView,
            { backgroundColor: bgFullLayout, borderColor: appColors.border },
            {
              borderColor: isDark ? appColors.darkBorder : appColors.border
            }
          ]}
        >
          <View style={styles.skeltonAppPage}>
            <SkeltonAppPage />
          </View>
        </View>
      ) : histories.length > 0 ? (
        <List dataList={histories} />
      ) : (
        <View style={styles.noInternet}>
          <NoInternet
            btnHide
            title={translateData.noBalance}
            details={translateData.noBalanceDes}
            image={isDark ? Images.noBalanceDark : Images.noBalance}
            infoIcon
            status={`${translateData.statusCode} ${statusCode}`}
          />
        </View>
      ))}
    </View>
  );
}
const walletStyles = StyleSheet.create({
  menu: { marginHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: appColors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 18, minHeight: 62, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: appColors.border },
  icon: { width: 36, fontSize: 23, fontWeight: '600' },
});
