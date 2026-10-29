import { View, Text } from 'react-native'
import React from 'react'
import styles from '../../../screens/homeScreen/home/styles'
import { useAppSelector as useSelector } from '@src/api/store/hooks';
import { appColors } from '@src/themes'
import { useValues } from '@src/utils/context/index'

export function BottomTitle() {
    const { taxidoSettingData } = useSelector((state: any) => state.setting);
    const { viewRTLStyle, textRTLStyle, isDark } = useValues()
    const footerHashtag = taxidoSettingData?.cabbooking_values?.general?.footer_branding_hashtag?.replace(/taxido/gi, 'Rydap') ?? '#GoRydap';

    return (
        <View>
            <View style={styles.homeBottom}>
                <Text style={[styles.title, { textAlign: textRTLStyle }]}>{footerHashtag}</Text>
                <View style={[styles.madeByContainer, { flexDirection: viewRTLStyle }]}>
                    <Text style={[styles.madeBy, { color: isDark ? appColors.whiteColor : appColors.primaryText }]}>{taxidoSettingData?.cabbooking_values?.general?.footer_branding_attribution}</Text>
                </View>
            </View>
        </View>
    )
}

