import { useState, useEffect, useRef } from 'react'
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
        
        // PiPウィンドウのスタイルとコンテンツを設定
        const doc = pipWindow.document;
        
        // スタイルの設定
        const style = doc.createElement('style');
        style.textContent = `
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #1e293b;
            color: #ffffff;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          .timer-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 20px;
          }
          .time {
            font-size: 60px;
            font-weight: bold;
            margin: 0;
          }
          .status {
            font-size: 24px;
            margin: 10px 0 20px;
          }
          .controls {
            display: flex;
            gap: 20px;
            margin-top: 20px;
          }
          .button {
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.2s;
          }
          .button:hover {
            opacity: 1;
          }
          .button-play {
            background-color: #3b82f6;
          }
          .button-switch {
            background-color: #64748b;
            font-size: 12px;
            font-weight: bold;
          }
        `;
        doc.head.appendChild(style);
        
        // HTML要素の作成
        doc.body.innerHTML = `
          <div class="timer-container">
            <p class="time">${formatTime(timeLeft)}</p>
            <p class="status">${timerType === 'work' ? '作業中' : '休憩中'}</p>
            <div class="controls">
              <button id="pip-play-button" class="button button-play">
                ${timerState === 'running' ? '⏸' : '▶'}
              </button>
              <button id="pip-switch-button" class="button button-switch">
                切替
              </button>
            </div>
          </div>
        `;
        
        // ボタンのイベントハンドラを設定
        const playButton = doc.getElementById('pip-play-button');
        const switchButton = doc.getElementById('pip-switch-button');
        
        if (playButton) {
          playButton.addEventListener('click', toggleTimer);
        }
        
        if (switchButton) {
          switchButton.addEventListener('click', switchTimerType);
        }
        
        // PiPのタイトルを設定
        doc.title = 'ポモドーロタイマー';
        
        setIsPiPActive(true);
      }
    } catch (err) {
      console.error('PiPの切り替えに失敗しました:', err);
      alert('ピクチャーインピクチャーの表示に失敗しました。ブラウザがDocument Picture-in-Picture APIをサポートしていない可能性があります。');
      setIsPiPActive(false);
    }
  };

  // PiPウィンドウの内容更新
  useEffect(() => {
    if (!isPiPActive || !pipWindowRef.current) return;
    
    const pipWindow = pipWindowRef.current;
    const doc = pipWindow.document;
    
    // 時間表示の更新
    const timeElement = doc.querySelector('.time');
    if (timeElement) {
      timeElement.textContent = formatTime(timeLeft);
    }
    
    // 状態表示の更新
    const statusElement = doc.querySelector('.status');
    if (statusElement) {
      statusElement.textContent = timerType === 'work' ? '作業中' : '休憩中';
    }
    
    // 再生ボタンの更新
    const playButton = doc.getElementById('pip-play-button');
    if (playButton) {
      playButton.textContent = timerState === 'running' ? '⏸' : '▶';
    }
    
  }, [timeLeft, timerType, timerState, isPiPActive]);

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
    </div>
  )
}

export default App
