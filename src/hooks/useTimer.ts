import { useCallback, useEffect, useState } from "react"
import type { TimerState, TimerType } from "../types"

interface UseTimerProps {
  initialTimerType?: TimerType
  initialTimerState?: TimerState
  workDuration?: number
  breakDuration?: number
}

export function useTimer({
  initialTimerType = "work",
  initialTimerState = "paused",
  workDuration = 50 * 60, // デフォルト50分（秒単位）
  breakDuration = 10 * 60, // デフォルト10分（秒単位）
}: UseTimerProps = {}) {
  // タイマーの種類と状態の管理
  const [timerType, setTimerType] = useState<TimerType>(initialTimerType)
  const [timerState, setTimerState] = useState<TimerState>(initialTimerState)

  // 残り時間の管理
  const [timeLeft, setTimeLeft] = useState(
    initialTimerType === "work" ? workDuration : breakDuration
  )

  // タイマーの開始/一時停止を切り替える関数
  const toggleTimer = () => {
    if (timerState === "running") {
      setTimerState("paused")
    } else {
      setTimerState("running")
    }
  }

  // タイマー種類を切り替える関数
  const switchTimerType = useCallback(() => {
    const newType = timerType === "work" ? "break" : "work"
    setTimerType(newType)
    setTimeLeft(newType === "work" ? workDuration : breakDuration)
  }, [timerType, workDuration, breakDuration])

  // タイマーのカウントダウン処理
  useEffect(() => {
    if (timerState !== "running") return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // タイマー終了時に種類を切り替え
          switchTimerType()
          return timerType === "work" ? breakDuration : workDuration
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerState, timerType, switchTimerType, workDuration, breakDuration])

  // 残り時間をフォーマットする関数
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return {
    timerType,
    timerState,
    timeLeft,
    toggleTimer,
    switchTimerType,
    formatTime,
  }
}
