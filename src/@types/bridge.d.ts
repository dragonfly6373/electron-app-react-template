import { api } from '../../electron/bridge'

declare global {
  // eslint-disable-next-line
  interface Window {
    ipc: typeof api
  }
}
