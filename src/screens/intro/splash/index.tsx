import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, View, Text, Linking, Platform } from "react-native";
import { external } from "../../../styles/externalStyle";
import { appColors } from "@src/themes";
import Images from "@utils/images";
import { styles } from "./styles";
import { getValue } from "../../../utils/localstorage/index";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from '@src/api/store/hooks';
import {
  homeScreenPrimary,
  selfData,
  settingDataGet,
  taxidosettingDataGet,
  translateDataGet,
} from "../../../api/store/actions";
import { NoInternet, UpdateRequiredModal } from "@src/components";
import { useAppNavigation } from "@src/utils/navigation";
import DeviceInfo from "react-native-device-info";
import { AppDispatch, RootState } from "@src/api/store";
import { useValues } from "@src/utils/context/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resetRateLimit } from "@src/api/ratelimitter";
import { resetThrottler } from "@src/api/requestThrottler";

import LinearGradient from "react-native-linear-gradient";
import { RydapLandscape } from "../../../components/homeScreen/RydapLandscape";

const STARTUP_TIMEOUT_MS = 20000;

const sanitizeServerError = (data: unknown, status: number) => {
  let message: unknown;
  if (typeof data === "string") {
    const htmlHeading = data.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1];
    const htmlTitle = data.match(/<title[^>]*>(.*?)<\/title>/i)?.[1];
    message = htmlHeading ?? htmlTitle ?? data;
  } else if (data && typeof data === "object") {
    const responseData = data as Record<string, unknown>;
    message =
      responseData.message ??
      responseData.error ??
      responseData.detail ??
      responseData.title;
  }

  if (typeof message === "string") {
    const sanitized = message
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);
    if (sanitized) {
      return sanitized.replace(new RegExp(`^${status}\\s+`), "");
    }
  }

  return status === 404 ? "Not Found" : "The server rejected the request";
};

