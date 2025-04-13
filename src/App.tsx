import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './App.css'

// タイマーの種類を定義する型
type TimerType = 'work' | 'break';

// タイマーの状態を定義する型
type TimerState = 'running' | 'paused';

// DocumentPictureInPictureWindowがTypeScriptで認識されるよう拡張定義
declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
    };
  }
}

// PiPウィンドウ用のProps型を定義
interface PiPWindowProps {
  timeLeft: number;
  timerType: TimerType;
  timerState: TimerState;
  onToggleTimer: () => void;
  onSwitchTimerType: () => void;
}

// PiPウィンドウコンポーネント
function PiPWindow({ timeLeft, timerType, timerState, onToggleTimer, onSwitchTimerType }: PiPWindowProps) {
  // 時間のフォーマット
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Tailwind CSSのスタイルをPiPウィンドウのdocumentに追加
  useEffect(() => {
    // PiPウィンドウのdocument内のheadに必要なスタイルを注入
    const pipDoc = window.document;
    
    // すでに同じIDのスタイル要素がある場合は作成しない
    if (!pipDoc.getElementById('tailwind-styles')) {
      const linkEl = pipDoc.createElement('link');
      linkEl.id = 'tailwind-styles';
      linkEl.rel = 'stylesheet';
      linkEl.href = window.location.origin + '/src/index.css'; // Tailwind CSSへのパス
      pipDoc.head.appendChild(linkEl);
    }
  }, []);

  return (
    <>
      {/* ベースとなるスタイルを設定 */}
      <style>
        {`
          body {
            margin: 0;
            padding: 0;
            height: 100vh;
            overflow: hidden;
          }
        `}
      </style>
      
      {/* PiPウィンドウの内容 */}
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center justify-center text-center p-5">
          <p className="text-6xl font-bold m-0">{formatTime(timeLeft)}</p>
          <p className="text-2xl my-2.5 mb-5">{timerType === 'work' ? '作業中' : '休憩中'}</p>
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
              切替
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function App() {
  // タイマーの種類と状態の管理
  const [timerType, setTimerType] = useState<TimerType>('work');
  const [timerState, setTimerState] = useState<TimerState>('paused');
  
  // 作業時間と休憩時間の設定（分）
  const workDuration = 50 * 60; // 50分を秒に変換
  const breakDuration = 10 * 60; // 10分を秒に変換
  
  // 残り時間の管理
  const [timeLeft, setTimeLeft] = useState(workDuration);
  
  // タイマー表示要素の参照
  const timerContainerRef = useRef<HTMLDivElement>(null);
  const pipWindowRef = useRef<Window | null>(null);
  
  // PiP状態の管理
  const [isPiPActive, setIsPiPActive] = useState(false);

  // タイマーの開始/一時停止を切り替える関数
  const toggleTimer = () => {
    if (timerState === 'running') {
      setTimerState('paused');
    } else {
      setTimerState('running');
    }
  };

  // タイマー種類を切り替える関数
  const switchTimerType = () => {
    const newType = timerType === 'work' ? 'break' : 'work';
    setTimerType(newType);
    setTimeLeft(newType === 'work' ? workDuration : breakDuration);
  };

  // タイマーのカウントダウン処理
  useEffect(() => {
    if (timerState !== 'running') return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // タイマー終了時に種類を切り替え
          switchTimerType();
          return timerType === 'work' ? breakDuration : workDuration;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timerState, timerType]);

  // 残り時間をフォーマットする関数
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Document Picture-in-Picture機能の切り替え
  const togglePiP = async () => {
    try {
      // Document PiP APIのサポート確認
      if (!window.documentPictureInPicture) {
        throw new Error('このブラウザはDocument Picture-in-Picture APIをサポートしていません');
      }
      
      if (isPiPActive && pipWindowRef.current) {
        // PiPモードを終了
        pipWindowRef.current.close();
        pipWindowRef.current = null;
        setIsPiPActive(false);
      } else {
        // PiPウィンドウのサイズ
        const pipWidth = 320;
        const pipHeight = 280;
        
        // PiPウィンドウの作成
        const pipWindow = await window.documentPictureInPicture.requestWindow({
          width: pipWidth,
          height: pipHeight
        });
        pipWindowRef.current = pipWindow;
        
        // ページのタイトルを設定
        pipWindow.document.title = 'ポモドーロタイマー';
        
        // Tailwind CSSを読み込む
        const linkEl = pipWindow.document.createElement('link');
        linkEl.rel = 'stylesheet';
        linkEl.href = window.location.origin + '/src/index.css'; // Tailwind CSSへのパス
        pipWindow.document.head.appendChild(linkEl);
        
        // PiPウィンドウがアクティブに
        setIsPiPActive(true);
      }
    } catch (err) {
      console.error('PiPの切り替えに失敗しました:', err);
      alert('ピクチャーインピクチャーの表示に失敗しました。ブラウザがDocument Picture-in-Picture APIをサポートしていない可能性があります。');
      setIsPiPActive(false);
    }
  };

  // PiPウィンドウが閉じられたときのイベント処理
  useEffect(() => {
    if (!pipWindowRef.current) return;
    
    const handlePipClose = () => {
      setIsPiPActive(false);
      pipWindowRef.current = null;
    };
    
    if (isPiPActive && pipWindowRef.current) {
      pipWindowRef.current.addEventListener('pagehide', handlePipClose);
      
      return () => {
        if (pipWindowRef.current) {
          pipWindowRef.current.removeEventListener('pagehide', handlePipClose);
        }
      };
    }
  }, [isPiPActive]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">ポモドーロタイマー</h1>
      
      <div 
        ref={timerContainerRef}
        className="bg-slate-800 rounded-lg p-10 mb-8 shadow-lg w-80 text-center"
      >
        <div className="text-7xl font-bold mb-3">
          {formatTime(timeLeft)}
        </div>
        <div className="text-2xl text-slate-300 mb-4">
          {timerType === 'work' ? '作業中' : '休憩中'}
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={toggleTimer}
          className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
        >
          {timerState === 'running' ? '一時停止' : '開始'}
        </button>
        
        <button
          onClick={togglePiP}
          className="px-6 py-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-medium transition"
        >
          {isPiPActive ? 'PiP解除' : 'PiP表示'}
        </button>
        
        <button
          onClick={switchTimerType}
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

      {/* PiPウィンドウがアクティブな場合、Reactコンポーネントをポータルとしてレンダリング */}
      {isPiPActive && pipWindowRef.current && createPortal(
        <PiPWindow
          timeLeft={timeLeft}
          timerType={timerType}
          timerState={timerState}
          onToggleTimer={toggleTimer}
          onSwitchTimerType={switchTimerType}
        />,
        pipWindowRef.current.document.body
      )}
    </div>
  )
}

export default App
