// import { useSelector, useDispatch } from "react-redux";
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { Button } from '../widgets/Button'
import { AppStatus, getAppStatus, updateStatus } from '../store/AppStatus'
import SettingModal from './SettingModal'
import { useRef, useState } from 'react'
import { Icon } from '../widgets/Icon'
import AboutModal from './AboutModal'
import { Popup } from '../widgets/Popup'

const Wrapper = styled.section`
  & .status {
    margin-left: 0.6em;
  }
  & .button-group {
    display: flex;
    & > :not(:first-child) {
      margin-left: 0.6em;
      }
  }
  & .blink {
    color: var(--color-danger);
    animation: blink-animation 1s steps(5, start) infinite;
    -webkit-animation: blink-animation 1s steps(5, start) infinite;
  }
  @keyframes blink-animation {
    to {
      opacity: 0.5;
    }
  }
  @-webkit-keyframes blink-animation {
    to {
      opacity: 0.5;
    }
  }
`;

export default function ServerControl() {
  const appStatus: AppStatus = useSelector(getAppStatus);

  const [isShowSettingModal, showSettingModal] = useState(false);
  const [isShowAboutModal, showAboutModal] = useState(false);
  const [isShowMenuSetting, showMenuSetting] = useState(false);

  const btnMenuRef = useRef(null);

  function startStopServer() {
    window.ipc.sendMessage(
      JSON.stringify({ event: appStatus.isRunning ? 'stop' : 'start' }),
    );
  }

  function openWebClient() {
    window.ipc.sendMessage(
      JSON.stringify({ event: 'client' }),
    );
  }

  function updateAppSetting(
    settings: {
      autoOpenClient: boolean
      autoStartServer: boolean
      serverPort: string
      clientUrl: string
    } | null,
  ) {
    if (settings) {
      window.ipc.sendMessage(
        JSON.stringify({ event: 'config', data: settings }),
      );
    }
    showSettingModal(false);
  }

  return (
    <Wrapper className="section flex-row align-center">
      <Button
        className={[
          'md icon circle',
          appStatus.isRunning ? 'success' : 'danger',
        ].join(' ')}
        onClick={() => startStopServer()}
        title={`click to ${appStatus.isRunning ? 'stop' : 'start'} server`}
      >
        <Icon type="power" />
      </Button>
      <span
        className={`status flex-auto ${appStatus.isRunning ? 'blink' : ''}`}
      >
        {!appStatus.isRunning
          ? 'Server is stoped'
          : `Server is running on http://127.0.0.1:${appStatus.configs?.serverPort}`}
      </span>

      <div className="button-group">
        <Button title="open web client"
          className="md icon circle success"
          onClick={() => openWebClient()}
        >
          <Icon type="monitor-screenshot" />
        </Button>
        <Button ref={btnMenuRef} title="settings"
          className="md icon circle primary"
          onClick={() => showSettingModal(true)}
        >
          <Icon type="settings" />
        </Button>
        <Button ref={btnMenuRef} title="about"
          className="md icon circle"
          onClick={() => showAboutModal(true)}
        >
          <Icon type="about" />
        </Button>
        {isShowMenuSetting ? <Popup for={btnMenuRef.current}
          position='auto'
          type='default'
          autoHide={true}
          onHide={() => {}}
        >
          <ul className="menu">
            <li className="menu-item">Settings</li>
            <li className="menu-item">About</li>
          </ul>
        </Popup> : null}
      </div>
      {isShowSettingModal ? <SettingModal onClose={updateAppSetting} /> : null}
      {isShowAboutModal ? <AboutModal onClose={() => showAboutModal(false)} /> : null}
    </Wrapper>
  )
}
