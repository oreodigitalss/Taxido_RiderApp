import { View } from "react-native";
import React from "react";
import { useAppSelector as useSelector } from '@src/api/store/hooks';
import { AuthText } from "@src/components";

export function SignInTextContainer() {
  const { translateData } = useSelector((state: any) => state.setting);
  return (
    <View>
      <AuthText
        title={translateData?.authTitle}
        subtitle={translateData?.authDescription}
      />
    </View>
  );
}
