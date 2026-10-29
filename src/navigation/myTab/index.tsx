import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../../screens/homeScreen/home/index";
import {
  Wallet as WalletIcon,
  HistoryEmpty,
  HistoryFill,
  Home,
  HomeLight,
  User,
  UserFill,
} from "@utils/icons";
import { ProfileSetting } from "../../screens/bottomTab/profileTab/profileSetting/index";
import { RideScreen } from "../../screens/bottomTab/myRide/RideScreen/index";
import { Wallet } from "../../screens/wallet";
import { CategoryScreen } from "../../screens/bottomTab/category/categoryScreen";
import { appColors } from "@src/themes";
import { Text, TouchableOpacity, Vibration, View } from "react-native";
import { useValues } from "@src/utils/context/index";
import styles from "./styles";
import { useAppSelector as useSelector } from '@src/api/store/hooks';
import useTabGuard from "../../utils/hooks/useTabGuard";

import { getValue, setValue } from "@src/utils/localstorage";
import { useAppNavigation } from "@src/utils/navigation";

const Tab = createBottomTabNavigator();

export function MyTabs() {
  const { translateData, settingData } = useSelector((state: any) => state.setting);
  const navigation = useAppNavigation();
  const { isDark, isRTL } = useValues();
  const { guardedPress } = useTabGuard();
  const screens = [
    {
      name: "HomeScreen",
      component: HomeScreen,
      label: translateData?.home || "Home",
      icon: ({ focused }: any) =>
        focused ? (
          <Home colors={appColors.primary} width={24} height={24} />
        ) : (
          <HomeLight />
        ),
    },
    {
      name: "WalletTab",
      component: Wallet,
      label: translateData?.myWallet || "Wallet",
      icon: ({ focused }: any) =>
        focused ? (
          <WalletIcon colors={appColors.primary} />
        ) : (
          <WalletIcon colors={appColors.regularText} />
        ),
    },
    {
      name: "RideScreen",
      component: RideScreen,
      label: translateData?.myRides || "My Rides",
      icon: ({ focused }: any) =>
        focused ? <HistoryFill /> : <HistoryEmpty />,
    },
    {
      name: "Profile",
      component: ProfileSetting,
      label: translateData?.profile || "Profile",
      icon: ({ focused }: any) =>
        focused ? (
          <UserFill />
        ) : (
          <User />
        ),
    },
  ];

  const referenceOrder = [screens[0], screens[2], screens[1], screens[3]];
  const orderedScreens = isRTL ? [...referenceOrder].reverse() : referenceOrder;

  return (
    <View
      style={{
        ...styles.flex,
        backgroundColor: isDark ? appColors.primaryText : appColors.lightGray,
      }}
    >
      <Tab.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{
          lazy: true,
          tabBarStyle: {
            ...styles.tabBar,
            borderTopColor: isDark
              ? appColors.primaryText
              : appColors.lightGray,
            backgroundColor: isDark
              ? appColors.darkHeader
              : appColors.whiteColor,
            borderTopRightRadius: 0,
            borderTopLeftRadius: 0,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen name="CategoryScreen" component={CategoryScreen} options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
        {orderedScreens.map(({ name, component, label, icon }) => (
          <Tab.Screen
            key={name}
            name={name}
            component={component}
            options={{
              tabBarLabel: ({ focused }) => (
                <Text
                  style={[
                    styles.text,
                    {
                      color: focused
                        ? appColors.primary
                        : appColors.regularText,
                      textAlign: isRTL ? "right" : "left",
                      writingDirection: isRTL ? "rtl" : "ltr",
                    },
                  ]}
                >
                  {label}
                </Text>
              ),
              tabBarIcon: icon,
              tabBarButton: (props: any) => (
                <TouchableOpacity
                  {...props}
                  onPress={() => {
                    guardedPress(name, async () => {
                      if (name === 'WalletTab' && !(await getValue('token'))) {
                        await setValue('CountinueScreen', 'Wallet');
                        navigation.navigate(settingData?.values?.activation?.login_number === 0 ? 'SignInWithMail' : 'SignIn');
                        return;
                      }
                      Vibration.vibrate(42);
                      props.onPress?.();
                    });
                  }}
                />
              ),
            }}
          />
        ))}
      </Tab.Navigator>
    </View>
  );
}
