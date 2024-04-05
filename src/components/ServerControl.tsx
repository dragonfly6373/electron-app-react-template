// import { useSelector, useDispatch } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../widgets/Button";
import {ReactComponent as ImgPlay} from "../assets/icons/play.svg";
import {ReactComponent as ImgStop} from "../assets/icons/stop.svg";
import {ReactComponent as ImgSettings} from "../assets/icons/settings.svg";
import { getAppStatus, updateStatus } from "../store/AppStatus";

export default function ServerControl() {
    const appStatus = useSelector(getAppStatus);
    const dispatch = useDispatch();

    function startStopServer() {
        window.ipc.sendMessage(JSON.stringify({event: (appStatus.isRunning ? "stop" : "start")}));
    }

    function openConfig() {
        console.log("open app configs");
        dispatch(updateStatus({isRunning: true}));
    }

    return (<section className="section flex-row align-center">
        <Button className={["sm icon circle danger", (appStatus.isRunning ? "start" : "stop")].join(" ")}
            onClick={() => startStopServer()}
            aria-label={`click to ${(appStatus.isRunning ? "start" : "stop")} server`}>
            {(appStatus.isRunning ? <ImgPlay /> : <ImgStop />)}
        </Button>
        <span className={["status flex-auto", (appStatus.isRunning ? "start" : "stop")].join(" ")}>
            {(!appStatus.isRunning ? "" : "server is running on http://127.0.0.1:9001")}
        </span>
        <Button className="sm icon circle primary" onClick={() => openConfig()}>
            <ImgSettings />
        </Button>
    </section>);
}