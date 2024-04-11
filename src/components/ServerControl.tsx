// import { useSelector, useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { Button } from "../widgets/Button";
import { ReactComponent as IconPower } from "../assets/icons/power.svg";
import { ReactComponent as ImgSettings } from "../assets/icons/settings.svg";
import { AppStatus, getAppStatus, updateStatus } from "../store/AppStatus";
import SettingModal from "./SettingModal";
import { useState } from "react";

const Wrapper = styled.section`
  .status { margin-left: 0.6em; }
  .blink {
    color: var(--color-danger);
    animation: blink-animation 1s steps(5, start) infinite;
    -webkit-animation: blink-animation 1s steps(5, start) infinite;
  }
  @keyframes blink-animation {
    to { opacity: 0.5; }
  }
  @-webkit-keyframes blink-animation {
    to { opacity: 0.5; }
  }
`;

export default function ServerControl() {
    const appStatus: AppStatus = useSelector(getAppStatus);

    const [isShowSettingModal, showSettingModal] = useState(false);

    function startStopServer() {
        window.ipc.sendMessage(JSON.stringify({event: (appStatus.isRunning ? "stop" : "start")}));
    }

    function updateAppSetting(settings: {autoOpenClient: boolean, autoStartServer: boolean, serverPort: string, clientUrl: string} | null) {
        console.log("update app settings:", settings);
        if (settings) window.ipc.sendMessage(JSON.stringify({event: "config", data: settings}));
        showSettingModal(false);
    }

    return (<Wrapper className="section flex-row align-center">
        <Button className={["sm icon circle", (appStatus.isRunning ? "success" : "danger")].join(" ")}
            onClick={() => startStopServer()}
            title={`click to ${(appStatus.isRunning ? "stop" : "start")} server`}>
            <IconPower />
        </Button>
        <span className={`status flex-auto ${appStatus.isRunning ? "blink" : ""}`}>
            {(!appStatus.isRunning ? "Server is stoped" : `Server is running on http://127.0.0.1:${appStatus.configs?.serverPort}`)}
        </span>
        <Button className="sm icon circle primary" onClick={() => showSettingModal(true)}>
            <ImgSettings />
        </Button>
        { isShowSettingModal
            ? <SettingModal onClose={updateAppSetting} />
            : null }
    </Wrapper>);
}
