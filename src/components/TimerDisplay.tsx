import { Monitor, MonitorOff, Pause, Play, Repeat } from "lucide-react"
import type { TimerState, TimerType } from "~/types"

type Props = {
  timeLeft: number
  timerType: TimerType
  timerState: TimerState
  formatTime: (seconds: number) => string
  onToggleTimer: () => void
  onTogglePiP: () => void
  onSwitchTimerType: () => void
  isPiPActive: boolean
}

export const TimerDisplay: React.FC<Props> = ({
  timeLeft,
  timerType,
  timerState,
  formatTime,
  onToggleTimer,
  onTogglePiP,
  onSwitchTimerType,
  isPiPActive,
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4 text-white">
      <h1 className="mb-8 text-3xl font-bold">Pomodoro Timer</h1>

      <div className="mb-8 w-80 rounded-lg bg-slate-800 p-10 text-center shadow-lg">
        <div className="mb-3 font-mono text-7xl font-bold">
          {formatTime(timeLeft)}
        </div>
        <div className="mb-4 text-2xl text-slate-300">
          {timerType === "work" ? "Working" : "Break"}
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <button
          type="button"
          onClick={onToggleTimer}
          className="rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 flex items-center gap-2"
        >
          {timerState === "running" ? <Pause size={20} /> : <Play size={20} />}
          {timerState === "running" ? "Pause" : "Start"}
        </button>

        <button
          type="button"
          onClick={onTogglePiP}
          className="rounded-full bg-slate-700 px-6 py-3 font-medium text-white transition hover:bg-slate-600 flex items-center gap-2"
        >
          {isPiPActive ? <MonitorOff size={20} /> : <Monitor size={20} />}
          {isPiPActive ? "Close PiP" : "Open PiP"}
        </button>

        <button
          type="button"
          onClick={onSwitchTimerType}
          className="rounded-full bg-slate-700 px-6 py-3 font-medium text-white transition hover:bg-slate-600 flex items-center gap-2"
        >
          <Repeat size={20} />
          {timerType === "work" ? "Switch to Break" : "Switch to Work"}
        </button>
      </div>

      <div className="text-center text-slate-400">
        <p>Work: 50 minutes / Break: 10 minutes</p>
        <p>Current mode: {timerType === "work" ? "Working" : "Break"}</p>
        {isPiPActive && (
          <p className="mt-2">
            Controls in PiP window: Click buttons inside PiP window
          </p>
        )}
      </div>
    </div>
  )
}
