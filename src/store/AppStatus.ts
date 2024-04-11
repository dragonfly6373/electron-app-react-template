import { createSlice } from "@reduxjs/toolkit";
import AppConfig from "../../electron/data/model/AppConfig";

export interface AppStatus {
    configs?: AppConfig;
    isRunning?: boolean;
}

var initState: AppStatus = {
    configs: {
        autoOpenClient: false,
        autoStartServer: false,
        serverPort: 9001,
        clientUrl: ""
    },
    isRunning: false
};

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
