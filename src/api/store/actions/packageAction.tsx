import { PACKAGE } from "../types/index";
import { packageServices } from "../../services/index";
import { createAsyncThunk } from '@reduxjs/toolkit';


export const packageDataGet = createAsyncThunk(PACKAGE, async (data: { zone_id: number | string }) => {
  const response = await packageServices.packageDataGet(data.zone_id);
  return response?.data;
},
);
