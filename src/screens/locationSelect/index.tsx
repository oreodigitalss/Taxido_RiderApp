import { useAppRoute as useTypedScreenRoute } from '@src/utils/navigation';
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView, Keyboard } from "react-native";
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from "@react-navigation/native";
import Geolocation from "@react-native-community/geolocation";
import { Back, AddressMarker, Gps } from "@src/utils/icons";
import { appColors } from "@src/themes";
import Images from "@utils/images";
import styles from "./styles";
import { useValues } from "@src/utils/context/index";
import { external } from "@src/styles/externalStyle";
import { useAppSelector as useSelector } from '@src/api/store/hooks';
import { setValue } from "@src/utils/localstorage";
import useSmartLocation from "@src/components/helper/locationHelper";

// Define route params interface
interface RouteParams {
  field?: string;
  screenValue?: string;
  service_ID?: string;
  service_name?: string;
  service_category_ID?: string;
  service_category_slug?: string;
  formattedDate?: string;
  formattedTime?: string;
}

// Memoized components to prevent unnecessary re-renders
const BackButton = React.memo(({ onPress, isDark }: { onPress: () => void; isDark: boolean }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.backView, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor }]}
  >
    <Back />
  </TouchableOpacity>
));

const MapPointer = React.memo(({ pinImage }: { pinImage: any }) => (
  <View style={styles.pointerMarker} pointerEvents="none">
    <Image source={pinImage} style={styles.pinImage} />
  </View>
));

const AddressInput = React.memo(({
  fetchingAddress,
  currentAddress,
  query,
  searching,
  inputRef,
  onFocus,
  onChangeText,
  onCancel,
  isDark,
  viewRTLStyle,
}: {
  fetchingAddress: boolean;
  currentAddress: string;
  query: string;
  searching: boolean;
  inputRef: React.RefObject<TextInput | null>;
  onFocus: () => void;
  onChangeText: (text: string) => void;
  onCancel: () => void;
  isDark: boolean;
  viewRTLStyle: "row" | "row-reverse";
}) => (
  <TouchableOpacity
    activeOpacity={1}
    onPress={() => inputRef.current?.focus()}
    style={[styles.textInputContainer, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor, flexDirection: viewRTLStyle }]}
  >
    <View style={[styles.addressBtnView, { backgroundColor: isDark ? appColors.bgDark : appColors.lightGray }]}>
      <AddressMarker />
    </View>
    <TextInput
      ref={inputRef}
      style={[styles.textInput, { color: isDark ? appColors.whiteColor : appColors.blackColor }]}
      value={searching ? query : fetchingAddress && !currentAddress ? "Locating..." : currentAddress}
      placeholder="Tap to search or move map to select location"
      placeholderTextColor={isDark ? appColors.lightGray : appColors.regularText}
      editable
      onFocus={onFocus}
      onChangeText={onChangeText}
      multiline
    />
    {searching && (
      <TouchableOpacity onPress={onCancel} style={styles.cancelSearchButton}>
        <Text style={[styles.cancelSearchText, { color: appColors.primary }]}>Cancel</Text>
      </TouchableOpacity>
    )}
  </TouchableOpacity>
));

const ConfirmButton = React.memo(({
  onPress,
  fetchingAddress,
  loadingMap,
  currentAddress,
  searching,
  translateData
}: {
  onPress: () => void;
  fetchingAddress: boolean;
  loadingMap: boolean;
  currentAddress: string;
  searching: boolean;
  translateData: any;
}) => (
  <TouchableOpacity
    style={styles.confirmButton}
    onPress={onPress}
    disabled={fetchingAddress || loadingMap || searching || !currentAddress}
    activeOpacity={0.8}
  >
    {fetchingAddress ? (
      <ActivityIndicator size="large" color={appColors.whiteColor} />
    ) : (
      <Text style={styles.confirmText}>{translateData.confirmLocation || "Confirm Location"}</Text>
    )}
  </TouchableOpacity>
));

