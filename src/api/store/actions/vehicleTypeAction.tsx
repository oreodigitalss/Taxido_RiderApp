import { VEHICLE_TYPE, ALL_VEHICLE } from "../types/index";
import { vehicleTypeService, } from "../../services/index";
import { createAsyncThunk } from '@reduxjs/toolkit';
import { VehicleFareRequest } from '../../interface/vehicleTypeInterface';

export const vehicleTypeDataGet = createAsyncThunk(
  VEHICLE_TYPE,
  async (data: VehicleFareRequest) => {
    const response = await vehicleTypeService.vehicleTypes(data);
    if (!response || response.status < 200 || response.status >= 300) {
      const message = response?.data?.message;
      throw new Error(
        typeof message === "string" && message.trim()
          ? message
          : "Could not calculate a fare for this route. Please try again."
      );
    }

    if (!Array.isArray(response.data)) {
      throw new Error("The fare service returned an invalid response. Please try again.");
    }

    return response.data;
  }
);


export const vehicleData = createAsyncThunk(ALL_VEHICLE, async () => {
  const response = await vehicleTypeService.allVehicleData();  
  return response?.data;
},
);
