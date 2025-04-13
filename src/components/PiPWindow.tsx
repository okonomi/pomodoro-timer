import { useEffect } from 'react';
import { PiPWindowProps } from '../types';

// PiPウィンドウコンポーネント
export function PiPWindow({ 
  timeLeft, 
  timerType, 
  timerState, 
  onToggleTimer, 
  onSwitchTimerType 
}: PiPWindowProps) {
  // 時間のフォーマット
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
      <div className="flex flex-col items-center justify-center text-center p-5">
        <p className="text-6xl font-bold m-0">{formatTime(timeLeft)}</p>
        <p className="text-2xl my-2.5 mb-5">{timerType === 'work' ? 'Working' : 'Break'}</p>
        <div className="flex gap-5 mt-5">
          <button 
            className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-blue-500 bg-opacity-80 border-none cursor-pointer hover:bg-opacity-100 transition-opacity"
            onClick={onToggleTimer}
          >
            {timerState === 'running' ? '⏸' : '▶'}
          </button>
          <button 
            className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-slate-500 bg-opacity-80 border-none cursor-pointer hover:bg-opacity-100 transition-opacity text-xs font-bold"
            onClick={onSwitchTimerType}
          >
            Switch
          </button>
        </div>
      </div>
    </div>
  );
}