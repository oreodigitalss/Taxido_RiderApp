import { Text, View, Keyboard, BackHandler, KeyboardAvoidingView, TouchableWithoutFeedback, ScrollView, Platform, ViewStyle } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AuthText } from '../../../components/authComponents/authText/index';
import { AuthContainer } from '../../../components/authComponents/authContainer/index';
import OTPTextInput from 'react-native-otp-textinput';
import OTPTextView from 'react-native-otp-textinput';
import { style } from './style';
import { appColors, windowHeight } from '@src/themes';
import { Button, notificationHelper } from '@src/commonComponent';
import { external } from '../../../styles/externalStyle';
import { NewUserComponent } from '../../../components/authComponents/newUserComponent/index';
import { useValues } from '@src/utils/context/index';
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from '@src/api/store/hooks';
import { AppDispatch } from '../../../api/store/index';
import { VerifyOtpInterface } from '../../../api/interface/authInterface';
import { userVerifyOtp, selfData, userLogin } from '../../../api/store/actions/index';
import { getValue, setValue } from '../../../utils/localstorage/index';
import { useAppNavigation, useAppRoute } from '@src/utils/navigation';
import { useIsFocused } from '@react-navigation/native';
import { authErrorMessage } from '@src/utils/authErrorMessage';

import messaging from '@react-native-firebase/messaging';

export function OtpVerification() {
  const route = useAppRoute<"OtpVerification">();
  const isFocused = useIsFocused();
  const { cca2 } = route.params || {};
  const countryCode = route?.params?.countryCode ?? '+91';
  const phoneNumber = route?.params?.phoneNumber ?? '';

  const { textRTLStyle, isDark, viewRTLStyle } = useValues();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: any) => state.auth);
  const { translateData } = useSelector((state: any) => state.setting);
  const input = useRef<OTPTextView | null>(null);
  const emailOrPhone = phoneNumber;
  const isEmail = emailOrPhone.includes('@');
  const [otp, setOtp] = useState('');
  const [fcmToken, setFcmToken] = useState<string>('')
  const [resendTimer, setResendTimer] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const verificationInFlight = useRef(false);
  const [resending, setResending] = useState(false);
  const navigation = useAppNavigation();

  useEffect(() => {
    if (otp.length !== 6) return;
    Keyboard.dismiss();
    handleVerify();
  }, [otp]);

  useEffect(() => {
    const fetchToken = async () => {
      let fcmToken = await getValue('fcmToken')
      if (fcmToken) {
        setFcmToken(fcmToken)
      }
    }
    if (isFocused) {
      fetchToken()
    }
  }, [isFocused])


  const handleVerify = async () => {
    if (!phoneNumber || otp.length !== 6 || verificationInFlight.current) {
      return;
    }
    verificationInFlight.current = true;

    const formatCountryCode = (code: string): string => {
      if (code.startsWith('+')) {
        return code.substring(1);
      }
      return code;
    };

    let payload: VerifyOtpInterface = {
      email_or_phone: phoneNumber,
      country_code: formatCountryCode(countryCode),
      token: otp,
      fcm_token: fcmToken
    };

    try {
      const res = await dispatch(userVerifyOtp(payload)).unwrap();
      if (res?.success && res?.is_registered === true) {
        notificationHelper(
          '',
          translateData?.otpVerifySuccess,
          'success',
        );

        if (res?.id) {
          messaging()
            .subscribeToTopic(`user_${res.id}`)
            .catch(error => console.error('Failed to subscribe user to topic:', error));
        }
        if (res.access_token) {
          await setValue('token', res.access_token);
          dispatch(selfData());
        }
        navigation.navigate('MyTabs');
      } else if (res?.success && res?.is_registered === false) {
        notificationHelper(
          '',
          translateData?.otpVerifySuccess,
          'success',
        );
        navigation.navigate('SignUp', {
          countryCode,
          phoneNumber,
          cca2,
        });
      } else {
        notificationHelper(
          '',
          authErrorMessage(res, translateData?.invalidOtp || 'The OTP is invalid or expired.'),
          'error',
        );
      }
    } catch (error: unknown) {
      notificationHelper(
        '',
        authErrorMessage(error, translateData?.duringVerificationOTP || 'OTP verification failed. Please try again.'),
        'error',
      );
    } finally {
      verificationInFlight.current = false;
    }
  };


  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);


  const handleResendOtp = useCallback(async () => {
    if (!phoneNumber || resendTimer > 0 || resending) return;

    const formatCountryCode = (code: string): string => {
      if (code.startsWith('+')) {
        return code.substring(1);
      }
      return code;
    };

    const payload = {
      email_or_phone: phoneNumber,
      country_code: formatCountryCode(countryCode),
      fcm_token: fcmToken,
    };

    setResending(true);
    try {
      const res = await dispatch(userLogin(payload)).unwrap();
      if (!res?.success) {
        notificationHelper(
          '',
          authErrorMessage(res, translateData?.NoOtp || 'Could not resend the OTP.'),
          'error',
        );
        return;
      }

      notificationHelper('', translateData?.otpSuccess, 'success');
      setResendTimer(10);
      timerRef.current = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1 && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: unknown) {
      notificationHelper(
        '',
        authErrorMessage(error, translateData?.NoOtp || 'Could not resend the OTP.'),
        'error',
      );
    } finally {
      setResending(false);
    }
  }, [dispatch, fcmToken, phoneNumber, countryCode, resendTimer, resending, translateData]);





  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <AuthContainer
            topSpace={windowHeight(240)}
            imageShow={true}
            container={
              <View>
                <AuthText
                  title={translateData?.otpVerification}
                  subtitle={
                    isEmail
                      ? `${translateData?.otpSendTo} ${emailOrPhone}`
                      : `${translateData?.otpSendTo} ${countryCode} ${emailOrPhone}`
                  }
                />

                <Text
                  style={[
                    style.otpTitle,
                    {
                      color: isDark ? appColors.whiteColor : appColors.primaryText,
                      textAlign: textRTLStyle,
                    },
                  ]}
                >
                  {translateData?.otp}
                </Text>

                <View
                  style={[style.inputContainer, { flexDirection: viewRTLStyle }]}
                >
                  <OTPTextInput
                    ref={input}
                    containerStyle={{
                      ...style.otpContainer,
                      flexDirection: viewRTLStyle,
                    }}
                    inputCount={6}
                    handleTextChange={(value) => {
                      setOtp(value);
                      if (value?.length === 6) {
                        const inputs = input.current?.inputs ?? [];
                        inputs[inputs.length - 1]?.blur();
                      }
                    }}
                    textInputStyle={{
                      ...style.otpInput,
                      color: isDark
                        ? appColors.whiteColor
                        : appColors.blackColor,
                    } as ViewStyle}
                    keyboardType="numeric"
                    tintColor={appColors.primary}
                    offTintColor={isDark ? appColors.darkBorder : appColors.lightGray}
                    defaultValue={otp}
                  />
                </View>

                <View style={[external.mt_28]}>
                  <Button
                    title={translateData?.verify}
                    onPress={handleVerify}
                    loading={loading}
                  />
                </View>

                <View style={[external.mb_15, external.mt_5]}>
                  <NewUserComponent
                    title={
                      resending
                        ? translateData?.resendOtp
                        : resendTimer > 0
                        ? `${translateData?.resendOtp} ${resendTimer}s`
                        : translateData?.NoOtp
                    }
                    subtitle={resendTimer === 0 && !resending ? translateData?.resendIt : null}
                    onPress={handleResendOtp}
                  />
                </View>
              </View>
            }
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}