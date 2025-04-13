import React from 'react';
import { TimerType, TimerState } from '../types';

interface TimerDisplayProps {
  timeLeft: number;
  timerType: TimerType;
  timerState: TimerState;
  formatTime: (seconds: number) => string;
  onToggleTimer: () => void;
  onTogglePiP: () => void;
  onSwitchTimerType: () => void;
  isPiPActive: boolean;
}

export function TimerDisplay({
  timeLeft,
  timerType,
  timerState,
  formatTime,
  onToggleTimer,
  onTogglePiP,
  onSwitchTimerType,
  isPiPActive
}: TimerDisplayProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">ポモドーロタイマー</h1>
      
      <div className="bg-slate-800 rounded-lg p-10 mb-8 shadow-lg w-80 text-center">
        <div className="text-7xl font-bold mb-3">
          {formatTime(timeLeft)}
        </div>
        <div className="text-2xl text-slate-300 mb-4">
          {timerType === 'work' ? '作業中' : '休憩中'}
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={onToggleTimer}
          className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
        >
          {timerState === 'running' ? '一時停止' : '開始'}
        </button>
        
        <button
          onClick={onTogglePiP}
          className="px-6 py-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-medium transition"
        >
          {isPiPActive ? 'PiP解除' : 'PiP表示'}
        </button>
        
        <button
          onClick={onSwitchTimerType}
          className="px-6 py-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-medium transition"
        >
          {timerType === 'work' ? '休憩へ切替' : '作業へ切替'}
        </button>
      </div>
      
      <div className="text-slate-400 text-center">
        <p>作業: 50分 / 休憩: 10分</p>
        <p>現在: {timerType === 'work' ? '作業中' : '休憩中'}</p>
        {isPiPActive && <p className="mt-2">PiP内でのタイマー操作: ウィンドウ内のボタンをクリック</p>}
      </div>
    </div>
  );
}