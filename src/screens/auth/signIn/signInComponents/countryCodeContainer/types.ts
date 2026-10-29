import { DimensionValue } from 'react-native';
import type { ICountryCca2 } from "react-native-country-select";

export interface CountryCodeType {
  width?: DimensionValue;
}

export interface CountryCodeContainerProps {
  countryCode?: string;
  setCountryCode?: (code: string) => void;
  phoneNumber?: string;
  setPhoneNumber?: any;
  width?: number | string;
  backGroundColor?: string;
  textBgColor?: string;
  borderColor?: string;
  borderColor1?: string;
  warning?: boolean;
  cca2?: ICountryCca2;
  setCca2?: (code: ICountryCca2) => void;

  error: any;
  setError: (val: string) => void;
};