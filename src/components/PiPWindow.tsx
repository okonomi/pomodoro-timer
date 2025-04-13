import type { PiPWindowProps } from "../types"

// PiPウィンドウコンポーネント
export function PiPWindow({
  timeLeft,
  timerType,
  timerState,
  onToggleTimer,
  onSwitchTimerType,
}: PiPWindowProps) {
  // 時間のフォーマット
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex h-screen w-full bg-slate-900 text-white">
      {/* 左側2/3 - タイマー表示のみ */}
      <div className="flex flex-grow items-center justify-center">
        <p className="text-5xl font-bold font-mono">{formatTime(timeLeft)}</p>
      </div>

      {/* 右側1/3 - ステータス表示とボタン */}
      <div className="flex flex-shrink flex-col items-center justify-center gap-1 pe-4">
        {/* ステータス表示 */}
        <p className="text-[10px] font-medium">
          {timerType === "work" ? "Working" : "Break"}
        </p>

        {/* ボタン - 横に並べる */}
        <div className="flex flex-row gap-1 mt-1">
          <button
            type="button"
            className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 bg-opacity-80 border-none cursor-pointer hover:bg-opacity-100 transition-opacity"
            onClick={onToggleTimer}
          >
            {timerState === "running" ? "⏸" : "▶"}
          </button>
          <button
            type="button"
            className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-500 bg-opacity-80 border-none cursor-pointer hover:bg-opacity-100 transition-opacity text-[8px] font-bold"
            onClick={onSwitchTimerType}
          >
            SW
          </button>
        </div>
      </div>
    </div>
  )
}
