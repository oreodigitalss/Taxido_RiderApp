import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { styles } from "./styles";
import { useValues } from "@src/utils/context/index";
import { appColors, windowHeight } from "@src/themes";
import Images from "@src/utils/images";
import { NoInternetProps } from "./type";

export function NoInternet({
  title,
  details,
  image,
  onRefresh,
}: NoInternetProps) {
  const { viewRTLStyle, isDark } = useValues();

  return (
    <View style={styles.mainContainer}>
      <Image
        source={image ?? Images.noInternet}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={[styles.mainView, { flexDirection: viewRTLStyle }]}>
        <Text
          style={[
            styles.title,
            { color: isDark ? appColors.whiteColor : appColors.primaryText },
          ]}
        >
          {title ?? "No Internet"}
        </Text>
      </View>

      <Text
        style={[
          styles.details,
          { color: isDark ? appColors.whiteColor : appColors.regularText },
        ]}
      >
        {details ?? "No Internet Available"}
      </Text>

      {onRefresh && (
        <Pressable
          accessibilityRole="button"
          onPress={onRefresh}
          style={[
            styles.refButton,
            { alignSelf: "center", marginTop: windowHeight(20) },
          ]}
        >
          <Text style={styles.refText}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
}
