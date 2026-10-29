import { RENTAL_VEHICLE, RENTAL_VEHICLE_LIST, RENTAL_RIDE_REQUEST, RENTAL_VEHICLE_LIST_DETAILS } from "../types/index";
import { rentalVehicleServices } from "../../services/index";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { RideRequestInterface } from "../../interface/rideRequestInterface";
import {
  RentalBookinginterface,
  RentalVehicleDiscoveryRequest,
  RentalVehicleListRequest,
} from "../../interface/rentalinterface";

export const rentalvehicleRequest = createAsyncThunk(
  RENTAL_VEHICLE,
  async (data: RentalVehicleDiscoveryRequest) => {
    const response = await rentalVehicleServices.rentalvehicleRequest(data);
    return response?.data;
  }
);

export const rentalRideRequests = createAsyncThunk(
  RENTAL_RIDE_REQUEST,
  async (data: RentalBookinginterface) => {
    const response = await rentalVehicleServices.rentalRideRequests(data);
    return response?.data;
  }
);

export const rentalVehicleList = createAsyncThunk(
  RENTAL_VEHICLE_LIST,
  async ({ start_time, end_time, vehicle_type_id, lat, lng, is_with_driver }: RentalVehicleListRequest) => {
    const response = await rentalVehicleServices.rentalVehicleList({
      start_time,
      end_time,
      vehicle_type_id,
      lat,
      lng,
      is_with_driver,
    });
    return response?.data;
  },
);

export const rentalVehicleListDetsils = createAsyncThunk(
  RENTAL_VEHICLE_LIST_DETAILS,
  async ({ vehicle_type_id, no_of_days, is_with_driver }: { vehicle_type_id: number, no_of_days: number, is_with_driver: number }) => {
    const response = await rentalVehicleServices.rentalVehicleListDetsils({ vehicle_type_id, no_of_days, is_with_driver });
    return response?.data;

  },
);
