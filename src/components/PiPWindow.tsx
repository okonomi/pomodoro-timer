import clsx from "clsx"
import { Pause, Play, Repeat } from "lucide-react"
import type { TimerState, TimerType } from "../types"

type Props = {
  timeLeft: number
  timerType: TimerType
  timerState: TimerState
  onToggleTimer: () => void
  onSwitchTimerType: () => void
}

export const PiPWindow: React.FC<Props> = ({
  timeLeft,
  timerType,
  timerState,
  onToggleTimer,
  onSwitchTimerType,
}) => {
  // 時間のフォーマット
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // タイマータイプに応じた背景色の設定
  const isWorkMode = timerType === "work"

  return (
    <div
      className={clsx(
        "flex h-screen w-full",
        isWorkMode ? "bg-slate-900 text-white" : "bg-blue-300 text-slate-900"
      )}
    >
      {/* 左側2/3 - タイマー表示のみ */}
      <div className="flex flex-grow items-center justify-center">
        <p className="font-mono text-5xl font-bold">{formatTime(timeLeft)}</p>
      </div>

      {/* 右側1/3 - ステータス表示とボタン */}
      <div className="flex flex-shrink flex-col items-center justify-center gap-1 pe-4">
        {/* ステータス表示 */}
        <p className="text-[10px] font-medium">
          {isWorkMode ? "Working" : "Break"}
        </p>

        {/* ボタン - 横に並べる */}
        <div className="mt-1 flex flex-row gap-1">
          <button
            type="button"
            className={clsx(
              "bg-opacity-80 hover:bg-opacity-100 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none transition-opacity",
              isWorkMode ? "bg-blue-500" : "bg-slate-700"
            )}
            onClick={onToggleTimer}
          >
            {timerState === "running" ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}
          </button>
          <button
            type="button"
            className={clsx(
              "bg-opacity-80 hover:bg-opacity-100 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none text-[8px] font-bold transition-opacity",
              isWorkMode ? "bg-slate-500" : "bg-slate-700"
            )}
            onClick={onSwitchTimerType}
          >
            <Repeat size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
