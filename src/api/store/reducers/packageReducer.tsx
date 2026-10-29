import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { packageDataGet } from '../actions/packageAction';
import { PackageInterface } from '../../interface/packageInterface';


const initialState: PackageInterface = {
    packageList: { data: [] },
    loading: false,
    success: false,
};

const packageSlice = createSlice({
    name: 'package',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(packageDataGet.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(packageDataGet.fulfilled, (state, action: PayloadAction<{ data: any[] }>) => {
            state.loading = false;
            state.packageList = action.payload;
            state.success = true;
        });
        builder.addCase(packageDataGet.rejected, (state) => {
            state.loading = false;
            state.success = false;
        });
    }
});

export default packageSlice.reducer;
