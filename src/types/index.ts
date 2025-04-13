// タイマーの種類を定義する型
export type TimerType = "work" | "break"

// タイマーの状態を定義する型
export type TimerState = "running" | "paused"

// PiPウィンドウのProps型を定義
export interface PiPWindowProps {
  timeLeft: number
  timerType: TimerType
  timerState: TimerState
  onToggleTimer: () => void
  onSwitchTimerType: () => void
}

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
