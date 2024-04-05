import { createSlice } from "@reduxjs/toolkit";

var initState: Array<any> = [{type: "info", content: "app ready"}];

export const appLog = createSlice({
    name: "appLog",
    initialState: {
        data: initState
    },
    reducers: {
        pushLog: (state, action) => {
            console.log("@pushLog", action.payload);
            state.data = [...state.data, action.payload].slice(Math.max(state.data.length - 100, 0));
        }
    }
});

export const { pushLog } = appLog.actions;

export const getAppLog = (state: any) => {
    console.log("@getAppLog", state.appLog);
    
    return state.appLog.data;
}

export default appLog.reducer;
