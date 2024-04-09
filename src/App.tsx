import { useSelector, useDispatch } from 'react-redux';
import { GlobalStyle } from './styles/GlobalStyle';

// import { Greetings } from './components/Greetings'
import ServerControl from './components/ServerControl';
import LogView from './components/LogView';

import { getAppStatus, updateStatus } from './store/AppStatus';
import { getAppLog, pushLog } from './store/AppLog';
import { useEffect, useState } from 'react';

export default function () {
    const dispatch = useDispatch();
    const appStatus = useSelector(getAppStatus);
    const appLogs = useSelector(getAppLog);
    let isRunning = false;
    // const [ logs, setLogs ] = useState(new Array<any>());
    // const [ appInfo, setAppInfo ] = useState({});

    const updateAppStatus = (data: {serverUrl: string, isRunning: boolean}) => {
        dispatch(updateStatus(data));
    }

    const pushAppLog = (data: {type: string, content: any}) => {
        dispatch(pushLog(data));
    }
    
    const onMessage = (obj: {event: string, data: any}) => {
        // const obj = JSON.parse(data);
        console.log('background process message:', obj.event, obj.data);
        switch (obj.event) {
            case 'app:info': {
                pushAppLog({type: "info", content: JSON.stringify(obj.data)});
                updateAppStatus(obj.data);
                break;
            }
            case 'server:start': {
                pushAppLog({type: "info", content: JSON.stringify(obj.data)});
                updateAppStatus({ ...appStatus, isRunning: true });
                break;
            }
            case 'server:stop': {
                pushAppLog({type: "info", content: JSON.stringify(obj.data)});
                updateAppStatus({ ...appStatus, isRunning: false });
                break;
            }
            case 'app:logs': {
                pushAppLog(obj.data);
                break;
            }
            default:
                pushAppLog({type: "error", content: `unknown event ${obj.event}`});
                break;
        }
    }

    useEffect(() => {
        window.ipc.on('message', (data: any) => onMessage(data));
        window.ipc.sendMessage(JSON.stringify({ event: 'ready' }));
    }, [dispatch]);
    console.log('App ready', appStatus, appLogs);
    return (
        <>
            <GlobalStyle />
            <ServerControl />
            <LogView />
        </>
    );
}
