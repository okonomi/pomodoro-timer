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
        <p className="font-mono text-5xl font-bold">{formatTime(timeLeft)}</p>
      </div>

      {/* 右側1/3 - ステータス表示とボタン */}
      <div className="flex flex-shrink flex-col items-center justify-center gap-1 pe-4">
        {/* ステータス表示 */}
        <p className="text-[10px] font-medium">
          {timerType === "work" ? "Working" : "Break"}
        </p>

        {/* ボタン - 横に並べる */}
        <div className="mt-1 flex flex-row gap-1">
          <button
            type="button"
            className="bg-opacity-80 hover:bg-opacity-100 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none bg-blue-500 transition-opacity"
            onClick={onToggleTimer}
          >
            {timerState === "running" ? "⏸" : "▶"}
          </button>
          <button
            type="button"
            className="bg-opacity-80 hover:bg-opacity-100 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none bg-slate-500 text-[8px] font-bold transition-opacity"
            onClick={onSwitchTimerType}
          >
            SW
          </button>
        </div>
      </div>
    </div>
  )
}
