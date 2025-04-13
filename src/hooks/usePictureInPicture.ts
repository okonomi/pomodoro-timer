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

  // Event handler for when the PiP window is closed
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

  // Function to control the opening and closing of the PiP window
  const togglePiP = async () => {
    try {
      // Check for Document PiP API support
      if (!window.documentPictureInPicture) {
        throw new Error('This browser does not support Document Picture-in-Picture API');
      }
      
      if (isPiPActive && pipWindowRef.current) {
        // Exit PiP mode
        pipWindowRef.current.close();
        pipWindowRef.current = null;
        setIsPiPActive(false);
      } else {
        // Create the PiP window
        const pipWindow = await window.documentPictureInPicture.requestWindow({
          width,
          height
        });
        pipWindowRef.current = pipWindow;
        
        // Set the page title
        pipWindow.document.title = 'Pomodoro Timer';
        
        // Load Tailwind CSS
        const linkEl = pipWindow.document.createElement('link');
        linkEl.rel = 'stylesheet';
        linkEl.href = window.location.origin + '/src/index.css'; // Path to Tailwind CSS
        pipWindow.document.head.appendChild(linkEl);
        
        // Set minimal styles
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
        
        // Activate the PiP window
        setIsPiPActive(true);
      }
    } catch (err) {
      console.error('Failed to toggle Picture-in-Picture:', err);
      alert('Failed to display Picture-in-Picture. Your browser may not support the Document Picture-in-Picture API.');
      setIsPiPActive(false);
    }
  };

  return {
    isPiPActive,
    pipWindowRef,
    togglePiP,
  };
}