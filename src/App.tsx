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
    // const [ logs, setLogs ] = useState(new Array<any>());
    // const [ appInfo, setAppInfo ] = useState({});

    const updateAppStatus = (data: any) => {
        dispatch(updateStatus(data));
    }

    const pushAppLog = (data: any) => {
        dispatch(pushLog(data));
    }
    
    const onMessage = (data: any) => {
        console.log('background process message:', data);
        switch (data.event) {
            case 'app_info': {
                // setAppInfo(data.data);
                updateAppStatus(data.data);
                break;
            }
            case 'server:start': {
                // setAppInfo({...appInfo, isRunning: true});
                updateAppStatus({ ...appStatus, isRunning: true });
                break;
            }
            case 'server:stop': {
                // setAppInfo({...appInfo, isRunning: false});
                updateAppStatus({ ...appStatus, isRunning: false });
                break;
            }
            case 'logs': {
                // setLogs([...logs, data.data].slice(Math.max(logs.length - 100), 0));
                pushAppLog(data.data);
                break;
            }
            default:
                break;
        }
    }

    useEffect(() => {
        
        window.ipc.on('message', onMessage);
        window.ipc.sendMessage(JSON.stringify({ event: 'ready' }));
        function autoRun() {
            updateAppStatus({...appStatus, isRunning: isRunning});
            pushAppLog({type: "info", content: isRunning});
            isRunning = !isRunning;
        }
        let interval = setInterval(autoRun, 2000);
        return () => {
            clearInterval(interval);
        }
    }, [dispatch]);
    let isRunning = false;
    console.log('App ready', appStatus, appLogs);
    return (
        <>
            <GlobalStyle />
            <ServerControl />
            <LogView />
        </>
    );
}
