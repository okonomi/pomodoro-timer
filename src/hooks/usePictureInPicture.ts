import { useState, useRef, useEffect } from 'react';

interface UsePictureInPictureOptions {
  width?: number;
  height?: number;
  onClose?: () => void;
}

export function usePictureInPicture({
  width = 320,
  height = 280,
  onClose,
}: UsePictureInPictureOptions = {}) {
  const [isPiPActive, setIsPiPActive] = useState(false);
  const pipWindowRef = useRef<Window | null>(null);

  // PiPウィンドウが閉じられたときのイベント処理
  useEffect(() => {
    if (!pipWindowRef.current) return;
    
    const handlePipClose = () => {
      setIsPiPActive(false);
      pipWindowRef.current = null;
      if (onClose) onClose();
    };
    
    if (isPiPActive && pipWindowRef.current) {
      pipWindowRef.current.addEventListener('pagehide', handlePipClose);
      
      return () => {
        if (pipWindowRef.current) {
          pipWindowRef.current.removeEventListener('pagehide', handlePipClose);
        }
      };
    }
  }, [isPiPActive, onClose]);

  // PiPウィンドウの開閉を制御する関数
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
        // PiPウィンドウの作成
        const pipWindow = await window.documentPictureInPicture.requestWindow({
          width,
          height
        });
        pipWindowRef.current = pipWindow;
        
        // ページのタイトルを設定
        pipWindow.document.title = 'ポモドーロタイマー';
        
        // Tailwind CSSを読み込む
        const linkEl = pipWindow.document.createElement('link');
        linkEl.rel = 'stylesheet';
        linkEl.href = window.location.origin + '/src/index.css'; // Tailwind CSSへのパス
        pipWindow.document.head.appendChild(linkEl);
        
        // 最低限のスタイルを設定
        const style = pipWindow.document.createElement('style');
        style.textContent = `
          body {
            margin: 0;
            padding: 0;
            height: 100vh;
            overflow: hidden;
          }
        `;
        pipWindow.document.head.appendChild(style);
        
        // PiPウィンドウがアクティブに
        setIsPiPActive(true);
      }
    } catch (err) {
      console.error('PiPの切り替えに失敗しました:', err);
      alert('ピクチャーインピクチャーの表示に失敗しました。ブラウザがDocument Picture-in-Picture APIをサポートしていない可能性があります。');
      setIsPiPActive(false);
    }
  };

  return {
    isPiPActive,
    pipWindowRef,
    togglePiP,
  };
}