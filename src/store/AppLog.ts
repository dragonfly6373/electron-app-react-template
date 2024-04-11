import { createSlice } from "@reduxjs/toolkit";
import LogMsg from "../../electron/data/model/LogMsg";

var initState: Array<LogMsg> = [/* {type: "info", content: "app ready", time: new Date()} */];

export const appLog = createSlice({
    name: "appLog",
    initialState: {
        data: initState
    },
    reducers: {
        pushLog: (state, action) => {
            // console.log("@pushLog", action.payload);
            state.data = [...state.data, action.payload].slice(Math.max(state.data.length - 100, 0));
        }
    }
});

export const { pushLog } = appLog.actions;

export const getAppLog = (state: any) => {
    return state.appLog.data;
}

export default appLog.reducer;
