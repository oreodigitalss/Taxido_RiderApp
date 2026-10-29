import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { SafeAreaView, ScrollView, View, BackHandler, Text, StyleSheet, Image, Modal } from "react-native";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { commonStyles } from "../../../styles/commonStyle";
import { TodayOfferContainer } from "../../../components/homeScreen/todaysOffer";
import { TopCategory } from "../../../components/homeScreen/topCategory";
import { HomeSlider } from "../../../components/homeScreen/slider";
import { HeaderContainer } from "../../../components/homeScreen/headerContainer";
import styles from "./styles";
import { useValues } from '@src/utils/context/index';
import { Button } from "@src/commonComponent";
import { external } from "../../../styles/externalStyle";
import { appColors, appFonts, fontSizes, windowHeight } from "@src/themes";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from '@src/api/store/hooks';
import { vehicleData } from "../../../api/store/actions/vehicleTypeAction";
import { useAppNavigation } from "@src/utils/navigation";
import { Recentbooking } from "@src/screens/recentBooking";
import { BottomTitle } from "@src/components";
import { allRides, notificationDataGet, paymentsData, serviceDataGet, taxidosettingDataGet, userSaveLocation, walletData } from "@src/api/store/actions";
import { HomeLoader } from "../HomeLoader";
import useStoredLocation from "@src/components/helper/useStoredLocation";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { getValue } from "@src/utils/localstorage";
import { userZone } from "@src/api/store/actions";
import Images from "@src/utils/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DynamicIceland from "../../../components/homeScreen/DynamicIceland";
import { LowBalance } from "@src/commonComponent/lowBalance";

