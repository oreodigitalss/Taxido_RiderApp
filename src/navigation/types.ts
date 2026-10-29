

import type { ICountryCca2 } from "react-native-country-select";

export type AddLocationDetailsProps = {
  userName: string;
  countryCode: string;
  phoneNumber: number;
  email: string;
  referralID: string;
};

export type ticketDataProps = {
  value?: number;
  ticketData?: any;
};

export type OtpVerificationParams = {
  countryCode?: string;
  phoneNumber?: string;
  cca2?: ICountryCca2;
};

export type SignUpParams = {
  countryCode?: string;
  phoneNumber?: string;
  cca2?: ICountryCca2;
};

export type ChooseRiderScreen = {
  destination: string;
  stops?: any[];
  pickupLocation: string;
  service_ID: string | number;
  zoneValue: string | number;
  scheduleDate: string;
  service_category_ID: string | number;
  selectedImage?: string;
  parcelWeight?: string | number;
  pickupCoords: { lat: number; lng: number };
  destinationCoords: { lat: number; lng: number };
};

export type RideActive = {
  activeRideOTP: any;
  filteredLocations?: any[];
}

export type PromoCodeScreen = {
  from: "payment" | "wallet" | string;
  getCoupon?: (coupon: any) => void;
};


export type RootStackParamList = {
  Preferences: undefined;
  Accountverification: undefined;
  Stopover: undefined;
  EditStopOver: {
    "stopovers"?: any;
  } | undefined;
  carpoolingDate: { fieldValue?: any; categoryId?: any; categorySlug?: any } | undefined;
  EditVehicle: undefined;
  SeatSet: undefined;
  PriceSet: undefined;
  CarpoolingDetails: undefined;
  AddressChange: { rideId: string; rideDatas: any; locationIndex: number };
  EditDetails: { field: string; form: any };
  FindLocationScreen: {
    "defultAddress"?: any;
    "defultCoords"?: any;
    "destination"?: any;
    "destinationCoords"?: any;
    "latitude"?: any;
    "longitude"?: any;
    "service_ID"?: any;
    "service_category_ID"?: any;
    "service_category_slug"?: any;
    "service_name"?: any;
    "sub_category_name"?: any;
    "tripType"?: any;
  } | undefined;
  CategoryScreen: undefined;
  RideScreen: undefined;
  WalletTab: undefined;

  Splash: undefined;
  SignIn: undefined;
  OtpVerification: OtpVerificationParams;
  SignUp: SignUpParams;
  AddNewLocation: undefined;
  Notifications: undefined;
  EmptyNotification: undefined;
  HomeScreen: undefined;
  DateTimeSchedule: undefined;
  ProfileSetting: undefined;
  EditProfile: undefined;
  PromoCodeScreen: PromoCodeScreen;
  BankDetail: undefined;
  SavedLocation: {
    "formattedDate"?: any;
    "formattedTime"?: any;
    "savefield"?: any;
    "selectedLocation"?: any;
    "service_ID"?: any;
    "service_category_ID"?: any;
    "service_category_slug"?: any;
    "service_name"?: any;
  } | undefined;
  MyTabs: any;
  AppPageScreen: undefined;
  CompleteRideScreen: undefined;
  CancelRideScreen: undefined;
  PendingRideScreen: {
    "item"?: any;
    "rideStatus"?: any;
    "vehicleDetail"?: any;
  } | undefined;
  SelectRide: undefined;
  DriverDetails: undefined;
  FindingDriver: {
    "isOutstation"?: any;
  } | undefined;
  Onboarding: undefined;
  OutStation: undefined;
  LocationDrop: undefined;
  ChooseRider: undefined;
  BookRide: {
    "countinueRide"?: any;
    "countinueRideId"?: any;
    "countryCode"?: any;
    "descriptionText"?: any;
    "destination"?: any;
    "destinationCoords"?: any;
    "field"?: any;
    "filteredLocations"?: any;
    "otherContect"?: any;
    "otherName"?: any;
    "parcelWeight"?: any;
    "phoneNumber"?: any;
    "pickupCoords"?: any;
    "pickupLocation"?: any;
    "receiverName"?: any;
    "scheduleDate"?: any;
    "selectedImage"?: any;
    "service_ID"?: any;
    "service_category_ID"?: any;
    "service_category_slug"?: any;
    "service_name"?: any;
    "stops"?: any;
    "stopsCoords"?: any;
    "vehicleIdValue"?: any;
    "zoneValue"?: any;
  } | undefined;
  CancelRide: undefined;
  CancelFare: undefined;
  AddNewRider: {
    "destination"?: any;
    "pickupLocation"?: any;
    "scheduleDate"?: any;
    "service_ID"?: any;
    "service_category_ID"?: any;
    "stops"?: any;
    "zoneValue"?: any;
  } | undefined;
  OnTheWayDetails: undefined;
  DriverInfos: {
    "driverInfo"?: any;
  } | undefined;
  ChatScreen: {
    "driverId"?: any;
    "driverImage"?: any;
    "driverName"?: any;
    "from"?: any;
    "rideId"?: any;
    "riderId"?: any;
  } | undefined;
  RideActive: RideActive;
  Payment: {
    "rideId"?: any;
  } | undefined;
  Calander: {
    "DateValue"?: any;
    "TimeValue"?: any;
    "categoryId"?: any;
    "fieldValue"?: any;
    "isRental"?: any;
    "service_ID"?: any;
    "service_category_ID"?: any;
    "service_category_slug"?: any;
    "service_name"?: any;
    "startDate"?: any;
    "startTime"?: any;
  } | undefined;
  Share: undefined;
  OtpVerify: undefined;
  ResetPassword: undefined;
  SignInWithMail: undefined;
  AddLocationDetails: undefined | AddLocationDetailsProps;
  CompleteRide: undefined;
  LocationSelect: {
    "field"?: any;
    "formattedDate"?: any;
    "formattedTime"?: any;
    "screenValue"?: any;
    "service_ID"?: any;
    "service_category_ID"?: any;
    "service_category_slug"?: any;
    "service_name"?: any;
  } | undefined;
  ActiveRideScreen: undefined;
  ScheduleRideScreen: undefined;
  Rental: {
    "pickupCoords"?: any;
    "pickupLocation"?: any;
    "service_ID"?: any;
    "service_category_ID"?: any;
    "zoneValue"?: any;
  } | undefined;
  Outstation: {
    "destination"?: any;
    "destinationCoords"?: any;
    "filteredLocations"?: any;
    "pickupCoords"?: any;
    "pickupLocation"?: any;
    "scheduleDate"?: any;
    "service_ID"?: any;
    "service_category_ID"?: any;
    "service_name"?: any;
    "stops"?: any;
    "zoneValue"?: any;
  } | undefined;
  Ride: {
    "DateValue"?: any;
    "TimeValue"?: any;
    "categoryOption"?: any;
    "defultAddress"?: any;
    "defultCoords"?: any;
    "field"?: any;
    "fieldValue"?: any;
    "formattedDate"?: any;
    "formattedTime"?: any;
    "pinLatitude"?: any;
    "pinLongitude"?: any;
    "selectedAddress"?: any;
    "service_ID"?: any;
    "service_category_ID"?: any;
    "service_category_slug"?: any;
    "service_name"?: any;
  } | undefined;
  ChooseRiderScreen: ChooseRiderScreen;
  PaymentRental: {
    "rideId"?: any;
  } | undefined;
  Wallet: undefined;
  PaymentMethod: {
    "rideData"?: any;
  } | undefined;
  PromoCodeDetail: {
    "item"?: any;
  } | undefined;
  AddLocation: undefined;
  TopUpWallet: undefined;
  HomeService: {
    "itemName"?: any;
    "serviceValue"?: any;
  } | undefined;
  PaymentWebView: { url: string; selectedPaymentMethod: string; dataValue: any };
  RentalLocation: {
    "ScreenValue"?: any;
    "fieldValue"?: any;
    "formattedDate"?: any;
    "formattedTime"?: any;
    "selectedAddress"?: any;
    "service_ID"?: any;
    "service_category_ID"?: any;
    "service_category_slug"?: any;
    "service_name"?: any;
  } | undefined;
  RentalLocationSearch: undefined;
  LocationSave: {
    "locationDetails"?: any;
    "locationID"?: any;
    "mode"?: any;
  } | undefined;
  RentalBooking: {
    "DateValue"?: any;
    "TimeValue"?: any;
    "field"?: any;
    "fieldValue"?: any;
    "selectedAddress"?: any;
    "service_ID"?: any;
    "service_category_ID"?: any;
    "service_category_slug"?: any;
    "service_name"?: any;
  } | undefined;
  RentalVehicleSelect: {
    "dropCoords"?: any;
    "dropLocation"?: any;
    "endDate"?: any;
    "endTime"?: any;
    "getDriver"?: any;
    "pickUpCoords"?: any;
    "pickupLocation"?: any;
    "service_ID"?: any;
    "service_category_ID"?: any;
    "service_category_slug"?: any;
    "startDate"?: any;
    "startTime"?: any;
  } | undefined;
  CreateTicket: undefined;
  SupportTicket: undefined;
  TicketDetails: undefined | ticketDataProps;
  RentalCarDetails: {
    "convertedEndTime"?: any;
    "convertedStartTime"?: any;
    "dropCoords"?: any;
    "dropLocation"?: any;
    "endDate"?: any;
    "getDriver"?: any;
    "is_with_driver"?: any;
    "no_of_days"?: any;
    "pickUpCoords"?: any;
    "pickupLocation"?: any;
    "selectedVehicleId"?: any;
    "selectedVehicleTax"?: any;
    "service_ID"?: any;
    "service_category_ID"?: any;
    "service_category_slug"?: any;
    "startDate"?: any;
    "vehicle_type_id"?: any;
  } | undefined;
  Profile: undefined;
  NoService: undefined;
  NoInternet: any;
  AmbulanceSearch: undefined;
  BookAmbulance: {
    "lat"?: any;
    "lng"?: any;
    "location"?: any;
  } | undefined;
  AmbulancePayment: undefined;
  CarpoolingHome: undefined;
  PublishRide: undefined;
  AddVehicle: undefined;
  FindDriverHome: undefined;
  OneWaySelect: undefined;
  OneWayRideDetails: {
    "driver"?: any;
    "payload"?: any;
    "sub_category_name"?: any;
  } | undefined;
  OneWayDaily: {
    "payload"?: any;
    "results"?: any;
    "sub_category_name"?: any;
  } | undefined;
  AmbulanceHome: undefined;
  PdfViewer: {
    "pdfUrl"?: any;
    "rideNumber"?: any;
    "token"?: any;
  } | undefined;
  NoInternalServer: undefined
  ReferralList: undefined
  ReferralID: undefined;
  RideMapView: { rideData: any };
  DriverRequestScreen: undefined;
  DriverRequestDetailsScreen: { item: any };
};
