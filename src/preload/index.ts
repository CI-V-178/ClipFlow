import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Renderer 側に公開する独自 API。
// メインプロセス直結 API は preload 経由でのみ露出させ、
// renderer から electron / Node 機能を直接触らせない (層分離)。
const api = {
  ping: (): Promise<string> => ipcRenderer.invoke('app:ping')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // contextIsolation 無効時のフォールバック (本来は使わない構成)
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

export type AppApi = typeof api
