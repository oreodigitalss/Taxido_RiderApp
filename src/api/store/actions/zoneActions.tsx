import { User_Zone } from "../types/index";
import { ZoneInterface } from "../../interface/zoneInterface";
import { createAsyncThunk } from '@reduxjs/toolkit';
import zoneServices from "../../services/zoneService";


export const userZone = createAsyncThunk(
  User_Zone,
  async (data: ZoneInterface | any, { rejectWithValue }) => {
    const response = await zoneServices.userZone(data.lat, data.lng);
    if (!response || response.status < 200 || response.status >= 300) {
      return rejectWithValue(response?.data ?? response);
    }
    return response?.data;
  },
);
