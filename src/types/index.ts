// タイマーの種類を定義する型
export type TimerType = "work" | "break"

// タイマーの状態を定義する型
export type TimerState = "running" | "paused"

// DocumentPictureInPictureWindowがTypeScriptで認識されるよう拡張定義
declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (options?: {
        width?: number
        height?: number
      }) => Promise<Window>
    }
  }
}
