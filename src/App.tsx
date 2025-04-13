import { useState, useEffect, useRef } from 'react'
import './App.css'

// タイマーの種類を定義する型
type TimerType = 'work' | 'break';

// タイマーの状態を定義する型
type TimerState = 'running' | 'paused';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  
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
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 背景を描画
    ctx.fillStyle = '#1e293b'; // Tailwindのslate-800相当
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 円形プログレスバーの描画
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // 残り時間の割合を計算
    const totalTime = timerType === 'work' ? workDuration : breakDuration;
    const progress = timeLeft / totalTime;
    
    // 背景の円を描画
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#475569'; // Tailwindのslate-600相当
    ctx.lineWidth = 15;
    ctx.stroke();
    
    // 進行状況の円を描画
    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      radius,
      -Math.PI / 2,
      -Math.PI / 2 + (Math.PI * 2 * (1 - progress))
    );
    ctx.strokeStyle = timerType === 'work' ? '#3b82f6' : '#22c55e'; // work: blue-500, break: green-500
    ctx.stroke();
    
    // 残り時間のテキスト表示
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(timeText, centerX, centerY - 15);
    
    // ステータステキスト
    ctx.font = '20px sans-serif';
    ctx.fillText(timerType === 'work' ? '作業中' : '休憩中', centerX, centerY + 25);
    
    // PiPモード用に動画に描画内容をコピー
    const video = videoRef.current;
    if (video && isPiPActive) {
      const stream = canvas.captureStream();
      if (video.srcObject !== stream) {
        video.srcObject = stream;
        // ビデオの再生を確実に開始
        video.play().catch(err => console.error('ビデオ再生エラー:', err));
      }
    }
  }, [timeLeft, timerType, isPiPActive]);

  // Canvas の描画更新を高頻度で行い、滑らかなアニメーションを実現
  useEffect(() => {
    let animationFrameId: number;
    
    if (isPiPActive) {
      const updateCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          // 毎フレーム強制的に再描画をトリガー
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // 既存のキャンバス描画内容を保持しつつ微小変更を加えて再描画をトリガー
            const pixel = ctx.getImageData(0, 0, 1, 1);
            ctx.putImageData(pixel, 0, 0);
          }
        }
        animationFrameId = requestAnimationFrame(updateCanvas);
      };
      
      animationFrameId = requestAnimationFrame(updateCanvas);
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPiPActive]);

  // video要素のソース設定とPiP表示を別々に管理
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    // PiP表示用のビデオストリームを設定
    if (isPiPActive) {
      const stream = canvas.captureStream(30); // フレームレート指定
      video.srcObject = stream;
      
      // ビデオ要素の再生を開始
      video.play().catch(err => {
        console.error('ビデオの再生に失敗しました:', err);
        setIsPiPActive(false);
      });
    } else {
      // PiP非アクティブ時はストリームを停止
      if (video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
      }
    }
  }, [isPiPActive]);

  // Picture-in-Picture機能の切り替え
  const togglePiP = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    try {
      if (document.pictureInPictureElement) {
        // PiPモードを終了
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      } else {
        // PiPモードを開始
        // ストリームが設定されていない場合は設定
        const stream = canvas.captureStream(30);
        video.srcObject = stream;
        
        // 再生開始が必要（PiP APIは再生中のビデオのみ対応）
        await video.play();
        
        // PiPモードをリクエスト
        await video.requestPictureInPicture();
        setIsPiPActive(true);
      }
    } catch (err) {
      console.error('PiPの切り替えに失敗しました:', err);
      alert('ピクチャーインピクチャーの表示に失敗しました。ブラウザがこの機能をサポートしていない可能性があります。');
      setIsPiPActive(false);
    }
  };

  // PiPモードが終了した時のイベント処理
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePiPExit = () => {
      setIsPiPActive(false);
    };

    video.addEventListener('leavepictureinpicture', handlePiPExit);
    
    return () => {
      video.removeEventListener('leavepictureinpicture', handlePiPExit);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">ポモドーロタイマー</h1>
      
      <div className="relative mb-8">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={300} 
          className="rounded-full shadow-lg"
        />
        <video 
          ref={videoRef} 
          className="hidden" 
          muted 
          playsInline 
          autoPlay
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
      </div>
    </div>
  )
}

export default App
