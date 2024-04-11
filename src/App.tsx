import { useSelector, useDispatch } from 'react-redux';
import { GlobalStyle } from './styles/GlobalStyle';

import ServerControl from './components/ServerControl';
import LogView from './components/LogView';

import { AppStatus, getAppStatus, updateStatus } from './store/AppStatus';
import { getAppLog, pushLog } from './store/AppLog';
import { useEffect, useState } from 'react';
import LogMsg from '../electron/data/model/LogMsg';

export default function () {
    const dispatch = useDispatch();
    const appStatus = useSelector(getAppStatus);
    const appLogs = useSelector(getAppLog);
    // const [ logs, setLogs ] = useState(new Array<any>());
    // const [ appStatus, setAppStatus ] = useState({} as AppStatus);

    const updateAppStatus = (data: AppStatus) => {
        // setAppStatus(data);
        console.log("# updateAppStatus", JSON.stringify(appStatus), data);
        if (appStatus.isRunning) alert("Server is current running. Please restart server to apply effect");
        else dispatch(updateStatus(data));
    }

    const pushAppLog = (data: LogMsg) => {
        dispatch(pushLog(data));
    }
    
    const onMessage = (obj: {event: string, data: any}) => {
        // console.log('background process message:', obj.event, obj.data);
        // console.log('current appStatus', JSON.stringify(appStatus));
        switch (obj.event) {
            case 'app:info': {
                pushAppLog(new LogMsg(LogMsg.Types.INFO, JSON.stringify(obj.data)));
                updateAppStatus(obj.data);
                break;
            }
            /* case 'server:start': {
                pushAppLog(new LogMsg(LogMsg.Types.INFO, JSON.stringify(obj.data)));
                updateAppStatus({ ...appStatus, isRunning: true });
                break;
            } */
            /* case 'server:stop': {
                pushAppLog(new LogMsg(LogMsg.Types.INFO, JSON.stringify(obj.data)));
                updateAppStatus({ ...appStatus, isRunning: false });
                break;
            } */
            case 'app:logs': {
                pushAppLog(obj.data as LogMsg);
                break;
            }
            default:
                pushAppLog(new LogMsg(LogMsg.Types.ERROR, `unknown event ${obj.event}`));
                break;
        }
    }

    useEffect(() => {
        console.log('App ready', appStatus, appLogs);
        window.ipc.on('message', (data: any) => onMessage(data));
        window.ipc.sendMessage(JSON.stringify({ event: 'ready' }));
    }, [dispatch]);

    return (
        <>
            <GlobalStyle />
            <ServerControl />
            <LogView />
        </>
    );
}
