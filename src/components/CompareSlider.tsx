'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

interface CompareSliderProps {
  originalImage: string
  resultImage: string
  alt?: string
}

export default function CompareSlider({ originalImage, resultImage, alt = 'Compare' }: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }
  }, [])

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX)
  }, [handleMove])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }, [handleMove])

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl select-none cursor-ew-resize shadow-inner"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Checkerboard background for result (shows transparency) */}
      <div className="absolute inset-0 checkerboard" />

      {/* Result image (background) */}
      <img
        src={resultImage}
        alt={`${alt} - Result`}
        className="relative w-full h-auto block"
        draggable={false}
      />

      {/* Original image (clip with slider) */}
      <div
        className="absolute top-0 left-0 h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={originalImage}
          alt={`${alt} - Original`}
          className="h-full object-cover"
          draggable={false}
          style={{ width: containerWidth || 'auto' }}
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Slider handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-200">
          <div className="flex items-center gap-0.5">
            <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5l-5 7 5 7M16 5l5 7-5 7" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 5l5 7-5 7M8 5l-5 7 5 7" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 text-white text-xs font-medium rounded-lg backdrop-blur-sm">
        Original
      </div>
      <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 text-white text-xs font-medium rounded-lg backdrop-blur-sm">
        Result
      </div>
    </div>
  )
}
