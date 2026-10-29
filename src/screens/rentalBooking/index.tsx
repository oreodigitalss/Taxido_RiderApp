import { useAppRoute as useTypedScreenRoute } from '@src/utils/navigation';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Button, Header, notificationHelper, SwitchComponent } from '@src/commonComponent';
import { appColors, appFonts, fontSizes, windowHeight, windowWidth } from '@src/themes';
import { Clock, Gps } from '@src/utils/icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { rentalvehicleRequest } from '@src/api/store/actions';
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from '@src/api/store/hooks';
import styles from './styles';
import { useValues } from '@src/utils/context/index';
import { external } from '@src/styles/externalStyle';
import { Calender1 } from '@src/assets/icons/calender1';
import { getValue } from '@src/utils/localstorage';
import { AppDispatch } from '@src/api/store';
import { RentalVehicleDiscoveryRequest } from '@src/api/interface/rentalinterface';

const parseRentalDateTime = (dateValue: string, timeValue: string) => {
  const [dayText, monthText, yearText] = (dateValue || '').split(' ');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const day = Number(dayText);
  const month = monthNames.indexOf(monthText);
  const year = Number(yearText);
  const timeMatch = (timeValue || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!day || month < 0 || !year || !timeMatch) return null;

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const period = timeMatch[3].toUpperCase();
  if (hours < 1 || hours > 12 || minutes > 59) return null;
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const parsed = new Date(year, month, day, hours, minutes);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month ||
    parsed.getDate() !== day
  ) return null;
  return parsed;
};

