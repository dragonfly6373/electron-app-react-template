import { createSlice } from "@reduxjs/toolkit";

var initState: {serverUrl: string, isRunning: boolean} = { serverUrl: "", isRunning: false };

export const appStatusSlice = createSlice({
    name: "appStatus",
    initialState: {
        data: initState
    },
    reducers: {
        updateStatus: (state, action) => {
            console.log("@updateStatus", action.payload);
            state.data = action.payload;
        }
    }
});

export const { updateStatus } = appStatusSlice.actions;

export const getAppStatus = (state: any) => {
    return state.appStatus.data;
}

export default appStatusSlice.reducer;
