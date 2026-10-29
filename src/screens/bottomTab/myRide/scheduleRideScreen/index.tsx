import { ScrollView, View } from 'react-native';
import React from 'react';
import {Header} from '@src/commonComponent';
import RideContainer from '../rideContainer';
import { external } from '../../../../styles/externalStyle';
import {ScheduleDetails} from './scheduleDetails/index';
import { appColors } from '@src/themes'; 
import { useAppSelector as useSelector } from '@src/api/store/hooks';

export function ScheduleRideScreen() {
    const { translateData } = useSelector((state) => state.setting);

    return (
        <Header
            value={translateData.scheduleRide}
            container={
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[external.Pb_80]}>
                    <RideContainer mapShow={true} status={'● Scheduled'} color={appColors.scheduleColor} />
                    <View style={[external.mt_10]}>
                        <ScheduleDetails />
                    </View>
                </ScrollView>
            }
        />
    );
};
