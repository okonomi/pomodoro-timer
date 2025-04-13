import { useEffect, useRef, useState } from "react"

interface UsePictureInPictureOptions {
  width?: number
  height?: number
  onClose?: () => void
}

export function usePictureInPicture({
  width = 320,
  height = 100, // 高さを100pxに変更
  onClose,
}: UsePictureInPictureOptions = {}) {
  const [isPiPActive, setIsPiPActive] = useState(false)
  const pipWindowRef = useRef<Window | null>(null)

  // Event handler for when the PiP window is closed
  useEffect(() => {
    if (!pipWindowRef.current) return

    const handlePipClose = () => {
      setIsPiPActive(false)
      pipWindowRef.current = null
      if (onClose) onClose()
    }

    if (isPiPActive && pipWindowRef.current) {
      pipWindowRef.current.addEventListener("pagehide", handlePipClose)

      return () => {
        if (pipWindowRef.current) {
          pipWindowRef.current.removeEventListener("pagehide", handlePipClose)
        }
      }
    }
  }, [isPiPActive, onClose])

  // Function to control the opening and closing of the PiP window
  const togglePiP = async () => {
    try {
      // Check for Document PiP API support
      if (!window.documentPictureInPicture) {
        throw new Error(
          "This browser does not support Document Picture-in-Picture API"
        )
      }

      if (isPiPActive && pipWindowRef.current) {
        // Exit PiP mode
        pipWindowRef.current.close()
        pipWindowRef.current = null
        setIsPiPActive(false)
      } else {
        // Create the PiP window
        const pipWindow = await window.documentPictureInPicture.requestWindow({
          width,
          height,
        })
        pipWindowRef.current = pipWindow

        // Set the page title
        pipWindow.document.title = "Pomodoro Timer"

        // Load all stylesheets from the main document to ensure Tailwind CSS works
        const stylesheets = Array.from(document.styleSheets)
        stylesheets.forEach((stylesheet) => {
          try {
            // Only process stylesheets from the same origin (skip external stylesheets)
            if (stylesheet.href && !stylesheet.href.startsWith("data:")) {
              const linkEl = pipWindow.document.createElement("link")
              linkEl.rel = "stylesheet"
              linkEl.href = stylesheet.href
              pipWindow.document.head.appendChild(linkEl)
            } else if (stylesheet.cssRules && stylesheet.cssRules.length > 0) {
              // For inline styles (like those injected by Vite in dev mode)
              const style = pipWindow.document.createElement("style")
              Array.from(stylesheet.cssRules).forEach((rule) => {
                style.appendChild(
                  pipWindow.document.createTextNode(rule.cssText)
                )
              })
              pipWindow.document.head.appendChild(style)
            }
          } catch (e) {
            // CORS restrictions may prevent reading cssRules from some stylesheets
            console.warn("Could not copy stylesheet to PiP window:", e)
          }
        })

        // Activate the PiP window
        setIsPiPActive(true)
      }
    } catch (err) {
      console.error("Failed to toggle Picture-in-Picture:", err)
      alert(
        "Failed to display Picture-in-Picture. Your browser may not support the Document Picture-in-Picture API."
      )
      setIsPiPActive(false)
    }
  }

  return {
    isPiPActive,
    pipWindowRef,
    togglePiP,
  }
}
