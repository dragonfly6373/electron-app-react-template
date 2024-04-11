import { useSelector } from "react-redux";
import { getAppLog } from "../store/AppLog";
import styled from "styled-components";

const Wrapper = styled.section`
  .container {
    background: #000;
    color: #EEE;
    overflow-y: auto;
    & > .log-item {
        padding: 0.2em 0.4em;
        border-bottom: 1px dashed #2D2D2D;
        position: relative;
        & .log-time {
            display: none;
            position: absolute;
            right: 0.2em;
            top: 0.2em;
            filter: brightness(0.6);
        }
        &:hover .log-time {
            display: block;
        }
    }
    & .log-type {
        text-transform: uppercase;
        margin-right: 0.5em;
        width: 3.5em;
        min-width: 3.5em;
        &.error { color: var(--color-danger); }
        &.warn { color: var(--color-warn); }
        &.info { color: var(--color-success); }
        &.debug { color: var(--color-primary); }
    }
    & .log-content {
        flex: 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
    }
  }
`;

export default function() {
    const appLogs = useSelector(getAppLog);

    return (<Wrapper className="section flex-col flex-auto">
        <h5>Output Logs:</h5>
        <div className="container flex-auto">
            {appLogs.map((log: any, i: number) => {
                return (<div className="flex-row log-item" key={i}>
                    <div className={`log-type ${log.type}`}>{log.type}</div>
                    <div className="log-content">{String(log.content)}</div>
                    <div className="log-time">{new Date(log.time).toString().slice(16, 24)}</div>
                </div>);
            })}
        </div>
    </Wrapper>);
}
