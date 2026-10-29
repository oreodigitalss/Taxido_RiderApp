import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { styles } from "../styles";
import { useValues } from "@src/utils/context/index";
import { appColors } from "@src/themes";
import Images from "@src/utils/images";
import { Ambulance } from "@src/utils/icons";

const { width } = Dimensions.get("window");

export function TitleRenderItem({
  item,
  index,
  selectedIndex,
  onPress,
  isScrollable,
  totalItems,
}: any) {
  const { isDark } = useValues();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUri = item?.service_category_image_url;
  const isAmbulance = item?.slug === "ambulance" || item?.service_type === "ambulance";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(item, index)}
      style={[
        styles.item,
        { width: isScrollable ? width / 4 - 6 : width / totalItems - 6 },
        selectedIndex === index && { backgroundColor: isDark ? appColors.darkPrimary : appColors.lightGreen, borderColor: appColors.primary },
      ]}
    >
      {isAmbulance ? (
        <View style={[styles.image, { alignItems: "center", justifyContent: "center" }]}>
          <Ambulance width={56} height={44} />
        </View>
      ) : <View style={{ position: "relative" }}>
        {!imageLoaded && (
          <Image
            style={styles.image}
            source={Images.imagePlaceholder}
            resizeMode="cover"
          />
        )}

        {imageUri && !imageError && (
          <Image
            style={[
              styles.image1,
              !imageLoaded && { position: "absolute", top: 0, left: 0 },
            ]}
            source={{ uri: imageUri }}
            resizeMode="contain"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
      </View>}

      <Text
        style={[
          styles.text,
          { color: isDark ? appColors.whiteColor : appColors.primaryText },
        ]}
      >
        {item.name}
      </Text>

      <View
        style={[
          styles.highlightLine,
          selectedIndex !== index && styles.invisibleLine,
        ]}
      />
    </TouchableOpacity>
  );
}