export function LocationSelect() {
  const { isDark, viewRTLStyle, Google_Map_Key } = useValues();
  const webViewRef = useRef<WebView<{}>>(null);
  const searchInputRef = useRef<TextInput>(null);
  const navigation = useNavigation();
  const route = useTypedScreenRoute<'LocationSelect'>();
  const { field, screenValue, service_ID, service_name, service_category_ID, service_category_slug, formattedDate, formattedTime } = (route.params || {}) as RouteParams;
  const { currentLatitude, currentLongitude } = useSmartLocation();
  const [initialCoords, setInitialCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapCenterCoords, setMapCenterCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentAddress, setCurrentAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    address: string;
    latitude: number;
    longitude: number;
  }>>([]);
  const [searching, setSearching] = useState(false);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [loadingMap, setLoadingMap] = useState(true);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitializedMapRef = useRef(false);
  const hasReceivedGpsRef = useRef(false);
  const hasManualSelectionRef = useRef(false);
  const addressRequestIdRef = useRef(0);
  const searchRequestIdRef = useRef(0);
  const programmaticCenterRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const { translateData, taxidoSettingData } = useSelector((state: any) => state.setting);
  const mapType = taxidoSettingData?.cabbooking_values?.location?.map_provider;

  useEffect(() => {
    if (
      !hasReceivedGpsRef.current &&
      currentLatitude != null &&
      currentLongitude != null
    ) {
      hasReceivedGpsRef.current = true;
      if (hasManualSelectionRef.current) return;
      hasInitializedMapRef.current = true;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      addressRequestIdRef.current += 1;
      const coords = { latitude: currentLatitude, longitude: currentLongitude };
      setInitialCoords(coords);
      setMapCenterCoords(coords);
      setCurrentAddress("");
      setAddressError("");
      setFetchingAddress(true);
      setLoadingMap(false);
    }
  }, [currentLatitude, currentLongitude]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasInitializedMapRef.current) return;
      hasInitializedMapRef.current = true;
      const fallbackCoords = { latitude: 37.78825, longitude: -122.4324 };
      setInitialCoords(fallbackCoords);
      setMapCenterCoords(fallbackCoords);
      setFetchingAddress(true);
      setLoadingMap(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const fetchAddress = useCallback(async (lat: number, lng: number, requestId: number) => {
    if (!Google_Map_Key) {
      if (requestId === addressRequestIdRef.current) {
        setAddressError("Location search is unavailable.");
        setFetchingAddress(false);
      }
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${encodeURIComponent(Google_Map_Key)}`
      );
      const json = await response.json();

      if (requestId !== addressRequestIdRef.current) return;

      if (json.status === "OK" && json.results?.length > 0 && json.results[0]?.formatted_address) {
        setCurrentAddress(json.results[0].formatted_address);
        setAddressError("");
      } else {
        setCurrentAddress("");
        setAddressError("Could not find an address for this location.");
      }
    } catch {
      if (requestId === addressRequestIdRef.current) {
        console.error("[fetchAddress] Failed to fetch address.");
        setCurrentAddress("");
        setAddressError("Could not connect to the address service.");
      }
    } finally {
      if (requestId === addressRequestIdRef.current) setFetchingAddress(false);
    }
  }, [Google_Map_Key]);

  useEffect(() => {
    if (!mapCenterCoords || currentAddress || !fetchingAddress) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const requestId = addressRequestIdRef.current;
    debounceTimerRef.current = setTimeout(() => {
      fetchAddress(mapCenterCoords.latitude, mapCenterCoords.longitude, requestId);
    }, 600);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [mapCenterCoords, currentAddress, fetchingAddress, fetchAddress]);

  const startSearch = useCallback(() => {
    if (searching) return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    hasManualSelectionRef.current = true;
    searchRequestIdRef.current += 1;
    setSearching(true);
    setSearchQuery("");
    setSearchError("");
    setSearchResults([]);
    setSearchingPlaces(false);
  }, [searching]);

  const cancelSearch = useCallback(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchRequestIdRef.current += 1;
    setSearching(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
    setSearchingPlaces(false);
    Keyboard.dismiss();
    searchInputRef.current?.blur();
  }, []);

  const searchLocations = useCallback(async (query: string, requestId: number) => {
    if (!Google_Map_Key) {
      if (requestId === searchRequestIdRef.current) {
        setSearchError("Location search is unavailable.");
        setSearchingPlaces(false);
      }
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${encodeURIComponent(Google_Map_Key)}`
      );
      const json = await response.json();

      if (requestId !== searchRequestIdRef.current) return;

      if (json.status !== "OK" || !Array.isArray(json.results)) {
        setSearchResults([]);
        setSearchError("No matching locations found.");
        return;
      }

      const results = json.results.flatMap((result: any, index: number) => {
        const latitude = Number(result?.geometry?.location?.lat);
        const longitude = Number(result?.geometry?.location?.lng);
        if (
          !result?.formatted_address ||
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          return [];
        }
        return [{
          id: result.place_id || `${latitude},${longitude},${index}`,
          address: result.formatted_address,
          latitude,
          longitude,
        }];
      });

      const visibleResults = results.slice(0, 5);
      setSearchResults(visibleResults);
      setSearchError(visibleResults.length ? "" : "No matching locations found.");
    } catch {
      if (requestId === searchRequestIdRef.current) {
        console.error("[searchLocations] Failed to search locations.");
        setSearchResults([]);
        setSearchError("Could not connect to the location search service.");
      }
    } finally {
      if (requestId === searchRequestIdRef.current) setSearchingPlaces(false);
    }
  }, [Google_Map_Key]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setSearchResults([]);
    setSearchError("");
    setSearchingPlaces(false);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    const requestId = ++searchRequestIdRef.current;

    if (query.trim().length < 3) {
      setSearchingPlaces(false);
      return;
    }

    setSearchingPlaces(true);
    searchTimerRef.current = setTimeout(() => {
      searchLocations(query.trim(), requestId);
    }, 450);
  }, [searchLocations]);

  const selectLocation = useCallback((coords: { latitude: number; longitude: number }, address: string) => {
    hasManualSelectionRef.current = true;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    addressRequestIdRef.current += 1;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchRequestIdRef.current += 1;
    programmaticCenterRef.current = coords;
    setMapCenterCoords(coords);
    setCurrentAddress(address);
    setAddressError("");
    setFetchingAddress(false);
    setSearching(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
    setSearchingPlaces(false);
    Keyboard.dismiss();
    searchInputRef.current?.blur();
    webViewRef.current?.injectJavaScript(
      `window.__pendingMapCenter = { lat: ${coords.latitude}, lng: ${coords.longitude} }; if (window.moveMapTo) { window.moveMapTo(${coords.latitude}, ${coords.longitude}); window.__pendingMapCenter = null; } true;`
    );
  }, []);

  const handleSelectSearchResult = useCallback((result: {
    address: string;
    latitude: number;
    longitude: number;
  }) => {
    selectLocation(
      { latitude: result.latitude, longitude: result.longitude },
      result.address,
    );
  }, [selectLocation]);

  const handleCurrentLocation = useCallback(() => {
    setLoadingCurrentLocation(true);
    Geolocation.getCurrentPosition(
      position => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) {
          setLoadingCurrentLocation(false);
          Alert.alert("Location unavailable", "Could not determine your current location.");
          return;
        }
        selectLocation(coords, "");
        setFetchingAddress(true);
        setCurrentAddress("");
        setLoadingCurrentLocation(false);
      },
      error => {
        console.warn("[LocationSelect] Unable to get current location:", error.message);
        setLoadingCurrentLocation(false);
        Alert.alert("Location unavailable", "Could not get your current location. Check location permissions and try again.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, [selectLocation]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event?.nativeEvent?.data);
      if (data?.type !== "mapMove") return;
      const lat = Number(data?.payload?.lat);
      const lng = Number(data?.payload?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return;

      const expectedCenter = programmaticCenterRef.current;
      if (
        expectedCenter &&
        Math.abs(expectedCenter.latitude - lat) < 0.0001 &&
        Math.abs(expectedCenter.longitude - lng) < 0.0001
      ) {
        programmaticCenterRef.current = null;
        return;
      }

      programmaticCenterRef.current = null;
      hasManualSelectionRef.current = true;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      addressRequestIdRef.current += 1;
      setMapCenterCoords({ latitude: lat, longitude: lng });
      setCurrentAddress("");
      setAddressError("");
      setFetchingAddress(true);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchRequestIdRef.current += 1;
      setSearching(false);
      setSearchQuery("");
      setSearchResults([]);
      setSearchError("");
      Keyboard.dismiss();
    } catch (error) {
      console.warn("[LocationSelect] Ignoring invalid map event:", error);
    }
  }, []);

  const handleConfirmLocation = useCallback(async () => {
    if (!currentAddress || !mapCenterCoords || fetchingAddress || searching || addressError) {
      Alert.alert(translateData.locationNotReady, translateData.locationDescription);
      return;
    }
    if (screenValue === "HomeScreen") {
      await setValue('user_latitude_Selected', mapCenterCoords?.latitude.toString());
      await setValue('user_longitude_Selected', mapCenterCoords?.longitude.toString());
      (navigation as any).replace("MyTabs");
      return;
    }
    (navigation as any).navigate(screenValue, {
      selectedAddress: currentAddress,
      fieldValue: field,
      pinLatitude: mapCenterCoords?.latitude,
      pinLongitude: mapCenterCoords?.longitude,
      service_ID,
      service_name,
      service_category_ID,
      service_category_slug,
      formattedDate,
      formattedTime,
    });
  }, [currentAddress, mapCenterCoords, fetchingAddress, searching, addressError, screenValue, field, navigation, service_ID, service_name, service_category_ID, service_category_slug, formattedDate, formattedTime, translateData]);

  const getMapHTML = useCallback((coords: { latitude: number; longitude: number }, mapType: string, isDark: boolean) => {
    if (mapType === 'osm') {
      const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      const lightTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const tileUrl = isDark ? darkTileUrl : lightTileUrl;

      return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
          <style>
            body, html, #map {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
              background-color: ${isDark ? appColors.blackColor : appColors.whiteColor};
            }
          </style>
      </head>
      <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
          <script>
              function initMap() {
                  const map = L.map('map', {
                      center: [${coords?.latitude}, ${coords?.longitude}],
                      zoom: 16,
                      zoomControl: false
                  });

                  L.tileLayer('${tileUrl}', {
                      attribution: '© OpenStreetMap contributors'
                  }).addTo(map);

                  map.on('dragend', function() {
                      const center = map.getCenter();
                      const message = {
                          type: 'mapMove',
                          payload: { lat: center.lat, lng: center.lng }
                      };
                      window.ReactNativeWebView.postMessage(JSON.stringify(message));
                  });

                  window.moveMapTo = function(lat, lng) {
                      map.setView([lat, lng], map.getZoom(), { animate: false });
                  };
                  if (window.__pendingMapCenter) {
                      window.moveMapTo(window.__pendingMapCenter.lat, window.__pendingMapCenter.lng);
                      window.__pendingMapCenter = null;
                  }
              }
              initMap();
          </script>
      </body>
      </html>
    `;
    }

    // Google Maps implementation (existing code)
    const darkTheme = [
      { elementType: "geometry", stylers: [{ color: "#212121" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
      {
        featureType: "administrative",
        elementType: "geometry",
        stylers: [{ color: "#757575" }]
      },
      {
        featureType: "poi",
        elementType: "geometry",
        stylers: [{ color: "#282828" }]
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#181818" }]
      },
      {
        featureType: "road",
        elementType: "geometry.fill",
        stylers: [{ color: "#2c2c2c" }]
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#8a8a8a" }]
      },
      {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f2f2f" }]
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#000000" }]
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#3d3d3d" }]
      }
    ];

    const mapThemeStyles = isDark ? darkTheme : [];
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body, html, #map {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            background-color: ${isDark ? "#000" : "#fff"};
          }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            function initMap() {
                const map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat: ${coords?.latitude}, lng: ${coords?.longitude} },
                    zoom: 16,
                    disableDefaultUI: true,
                    styles: ${JSON.stringify(mapThemeStyles)}
                });

                map.addListener('dragend', () => {
                    const center = map.getCenter();
                    const message = {
                        type: 'mapMove',
                        payload: { lat: center.lat(), lng: center.lng() }
                    };
                    window.ReactNativeWebView.postMessage(JSON.stringify(message));
                });

                window.moveMapTo = function(lat, lng) {
                    map.setCenter({ lat: lat, lng: lng });
                };
                if (window.__pendingMapCenter) {
                    window.moveMapTo(window.__pendingMapCenter.lat, window.__pendingMapCenter.lng);
                    window.__pendingMapCenter = null;
                }
            }
        </script>
        <script async defer src="https://maps.googleapis.com/maps/api/js?key=${Google_Map_Key}&callback=initMap"></script>
    </body>
    </html>
  `;
  }, [Google_Map_Key]);

  // Memoize the WebView source to prevent unnecessary reloads
  const webViewSource = useMemo(() => {
    return initialCoords ? { html: getMapHTML(initialCoords, mapType, isDark) } : { html: '' };
  }, [initialCoords, getMapHTML, mapType, isDark]);

  // Memoize loading state component
  const loadingComponent = useMemo(() => (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color={appColors.primary} />
    </View>
  ), []);

  return (
    <View style={external.main}>
      <BackButton onPress={() => navigation.goBack()} isDark={isDark} />

      {loadingMap ? (
        loadingComponent
      ) : initialCoords ? (
        <>
          <WebView<{}>
            ref={webViewRef}
            style={styles.mapView}
            source={webViewSource}
            onMessage={handleWebViewMessage}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          />
          <MapPointer pinImage={Images.pin} />
        </>
      ) : (
        loadingComponent
      )}

      <AddressInput
        fetchingAddress={fetchingAddress}
        currentAddress={currentAddress}
        query={searchQuery}
        searching={searching}
        inputRef={searchInputRef}
        onFocus={startSearch}
        onChangeText={handleSearchChange}
        onCancel={cancelSearch}
        isDark={isDark}
        viewRTLStyle={viewRTLStyle}
      />

      {searching && (
        <View style={[styles.searchResults, { backgroundColor: isDark ? appColors.darkPrimary : appColors.whiteColor }]}>
          {searchingPlaces ? (
            <View style={styles.searchStatus}>
              <ActivityIndicator size="small" color={appColors.primary} />
              <Text style={[styles.searchStatusText, { color: isDark ? appColors.whiteColor : appColors.regularText }]}>Searching locations...</Text>
            </View>
          ) : searchError ? (
            <Text style={[styles.searchStatusText, { color: isDark ? appColors.whiteColor : appColors.regularText }]}>{searchError}</Text>
          ) : searchResults.length ? (
            <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {searchResults.map(result => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.searchResult}
                  onPress={() => handleSelectSearchResult(result)}
                >
                  <Text style={[styles.searchResultText, { color: isDark ? appColors.whiteColor : appColors.blackColor }]}>
                    {result.address}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={[styles.searchStatusText, { color: isDark ? appColors.whiteColor : appColors.regularText }]}>
              Enter at least 3 characters to search.
            </Text>
          )}
        </View>
      )}

      {addressError && !searching && (
        <Text style={styles.addressError}>{addressError}</Text>
      )}

      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={handleCurrentLocation}
        disabled={loadingCurrentLocation}
        activeOpacity={0.8}
      >
        {loadingCurrentLocation ? (
          <ActivityIndicator size="small" color={appColors.primary} />
        ) : (
          <Gps width={20} height={20} />
        )}
        <Text style={styles.currentLocationText}>Current location</Text>
      </TouchableOpacity>

      <ConfirmButton
        onPress={handleConfirmLocation}
        fetchingAddress={fetchingAddress}
        loadingMap={loadingMap}
        currentAddress={currentAddress}
        searching={searching}
        translateData={translateData}
      />
    </View>
  );
}