import {
  USER_LOGIN,
  USER_REGISTRATION,
  VERIFY_OTP,
  SELF,
  USER_LOGIN_MAIL,
  SOCIAL_LOGIN,
} from "../types/index";
import {
  UserLoginInterface,
  UserRegistrationPayload,
  VerifyOtpInterface,
  UserLoginEmailInterface,
  SocialLoginInterface,
} from "../../interface/authInterface";
import { authServices } from "../../services/index";
import { createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const userLogin = createAsyncThunk(
  USER_LOGIN,
  async (data: UserLoginInterface, { rejectWithValue }) => {
    const response = await authServices.userLogin(data);
    if (!response || response.status < 200 || response.status >= 300) {
      return rejectWithValue(response?.data ?? response);
    }
    return response?.data;
  }
);


export const socialLogin = createAsyncThunk(
  SOCIAL_LOGIN,
  async (data: SocialLoginInterface, { rejectWithValue }) => {
    const response = await authServices.socialLogin(data);
    if (!response || response.status < 200 || response.status >= 300) {
      return rejectWithValue(response?.data ?? response);
    }
    return response?.data;
  }
);

export const userVerifyOtp = createAsyncThunk(
  VERIFY_OTP,
  async (data: VerifyOtpInterface, { rejectWithValue }) => {
    const response = await authServices.userVerifyOtp(data);
    if (!response || response.status < 200 || response.status >= 300) {
      return rejectWithValue(response?.data ?? response);
    }
    return response?.data;
  }
);

export const userRegistration = createAsyncThunk(
  USER_REGISTRATION,
  async (data: UserRegistrationPayload) => {
    const response = await authServices.userRegistration(data);
    if (response.status == 200) {
      return response?.data;
    } else {
      return response.data;
    }
  }
);

export const self = createAsyncThunk(SELF, async () => {
  const response = await authServices.self();
  if (response.status == 200) {
    return response?.data;
  } else {
    return response.data;
  }
});

export const userMailLogin = createAsyncThunk(
  USER_LOGIN_MAIL,
  async (data: UserLoginEmailInterface) => {
    const response = await authServices.userMailLogin(data);
    return response?.data;
  }
);





export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.removeItem("phone");
  return true;
});
