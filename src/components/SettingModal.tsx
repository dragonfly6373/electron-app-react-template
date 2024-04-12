import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { Button } from "../widgets/Button";
import { InputField } from "../widgets/InputField";
import { useEffect, useState } from "react";
import { AppStatus, getAppStatus } from "../store/AppStatus";
import { Icon } from "../widgets/Icon";

const Wrapper = styled.section`
    &.cover {
        display: flex;
        position: fixed;
        align-items: center;
        justify-content: center;
        top: 0; right: 0; bottom: 0; left: 0;
        overflow: hidden;
        background-color: rgba(0,0,0,0.25);
        z-index: 1;
        & .main {
            display: flex;
            flex-flow: column;
            box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
            background-color: #FFF;
            border-radius: 0.25em;
            overflow: hidden;
        }
    }
    .header,
    .footer {
        display: flex;
        flex-flow: row;
        align-items: center;
        padding: 0.36em 0.6em;
        & .title {
            flex: 1 auto;
        }
        & .button-group {
            display: flex;
            & > :not(:first-child) {
            margin-left: 0.6em;
        }}
    }
    .header {
        border-bottom: 1px solid #DDD;
        & .btn-close:hover { background-color: var(--color-danger); }
    }
    .footer { border-top: 1px solid #DDD; }
    .body {
        flex: 1 auto;
        padding: 0.6em;
        overflow: auto;
        & .input-group {
            display: flex;
            align-items: center;
            & > label {
                flex: 1 auto;
                padding-right: 1em;
                line-height: 2;
            }
        }
    }
`;

export default function SettingModal( options: { onClose: Function }) {
    const [autoOpenClient, setAutoOpenClient] = useState(false);
    const [autoStartServer, setAutoStartServer] = useState(false);
    const [serverPort, setServerPort] = useState(9001);
    const [clientUrl, setClientUrl] = useState("");

    const appStatus: AppStatus = useSelector(getAppStatus);
    console.log("SettingModal - appStatus", appStatus);

    useEffect(() => {
        setAutoOpenClient(appStatus.configs?.autoOpenClient || autoOpenClient);
        setAutoStartServer(appStatus.configs?.autoStartServer || autoStartServer);
        setServerPort(appStatus.configs?.serverPort || serverPort);
        setClientUrl(appStatus.configs?.clientUrl || clientUrl);
    }, [appStatus]);

    return (<Wrapper className="section cover">
        <div className="main">
            <div className="header">
                <h4 className="title">Settings</h4>
                <Button className="circle sm btn-close"
                    onClick={() => options.onClose(null)}>
                    <Icon type="close" />
                </Button>
            </div>
            <div className="body">
                <div className="input-group">
                    <label>Open client on startup</label>
                    <input type="checkbox" checked={autoOpenClient}
                        onChange={(event: any) => setAutoOpenClient(event.target.checked)}/>
                </div>
                <div className="input-group">
                    <label>Auto start HTTP Server</label>
                    <input type="checkbox" checked={autoStartServer}
                        onChange={(event: any) => setAutoStartServer(event.target.checked)}/>
                </div>
                <div className="input-group">
                    <label>Server Port</label>
                    <InputField type="number" value={serverPort}
                        onChange={(event: any) => setServerPort(parseInt(event.target.value))}/>
                </div>
                <div className="input-group">
                    <label>Client URL</label>
                    <InputField type="text" value={clientUrl}
                        onChange={(event: any) => setClientUrl(event.target.value)}/>
                </div>
            </div>
            <div className="footer">
                <span className="flex-auto"></span>
                <div className="button-group">
                    <Button className="md primary"
                        onClick={() => options.onClose({autoOpenClient, autoStartServer, serverPort, clientUrl})}>Save</Button>
                    <Button className="md danger"
                        onClick={() => options.onClose(null)}>Close</Button>
                </div>
            </div>
        </div>
    </Wrapper>);
}