export function RentalBooking() {
  const [toggle, setToggle] = useState(false);
  const [getDriver, setGetDriver] = useState(false);
  const { navigate } = useNavigation<any>();
  const route = useTypedScreenRoute<'RentalBooking'>();
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [pickupLocation, setPickUpLocation] = useState<string>();
  const [dropLocation, setDropLocation] = useState<string>();
  const [pickUpCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(true);
  const { linearColorStyle, textColorStyle, viewRTLStyle, textRTLStyle, bgContainer, isDark, Google_Map_Key } = useValues();
  const { DateValue, TimeValue, field, service_category_ID, service_category_slug, service_name, service_ID }: any = route.params || {};
  const { selectedAddress, fieldValue }: any = route.params || {};
  const { translateData } = useSelector(state => state.setting);
  const [findLoading, setFindLoading] = useState(false);
  const [errors, setErrors] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    invalidRange: '',
    pickupLocation: '',
    dropLocation: '',
  });
  const [onFocus, setOnFocus] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null);
  const pickupLocationRef = useRef<TextInput>(null);

  useEffect(() => {
    if (field === 'startTime') {
      setStartDate(DateValue);
      setStartTime(TimeValue);
    } else if (field === 'endTime') {
      setEndDate(DateValue);
      setEndTime(TimeValue);
    }
  }, [DateValue, TimeValue, field]);

  // Clear end date if start date is changed to be after current end date
  useEffect(() => {
    if (startDate && endDate) {
      const start = parseRentalDateTime(startDate, startTime);
      const end = parseRentalDateTime(endDate, endTime);
      if (start && end && end <= start) {
        setEndDate('');
        setEndTime('');
      }
    }
  }, [startDate, startTime, endDate, endTime]);

  const handleToggle = () => {
    setToggle(prevToggle => !prevToggle);
  };

  const handleToggleDriver = () => {
    setGetDriver(prevToggle => !prevToggle);
  };


  const gotoCalander = (value: any) => {
    navigate('Calander', {
      fieldValue: value,
      startDate: startDate,
      startTime: startTime,
      service_name: service_name,
      service_ID: service_ID,
      service_category_ID: service_category_ID,
      service_category_slug: service_category_slug,
      isRental: true
    });
  };

  const geocodeAddress = async (address: any) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address,
        )}&key=${Google_Map_Key}`,
      );
      const dataMap = await response.json();
      if (dataMap.results?.length > 0) {
        const location = dataMap.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
        };
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
    return null;
  };

  useEffect(() => {
    if (fieldValue === "pickupLocation") {
      setPickUpLocation(selectedAddress);
    } else if (fieldValue === "destination") {
      setDropLocation(selectedAddress);
    }
  }, [selectedAddress, fieldValue]);

  // Auto-focus pickup location field if empty on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!pickupLocation && pickupLocationRef.current) {
        pickupLocationRef.current.focus();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const pickup = await geocodeAddress(pickupLocation);
        setPickupCoords(pickup);
        const drop = await geocodeAddress(dropLocation);
        setDropCoords(drop);
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, [pickupLocation, dropLocation]);

  useEffect(() => {
    setErrors(prevErrors => ({
      ...prevErrors,
      startDate: startDate ? '' : prevErrors.startDate,
      startTime: startTime ? '' : prevErrors.startTime,
      endDate: endDate ? '' : prevErrors.endDate,
      endTime: endTime ? '' : prevErrors.endTime,
      pickupLocation: pickupLocation ? '' : prevErrors.pickupLocation,
      dropLocation: dropLocation ? '' : prevErrors.dropLocation,
    }));
  }, [startDate, startTime, endDate, endTime, dropLocation]);

  const findCar = async () => {
    const token = await getValue('token');
    if (!token) {
      setFindLoading(false);
      navigate('SignIn');
      return;
    }

    setFindLoading(true);
    let newErrors = {
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      invalidRange: '',
      pickupLocation: '',
      dropLocation: '',
    };

    let hasError = false;

    if (!pickupLocation) {
      newErrors.pickupLocation = "Please Enter Pickup Location"
      hasError = true;
    }

    if (toggle && !dropLocation) {
      newErrors.dropLocation = "Please Enter Drop Location"
      hasError = true;
    }

    if (!startDate) {
      newErrors.startDate = 'Select Date';
      hasError = true;
    }

    if (!startTime) {
      newErrors.startTime = 'Select Time';
      hasError = true;
    }

    if (!endDate) {
      newErrors.endDate = translateData.selectAnEndDate;
      hasError = true;
    }

    if (!endTime) {
      newErrors.endTime = translateData.selectAnEndTime;
      hasError = true;
    }
    if (startDate && startTime && endDate && endTime) {
      const start = parseRentalDateTime(startDate, startTime);
      const end = parseRentalDateTime(endDate, endTime);
      if (!start || !end || end <= start) {
        newErrors.invalidRange = "End Date & Time must be after start time";
        hasError = true;
      }
    }

    setErrors(newErrors);
    if (hasError) {
      setFindLoading(false);
      return;
    }
    try {
      const pickup = await geocodeAddress(pickupLocation);

      if (pickup) {
        const destination = toggle
          ? await geocodeAddress(dropLocation)
          : pickup;
        if (!destination) {
          throw new Error('Could not resolve the destination address. Please select it again.');
        }

        const serviceId = Number(service_ID);
        const serviceCategoryId = Number(service_category_ID);
        if (!Number.isInteger(serviceId) || serviceId <= 0 || !Number.isInteger(serviceCategoryId) || serviceCategoryId <= 0) {
          throw new Error('Rental service configuration is missing. Please contact support.');
        }
        const payload: RentalVehicleDiscoveryRequest = {
          locations: [
            {
              lat: pickup?.lat,
              lng: pickup?.lng,
            },
          ],
          service_id: serviceId,
          service_category_id: serviceCategoryId,
        };

        await dispatch(rentalvehicleRequest(payload)).unwrap();
        setPickupCoords(pickup);
        setDropCoords(destination);
        setFindLoading(false);
        navigate('RentalVehicleSelect', {
          startDate,
          pickUpCoords: pickup,
          pickupLocation,
          dropLocation: toggle ? dropLocation : pickupLocation,
          dropCoords: destination,
          service_ID: serviceId,
          service_category_ID: serviceCategoryId,
          service_category_slug,
          endDate,
          startTime,
          endTime,
          getDriver,
        });
      } else {
        throw new Error('Could not resolve the pickup address. Please select it again.');
      }
    } catch (error) {
      setFindLoading(false);
      notificationHelper(
        '',
        error instanceof Error ? error.message : translateData.unexpectedError,
        'error',
      );
    }
  };
  const handleFocus = (id: number) => {
    if (id === 1) {
      setActiveField("pickupLocation");
    } else if (id === 2) {
      setActiveField("destination");
    }
  };

  const gotoSelection = () => {
    setOnFocus(false)
    navigate("LocationSelect", { field: activeField, screenValue: "RentalBooking", service_ID: service_ID, service_name: service_name, service_category_ID: service_category_ID, service_category_slug: service_category_slug, formattedDate: DateValue, formattedTime: TimeValue });
  };


  function formatStartDate(dateStr: any) {
    if (!dateStr) return "Select Date";
    const parts = dateStr.split(" ");
    if (parts?.length < 3) return "Select Date";
    const [day, month, year] = parts;
    const shortMonth = month.slice(0, 3);
    const shortYear = year.slice(-2);
    return `${day},${shortMonth},${shortYear}`;
  }

  const formatted = formatStartDate(startDate);
  const formattedEndDate = formatStartDate(endDate);




  return (
    <View style={external.main}>
      <View style={[{ flex: 1 }, { backgroundColor: linearColorStyle }]}>
        <Header value={translateData.rentalRide} />
        <View style={styles.inputMainView}>

          <View style={{ marginTop: windowHeight(10) }}>
            <Text style={{ color: isDark ? appColors.whiteColor : appColors.blackColor }}>{translateData.pickupLocation}</Text>
            <TextInput
              ref={pickupLocationRef}
              placeholder={translateData.enterPickupLocation}
              placeholderTextColor={
                isDark ? appColors.darkText : appColors.regularText
              }
              value={pickupLocation}
              onChangeText={text => {
                setPickUpLocation(text);
                if (text.trim() === '') {
                  setErrors(prev => ({
                    ...prev,
                    pickupLocation: translateData.pleaseEnterAPickupLocation,
                  }));
                } else {
                  setErrors(prev => ({ ...prev, pickupLocation: '' }));
                }
              }}
              onFocus={() => {
                handleFocus(1);
              }}
              style={{
                borderWidth: 1, height: windowHeight(40), paddingHorizontal: windowWidth(18), marginTop: windowHeight(10), borderColor: isDark ? appColors.darkBorder : appColors.border,
                backgroundColor: bgContainer, fontFamily: appFonts.regular, borderRadius: windowHeight(4), color: isDark ? appColors.darkText : appColors.regularText
              }}
            />
          </View>

          {toggle && (
            <View style={{ marginTop: windowHeight(10) }}>
              <Text>{translateData.dropoffLocation}</Text>
              <TextInput
                placeholder={translateData.dropLocation}
                placeholderTextColor={
                  isDark ? appColors.darkText : appColors.regularText
                }
                value={dropLocation}
                onChangeText={text => {
                  setDropLocation(text);
                  if (text.trim() === '') {
                    setErrors(prev => ({
                      ...prev,
                      dropLocation: "error"
                    }));
                  } else {
                    setErrors(prev => ({ ...prev, dropLocation: '' }));
                  }
                }}
                onFocus={() => {
                  handleFocus(2);
                }}
                style={{ borderWidth: 1, height: windowHeight(40), paddingHorizontal: windowWidth(18), marginTop: windowHeight(10), borderColor: isDark ? appColors.darkBorder : appColors.border, backgroundColor: appColors.whiteColor, fontFamily: appFonts.regular, borderRadius: windowHeight(4) }}

              />
            </View>
          )}
          <View style={[styles.dropView, { flexDirection: viewRTLStyle }]}>
            <Text
              style={{
                color: textColorStyle,
                fontFamily: appFonts.medium,
              }}>
              {translateData.dropLocations}
            </Text>
            <SwitchComponent
              Enable={toggle}
              onPress={handleToggle}>
            </SwitchComponent>
          </View>
          <TouchableOpacity onPress={gotoSelection} style={{ backgroundColor: bgContainer, flexDirection: 'row', paddingVertical: windowHeight(12), paddingHorizontal: windowWidth(15), borderRadius: windowHeight(4), borderWidth: 1, borderColor: isDark ? appColors.darkBorder : appColors.border, marginTop: windowHeight(10) }} activeOpacity={0.8}>
            <Gps />
            <Text style={{ marginHorizontal: windowWidth(10), fontFamily: appFonts.medium, color: isDark ? appColors.regularText : appColors.regularText }}>{translateData?.locateonMap}</Text>
          </TouchableOpacity>
          <View
            style={[
              styles.datetimeView,
              { backgroundColor: bgContainer },
              { borderColor: isDark ? appColors.darkBorder : appColors.border },
            ]}>
            <Text
              style={[
                styles.datetimeText,
                { textAlign: textRTLStyle },
                { color: textColorStyle },
              ]}>
              {translateData.startTimedate}
            </Text>

            <View style={[styles.row, { flexDirection: viewRTLStyle }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => gotoCalander('startTime')}
                style={[
                  styles.clockBtn,
                  { flexDirection: viewRTLStyle },
                  { backgroundColor: linearColorStyle },
                  { borderColor: isDark ? appColors.bgDark : appColors.border },
                ]}>
                <View style={styles.paddingHr}>
                  <Calender1 />
                </View>
                <TextInput
                  placeholder={translateData.selectDate}
                  placeholderTextColor={
                    isDark ? appColors.darkText : appColors.regularText
                  }
                  style={[
                    styles.timeText,
                    {
                      color: isDark
                        ? appColors.regularText
                        : appColors.regularText,
                    },
                  ]}
                  editable={false}
                  value={formatted}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => gotoCalander('startTime')}
                style={[
                  styles.clockBtn,
                  { flexDirection: viewRTLStyle },
                  { backgroundColor: linearColorStyle },
                  { borderColor: isDark ? appColors.bgDark : appColors.border },
                ]}>
                <View style={styles.calenderView}>
                  <Clock color={appColors.regularText} />

                </View>
                <TextInput
                  placeholder={translateData.selectTime}

                  placeholderTextColor={
                    isDark ? appColors.regularText : appColors.regularText
                  }
                  style={[
                    styles.timeText,
                    {
                      color: isDark
                        ? appColors.regularText
                        : appColors.regularText,
                    },
                  ]}
                  editable={false}
                  pointerEvents="none"
                  value={startTime}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: viewRTLStyle,
                marginTop: windowHeight(11),
              }}>
              {errors.startDate ? (
                <Text style={{
                  color: appColors.textRed, fontSize: fontSizes.FONT14SMALL

                }}>
                  {errors.startDate}
                </Text>
              ) : (
                ''
              )}
              {errors.startTime ? (
                <Text
                  style={{
                    color: appColors.textRed,
                    paddingHorizontal: '35%',
                    fontSize: fontSizes.FONT14SMALL

                  }}>
                  {errors.startTime}
                </Text>
              ) : (
                ''
              )}
            </View>
            <Text
              style={[
                styles.datetimeText,
                { textAlign: textRTLStyle },
                { color: textColorStyle },
                { marginTop: windowHeight(18) },
              ]}>
              {translateData.endTimedate}
            </Text>
            <View
              style={{
                flexDirection: viewRTLStyle,
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (!startDate) {
                    notificationHelper("", translateData.startDateValidation, 'error');
                    return;
                  }
                  gotoCalander('endTime');
                }}
                style={[
                  styles.clockBtn,
                  { flexDirection: viewRTLStyle },
                  { backgroundColor: linearColorStyle },
                  { borderColor: isDark ? appColors.bgDark : appColors.border },
                ]}>
                <View style={styles.paddingHr}>
                  <Calender1 />
                </View>
                <TextInput
                  placeholder={translateData.selectDate}
                  placeholderTextColor={
                    isDark ? appColors.regularText : appColors.regularText
                  }
                  style={[
                    styles.timeText,
                    {
                      color: isDark
                        ? appColors.regularText
                        : appColors.regularText,
                    },
                  ]}
                  editable={false}
                  value={formattedEndDate}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (!startDate) {
                    notificationHelper("", translateData.startDateValidation, 'error');
                    return;
                  }
                  gotoCalander('endTime');
                }}
                style={[
                  styles.clockBtn,
                  { flexDirection: viewRTLStyle },
                  { backgroundColor: linearColorStyle },
                  { borderColor: isDark ? appColors.bgDark : appColors.border },
                ]}>
                <View style={styles.calenderView}>

                  <Clock color={appColors.regularText} />
                </View>
                <TextInput

                  placeholder={translateData.selectTime}
                  placeholderTextColor={
                    isDark ? appColors.regularText : appColors.regularText
                  }
                  style={[
                    styles.timeText,
                    {
                      color: isDark
                        ? appColors.regularText
                        : appColors.regularText,
                    },
                  ]}
                  editable={false}
                  value={endTime}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: viewRTLStyle,
                marginTop: windowHeight(11.5),
              }}>
              {errors.startDate || errors.invalidRange ? (
                <Text style={{
                  color: appColors.textRed, fontSize: fontSizes.FONT14SMALL
                }}>
                  {errors.startDate ? errors.startDate : errors.invalidRange}
                </Text>
              ) : (
                ''
              )}
              {errors.startTime ? (
                <Text
                  style={{
                    color: appColors.textRed,
                    paddingHorizontal: '35%',
                    fontSize: fontSizes.FONT14SMALL
                  }}>
                  {errors.startTime}
                </Text>
              ) : (
                ''
              )}
            </View>
          </View>
          <View
            style={[
              styles.tripMainView,
              { flexDirection: viewRTLStyle },
              { backgroundColor: bgContainer },
              { borderColor: isDark ? appColors.darkBorder : appColors.border },
            ]}>
            <View style={styles.tripSubView}>
              <Text style={[styles.tripText, { textAlign: textRTLStyle }]}>
                {translateData.getDriver}
              </Text>
              <Text style={[styles.noDriverText, { textAlign: textRTLStyle }]}>
                {translateData.getDriverCar}
              </Text>
            </View>
            <View style={styles.switchView}>
              <SwitchComponent
                Enable={getDriver}
                onPress={handleToggleDriver}></SwitchComponent>
            </View>
          </View>
        </View>
        <View style={styles.FindView}>
          <Button
            width={'91%'}
            title={translateData.findNow}
            onPress={findCar}
            loading={findLoading}
          />
        </View>
      </View>
    </View>
  );
}