const formatStartupError = (error: unknown) => {
  if (error && typeof error === "object") {
    const failure = error as Record<string, unknown>;
    const status = typeof failure.status === "number" ? failure.status : undefined;
    if (status !== undefined) {
      return `Rider settings request failed (HTTP ${status}): ${sanitizeServerError(
        failure.data,
        status,
      )}`;
    }
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unable to start the app. Check your connection and retry.";
};

export function Splash() {
  const { replace } = useAppNavigation();
  const { isDark, setIsRTL } = useValues();
  const dispatch = useDispatch<AppDispatch>();
  const { settingData, translateData } = useSelector((state: RootState) => state.setting);
  const [showNoInternet, setShowNoInternet] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const mountedRef = useRef(false);
  const runIdRef = useRef(0);
  const navigationStartedRef = useRef(false);
  const activeRequestsRef = useRef<Array<{ abort: (reason?: string) => void }>>([]);

  const cancelActiveRequests = useCallback(() => {
    activeRequestsRef.current.forEach(request => request.abort());
    activeRequestsRef.current = [];
  }, []);

  const runStartup = useCallback(async () => {
    const runId = ++runIdRef.current;
    const isCurrentRun = () => mountedRef.current && runIdRef.current === runId;
    cancelActiveRequests();
    navigationStartedRef.current = false;
    setShowNoInternet(false);
    setStartupError(null);
    setShowUpdateModal(false);

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const startupWork = async () => {
        await resetRateLimit();
        await resetThrottler();

        const translationRequest = dispatch(translateDataGet());
        const homeRequest = dispatch(homeScreenPrimary());
        activeRequestsRef.current.push(translationRequest, homeRequest);
        void translationRequest.unwrap().catch(error => {
          if (isCurrentRun()) console.warn("Unable to load translations during startup:", error);
        });
        void homeRequest.unwrap().catch(error => {
          if (isCurrentRun()) console.warn("Unable to load home data during startup:", error);
        });

        const settingsRequest = dispatch(settingDataGet());
        const taxidoSettingsRequest = dispatch(taxidosettingDataGet());
        activeRequestsRef.current.push(settingsRequest, taxidoSettingsRequest);

        const [settingsResult, taxidoSettingsResult] = await Promise.all([
          settingsRequest.unwrap(),
          taxidoSettingsRequest.unwrap(),
        ]);

        const settingsStatus = settingsResult?.response?.status;
        if (
          typeof settingsStatus === "number" &&
          (settingsStatus < 200 || settingsStatus >= 300)
        ) {
          throw new Error(
            `App settings request failed (HTTP ${settingsStatus}): ${sanitizeServerError(
              settingsResult?.data,
              settingsStatus,
            )}`,
          );
        }
        if (
          !settingsResult?.data?.values?.maintenance ||
          !taxidoSettingsResult?.cabbooking_values
        ) {
          throw new Error("Required app settings could not be loaded. Please try again.");
        }

        if (settingsResult.data.values.maintenance.maintenance_mode == "1") {
          return { destination: "maintenance" as const };
        }

        const version = await DeviceInfo.getVersion();
        const requiredVersion =
          taxidoSettingsResult?.cabbooking_values?.setting?.app_version;
        const forceUpdate =
          taxidoSettingsResult?.cabbooking_values?.activation?.force_update == "1";
        if (forceUpdate && requiredVersion && version < requiredVersion) {
          return { destination: "update" as const };
        }

        const token = await getValue("token");
        if (!token) {
          return { destination: "Onboarding" as const };
        }

        const selfRequest = dispatch(selfData());
        activeRequestsRef.current.push(selfRequest);
        const selfResult = await selfRequest.unwrap();
        if (
          selfResult === "Unauthorized" ||
          selfResult?.status === 401 ||
          selfResult?.status === 403
        ) {
          return { destination: "SignIn" as const };
        }
        if (selfResult === "Error" || selfResult?.status !== 200) {
          throw new Error("Unable to verify your session. Check your connection and retry.");
        }

        return { destination: "MyTabs" as const };
      };

      const timeout = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          cancelActiveRequests();
          reject(new Error("Startup took too long. Check your connection and retry."));
        }, STARTUP_TIMEOUT_MS);
      });
      const result = await Promise.race([startupWork(), timeout]);
      if (!isCurrentRun()) return;

      if (result.destination === "maintenance") {
        setShowNoInternet(true);
        return;
      }
      if (result.destination === "update") {
        setShowUpdateModal(true);
        return;
      }
      if (!navigationStartedRef.current) {
        navigationStartedRef.current = true;
        replace(result.destination);
      }
    } catch (error) {
      if (!isCurrentRun()) return;
      setStartupError(formatStartupError(error));
      setShowNoInternet(true);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, [cancelActiveRequests, dispatch, replace]);

  useEffect(() => {
    mountedRef.current = true;
    void runStartup();
    return () => {
      mountedRef.current = false;
      runIdRef.current += 1;
      cancelActiveRequests();
    };
  }, [cancelActiveRequests, runStartup]);

  useEffect(() => {
    let active = true;
    const setDefaultLanguage = async () => {
      if (Array.isArray(settingData) || !settingData?.values?.general?.default_language) {
        return;
      }

      const defaultLang = settingData.values.general.default_language.locale;
      let storedLang = await getValue("selectedLanguage");
      if (!active) return;
      if (storedLang) storedLang = storedLang.replace(/^"|"$/g, "");

      const isRTL = (storedLang ?? defaultLang) === "ar";
      setIsRTL(isRTL);
      void AsyncStorage.setItem("rtl", JSON.stringify(isRTL));
    };

    void setDefaultLanguage().catch(error => {
      console.warn("Unable to apply the startup language direction:", error);
    });
    return () => {
      active = false;
    };
  }, [setIsRTL, settingData]);

  if (showNoInternet) {
    return (
      <NoInternet
        onRefresh={runStartup}
        title={
          startupError
            ? "Unable to start RYDAP"
            : translateData?.appUnderMaintenance ?? "Under maintenance"
        }
        details={
          startupError
            ? startupError
            : translateData?.onlineShortly ?? "We will be back online shortly."
        }
        image={isDark ? Images.maintenanceDark : Images.maintenance}
        infoIcon={false}
        btnHide={!startupError}
      />
    );
  }

  return (
    <LinearGradient colors={["#004B3C", "#006B50", "#009570"]} style={external.fx_1}>
      <View style={[external.ai_center, external.js_center, external.fx_1]}>
        <Text style={{ color: '#FFFFFF', fontSize: 60, fontWeight: '800', letterSpacing: -2 }}>RYD<Text style={{ color: '#38D6A2' }}>AP</Text></Text>
        <Text style={{ color: '#E6FFF5', fontSize: 18, marginTop: 8 }}>Ride   {'\u00B7'}   Auto   {'\u00B7'}   Car</Text>
        <Text style={{ color: '#9DE6CF', fontSize: 22, textAlign: 'center', marginTop: 44, lineHeight: 32 }}>Your ride,{'\n'}Your way</Text>
      </View>

      <RydapLandscape height={300} />
      <UpdateRequiredModal
        visible={showUpdateModal}
        onUpdate={() => {
          const appId = DeviceInfo.getBundleId();
          if (Platform.OS === "android") {
            Linking.openURL(`market://details?id=${appId}`);
          } else {
            Linking.openURL(`itms-apps://itunes.apple.com/app/id${appId}`);
          }
        }}
      />
    </LinearGradient>
  );
}