export function HomeScreen() {
  const dispatch = useDispatch();
  const { textColorStyle, viewRTLStyle, isDark, bgFullStyle, setIsRTL, isRTL } = useValues();
  const isFocused = useIsFocused();
  const [isScrolling, setIsScrolling] = useState(true);
  const { translateData, taxidoSettingData } = useSelector((state: any) => state.setting);
  const { reset } = useAppNavigation();
  const { self } = useSelector((state: any) => state.account);
  const { homeScreenDataPrimary, loading } = useSelector((state: any) => state.home);
  const { latitude, longitude } = useStoredLocation();
  const exitBottomSheetRef = useRef<BottomSheet>(null);
  const exitSnapPoints = useMemo(() => ["1%", "22%"], []);
  const [serviceAvilable, setServiceAvailable] = useState<null | boolean>(null);
  const [serviceCheckError, setServiceCheckError] = useState(false);
  const [currentRideReqData, setCurrentRideReqData] = useState<any>(null);

  const getVehicleTypes = useCallback(async () => {
    dispatch(vehicleData() as any);
  }, [dispatch]);
  useEffect(() => {
    const loadLanguageFromStorage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("selectedLanguage");
        if (savedLanguage == "ar") {
          setIsRTL(true);
        } else if (isRTL) {
          setIsRTL(true);
        } else {
          setIsRTL(false);
        }
      } catch (error) {
        console.error("Error loading language from storage:", error);
      }
    };
    loadLanguageFromStorage();
  }, [isRTL, setIsRTL]);

  const [loaderService, setLoaderService] = useState(false);

  const checkServiceAvailability = useCallback(async (lat: number, lng: number) => {
    setLoaderService(true);
    setServiceCheckError(false);
    try {
      const zone: any = await dispatch(
        userZone({ lat: lat.toString(), lng: lng.toString() }) as any,
      ).unwrap();
      const zoneId = zone?.id ?? zone?.data?.[0]?.id ?? zone?.data?.id;
      setServiceAvailable(zoneId !== null && zoneId !== undefined);
    } catch (error) {
      console.warn("Unable to check service area:", error);
      setServiceCheckError(true);
    } finally {
      setLoaderService(false);
    }
  }, [dispatch]);

  useEffect(() => {
    const delay = (ms: number) => new Promise(res => setTimeout(() => res(true), ms));
    const init = async () => {
      await dispatch(allRides() as any);
      await dispatch(serviceDataGet() as any);

      await delay(300);
      dispatch(vehicleData() as any);

      await delay(300);
      dispatch(walletData() as any);

      dispatch(paymentsData() as any);
      dispatch(notificationDataGet() as any);
      dispatch(userSaveLocation() as any);

      getVehicleTypes();
    };
    init();
  }, [dispatch, getVehicleTypes]);

  useEffect(() => {
    const getAddress = async () => {
      let lat = await getValue("user_latitude_Selected");
      let lng = await getValue("user_longitude_Selected");
      let finalLat = lat ? parseFloat(lat) : latitude;
      let finalLng = lng ? parseFloat(lng) : longitude;

      if (finalLat === null || finalLat === undefined || Number.isNaN(finalLat) ||
          finalLng === null || finalLng === undefined || Number.isNaN(finalLng)) return;

      void checkServiceAvailability(finalLat, finalLng);
    };

    getAddress();
  }, [checkServiceAvailability, latitude, longitude, taxidoSettingData]);



  useEffect(() => {
    const backAction = () => {
      exitBottomSheetRef.current?.expand();
      return true;
    };
    if (isFocused) {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );
      return () => backHandler.remove();
    }
  }, [isFocused]);

  const exitAndRestart = useCallback(() => {
    exitBottomSheetRef.current?.close();
    setTimeout(() => {
      BackHandler.exitApp();
      reset({
        index: 0,
        routes: [{ name: "Splash" }],
      });
    }, 500);
  }, [reset]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const isDataEmpty =
    !homeScreenDataPrimary ||
    Object.keys(homeScreenDataPrimary).length === 0 ||
    homeScreenDataPrimary === null;


  const [lowBalance, setLowBalance] = useState<boolean>(false);
  const { walletTypedata }: any = useSelector((state: any) => state.wallet);

  useFocusEffect(
    useCallback(() => {
      if (walletTypedata?.balance < 0) {
        setLowBalance(true);
      } else {
        setLowBalance(false);
      }
    }, [walletTypedata?.balance])
  );

  return (
    <View
      style={[
        commonStyles.flexContainer,
        { backgroundColor: appColors.lightGray },
      ]}>
      <Modal
        visible={lowBalance}
        transparent
        animationType="fade"
      >
        <LowBalance setLowBalance={setLowBalance} />
      </Modal>

      <SafeAreaView style={styles.container}>
        <HeaderContainer />
      </SafeAreaView>
      {loading || isDataEmpty ? (
        <HomeLoader />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          nestedScrollEnabled={true}
          scrollEnabled={isScrolling}
          contentContainerStyle={[
            styles.containerStyle,
            {
              backgroundColor: isDark ? appColors.bgDark : appColors.lightGray,
            },
          ]}>
          {loaderService || serviceAvilable === null ? (
            <HomeLoader />
          ) : serviceCheckError ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={[styles.titles, { color: textColorStyle, textAlign: "center" }]}>
                Unable to check service availability. Please try again.
              </Text>
              <Button
                title={translateData?.retry ?? "Retry"}
                onPress={async () => {
                  const savedLat = await getValue("user_latitude_Selected");
                  const savedLng = await getValue("user_longitude_Selected");
                  const retryLat = savedLat ? parseFloat(savedLat) : latitude;
                  const retryLng = savedLng ? parseFloat(savedLng) : longitude;
                  if (retryLat !== null && retryLat !== undefined && !Number.isNaN(retryLat) &&
                      retryLng !== null && retryLng !== undefined && !Number.isNaN(retryLng)) {
                    void checkServiceAvailability(retryLat, retryLng);
                  }
                }}
              />
            </View>
          ) : serviceAvilable ? (
            <>
              {homeScreenDataPrimary?.service_categories?.length > 0 && (
                <TopCategory
                  categoryData={homeScreenDataPrimary.service_categories}
                />
              )}

              {homeScreenDataPrimary?.banners?.length > 0 && (
                <HomeSlider
                  onSwipeStart={() => setIsScrolling(false)}
                  onSwipeEnd={() => setIsScrolling(true)}
                  bannerData={homeScreenDataPrimary.banners}
                />
              )}
              {homeScreenDataPrimary?.recent_rides?.length > 0 && (
                <Recentbooking
                  recentRideData={homeScreenDataPrimary.recent_rides}
                />
              )}
              {homeScreenDataPrimary?.coupons?.length > 0 &&
                taxidoSettingData?.cabbooking_values?.activation?.coupon_enable ==
                1 && (
                  <View style={styles.todayOfferContainer}>
                    <TodayOfferContainer
                      couponsData={homeScreenDataPrimary.coupons}
                    />
                  </View>
                )}
            </>
          ) : (
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Image
                source={
                  isDark ? Images.noServiceDark : Images.noServices
                }
                resizeMode="contain"
                style={styles.image}
              />
              <Text
                style={[
                  styles.titles,
                  {
                    color: isDark
                      ? appColors.whiteColor
                      : appColors.primaryText,
                  },
                ]}>
                {translateData?.ServiceUnavailableNo}
              </Text>
            </View>
          )}

          
        </ScrollView>
      )}

      {currentRideReqData && <DynamicIceland rideData={currentRideReqData} />}

      <BottomSheet
        ref={exitBottomSheetRef}
        index={-1}
        snapPoints={exitSnapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        style={{ zIndex: 2 }}
        handleIndicatorStyle={{
          backgroundColor: appColors.primary,
          width: "13%",
        }}
        backgroundStyle={{ backgroundColor: bgFullStyle }}>
        <BottomSheetView
          style={[
            bottomSheetStyles.contentContainer,
            {
              backgroundColor: isDark
                ? appColors.darkHeader
                : appColors.whiteColor,
            },
          ]}>
          <View style={styles.modelView}>
            <Text
              style={[
                external.ti_center,
                {
                  color: textColorStyle,
                  fontFamily: appFonts.medium,
                  fontSize: fontSizes.FONT22,
                  paddingVertical: windowHeight(10),
                },
              ]}>
              {translateData?.exitTitle}
            </Text>
          </View>
          <View
            style={[
              external.ai_center,
              external.js_space,

              { flexDirection: viewRTLStyle, marginTop: windowHeight(8) },
            ]}>
            <Button
              width={"47%" as any}
              title={translateData?.no}
              onPress={() => exitBottomSheetRef.current?.close()}
            />
            <Button
              width={"47%" as any}
              backgroundColor={
                isDark ? appColors.darkPrimary : appColors.lightGray
              }
              title={translateData?.yes}
              textColor={isDark ? appColors.darkText : appColors.primaryText}
              onPress={exitAndRestart}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const bottomSheetStyles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: windowHeight(15),
    backgroundColor: appColors.whiteColor,
  },
});
