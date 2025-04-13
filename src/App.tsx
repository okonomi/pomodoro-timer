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
  
  // Canvas要素の参照
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
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

  // Canvas描画処理
  const drawTimerCanvas = (canvas: HTMLCanvasElement, width: number, height: number, showControls: boolean = false) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスのサイズを設定
    canvas.width = width;
    canvas.height = height;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, width, height);
    
    // 背景を描画
    ctx.fillStyle = '#1e293b'; // Tailwindのslate-800相当
    ctx.fillRect(0, 0, width, height);
    
    // 残り時間のテキスト表示
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // タイマー表示を画面中央に大きく表示
    ctx.font = 'bold 60px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(timeText, width / 2, height / 2 - 20);
    
    // ステータステキスト
    ctx.font = '24px sans-serif';
    ctx.fillText(timerType === 'work' ? '作業中' : '休憩中', width / 2, height / 2 + 30);
    
    // コントロールボタンの描画（PiPモードのみ）
    if (showControls) {
      // 開始/一時停止ボタン
      const playBtnY = height - 40;
      const playBtnX = width / 2;
      const playBtnRadius = 25;
      
      ctx.beginPath();
      ctx.arc(playBtnX, playBtnY, playBtnRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f680'; // 半透明の青色
      ctx.fill();
      
      // 再生/一時停止アイコン
      ctx.fillStyle = '#ffffff';
      if (timerState === 'running') {
        // 一時停止アイコン
        ctx.fillRect(playBtnX - 10, playBtnY - 15, 7, 30);
        ctx.fillRect(playBtnX + 3, playBtnY - 15, 7, 30);
      } else {
        // 再生アイコン
        ctx.beginPath();
        ctx.moveTo(playBtnX - 10, playBtnY - 15);
        ctx.lineTo(playBtnX - 10, playBtnY + 15);
        ctx.lineTo(playBtnX + 15, playBtnY);
        ctx.closePath();
        ctx.fill();
      }
      
      // タイマータイプ切替ボタン
      const switchBtnY = playBtnY;
      const switchBtnX = width - 40;
      const switchBtnRadius = 20;
      
      ctx.beginPath();
      ctx.arc(switchBtnX, switchBtnY, switchBtnRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#64748b80'; // 半透明のスレート色
      ctx.fill();
      
      // 切替アイコン
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('切替', switchBtnX, switchBtnY);
    }
  };
  
  // メインキャンバスの描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    drawTimerCanvas(canvas, canvas.width, canvas.height, false);
    
    // PiP用キャンバスの更新
    if (isPiPActive && pipCanvasRef.current) {
      drawTimerCanvas(
        pipCanvasRef.current, 
        pipCanvasRef.current.width, 
        pipCanvasRef.current.height, 
        true
      );
    }
  }, [timeLeft, timerType, isPiPActive, timerState]);

  // PiPウィンドウのクリックイベント処理
  useEffect(() => {
    if (!isPiPActive || !pipWindowRef.current || !pipCanvasRef.current) return;
    
    const pipWindow = pipWindowRef.current;
    const pipCanvas = pipCanvasRef.current;
    
    // クリックイベントハンドラ
    const handlePipClick = (e: MouseEvent) => {
      const rect = pipCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // 再生/一時停止ボタンの位置
      const playBtnY = pipCanvas.height - 40;
      const playBtnX = pipCanvas.width / 2;
      const playBtnRadius = 25;
      
      // タイマータイプ切替ボタンの位置
      const switchBtnY = playBtnY;
      const switchBtnX = pipCanvas.width - 40;
      const switchBtnRadius = 20;
      
      // 再生/一時停止ボタンがクリックされたか
      const distanceToPlayBtn = Math.sqrt(
        Math.pow(x - playBtnX, 2) + Math.pow(y - playBtnY, 2)
      );
      
      // タイマー切替ボタンがクリックされたか
      const distanceToSwitchBtn = Math.sqrt(
        Math.pow(x - switchBtnX, 2) + Math.pow(y - switchBtnY, 2)
      );
      
      if (distanceToPlayBtn <= playBtnRadius) {
        toggleTimer();
      } else if (distanceToSwitchBtn <= switchBtnRadius) {
        switchTimerType();
      }
    };
    
    pipCanvas.addEventListener('click', handlePipClick);
    
    return () => {
      pipCanvas.removeEventListener('click', handlePipClick);
    };
  }, [isPiPActive, timerState, timerType]);

  // PiPウィンドウが閉じられたときのイベント処理
  useEffect(() => {
    if (!pipWindowRef.current) return;
    
    const handlePipClose = () => {
      setIsPiPActive(false);
      pipWindowRef.current = null;
      pipCanvasRef.current = null;
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
        pipCanvasRef.current = null;
        setIsPiPActive(false);
      } else {
        // PiPウィンドウのサイズ
        const pipWidth = 320;
        const pipHeight = 320;
        
        // PiPウィンドウの作成
        const pipWindow = await window.documentPictureInPicture.requestWindow({
          width: pipWidth,
          height: pipHeight
        });
        pipWindowRef.current = pipWindow;
        
        // PiPウィンドウのスタイルとコンテンツを設定
        pipWindow.document.body.style.margin = '0';
        pipWindow.document.body.style.padding = '0';
        pipWindow.document.body.style.overflow = 'hidden';
        pipWindow.document.title = 'ポモドーロタイマー';
        
        // PiP用のキャンバスを作成
        const pipCanvas = pipWindow.document.createElement('canvas');
        pipCanvas.width = pipWidth;
        pipCanvas.height = pipHeight;
        pipCanvas.style.display = 'block';
        pipWindow.document.body.appendChild(pipCanvas);
        pipCanvasRef.current = pipCanvas;
        
        // PiPキャンバスにタイマーを描画
        drawTimerCanvas(pipCanvas, pipWidth, pipHeight, true);
        
        setIsPiPActive(true);
      }
    } catch (err) {
      console.error('PiPの切り替えに失敗しました:', err);
      alert('ピクチャーインピクチャーの表示に失敗しました。ブラウザがDocument Picture-in-Picture APIをサポートしていない可能性があります。');
      setIsPiPActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">ポモドーロタイマー</h1>
      
      <div className="relative mb-8">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={200} 
          className="rounded-lg shadow-lg"
        />
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
        {isPiPActive && <p className="mt-2">PiP内でのタイマー操作: ウィンドウ下部のボタンをクリック</p>}
      </div>
    </div>
  )
}

export default App
