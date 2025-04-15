import { createPortal } from "react-dom"

import { PiPWindow } from "./components/PiPWindow"
import { TimerDisplay } from "./components/TimerDisplay"
import { usePictureInPicture } from "./hooks/usePictureInPicture"
import { useTimer } from "./hooks/useTimer"

const App: React.FC = () => {
  // タイマーのカスタムフック
  const {
    timerType,
    timerState,
    timeLeft,
    toggleTimer,
    switchTimerType,
    formatTime,
  } = useTimer({
    workDuration: 50 * 60, // 50分
    breakDuration: 10 * 60, // 10分
  })

  // PiPのカスタムフック
  const { isPiPActive, pipWindowRef, togglePiP } = usePictureInPicture({
    width: 320,
    height: 100, // 高さを100pxに変更
  })

  return (
    <>
      <TimerDisplay
        timeLeft={timeLeft}
        timerType={timerType}
        timerState={timerState}
        formatTime={formatTime}
        onToggleTimer={toggleTimer}
        onTogglePiP={togglePiP}
        onSwitchTimerType={switchTimerType}
        isPiPActive={isPiPActive}
      />

      {/* PiPウィンドウがアクティブな場合、Reactコンポーネントをポータルとしてレンダリング */}
      {isPiPActive &&
        pipWindowRef.current &&
        createPortal(
          <PiPWindow
            timeLeft={timeLeft}
            timerType={timerType}
            timerState={timerState}
            onToggleTimer={toggleTimer}
            onSwitchTimerType={switchTimerType}
          />,
          pipWindowRef.current.document.body
        )}
    </>
  )
}

export default App
