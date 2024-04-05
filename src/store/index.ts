import { configureStore } from "@reduxjs/toolkit";
import appStatusReducer from "./AppStatus";
import appLogReducer from "./AppLog";

export default configureStore({
    reducer: {
        appStatus: appStatusReducer,
        appLog: appLogReducer
    }
});
