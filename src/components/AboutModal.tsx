import styled from "styled-components";
import { Button } from "../widgets/Button";
import { Icon } from "../widgets/Icon";
import applicationInfo from "../../package.json";

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
            width: 22em;
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
            }
        }
    }
    .header {
        border-bottom: 1px solid #DDD;
        & .btn-close:hover { background-color: var(--color-danger); }
    }
    .footer { border-top: 1px solid #DDD; }
    .body {
        flex: 1 auto;
        padding: 1em;
        overflow: auto;
        & .input-group {
            display: flex;
            align-items: center;
            & > label {
                padding-right: 0.5em;
                line-height: 2;
            }
        }
        & .description {
            line-height: 1.5;
        }
    }
`;

export default function AboutModal( options: { onClose: Function }) {
    console.log("# application: ", applicationInfo);
    
    const {
        name,
        title,
        version,
        copyright,
        description
    } = applicationInfo;

    return (<Wrapper className="section cover">
        <div className="main">
            <div className="header">
                <h4 className="title">About</h4>
                <Button className="circle sm btn-close"
                    onClick={() => options.onClose(null)}>
                    <Icon type="close" />
                </Button>
            </div>
            <div className="body">
                <h2>{title}</h2>
                <div className="input-group">
                    <label>Version:</label>
                    <em>{version}</em>
                </div>
                <div className="description">{description}</div>
                <div className="input-group">
                    <span>{copyright}</span>
                </div>
            </div>
        </div>
    </Wrapper>);
}
