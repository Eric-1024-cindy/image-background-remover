'use client'

import { useRef, useState, useCallback } from 'react'

interface CompareSliderProps {
  originalImage: string
  resultImage: string
  alt?: string
}

export default function CompareSlider({ originalImage, resultImage, alt = 'Compare' }: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

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
      className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-xl select-none cursor-ew-resize"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Result image (background) */}
      <img
        src={resultImage}
        alt={`${alt} - Result`}
        className="w-full h-auto block"
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
          style={{ width: containerRef.current?.offsetWidth }}
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Slider handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <span className="text-gray-500 text-xs">⋮</span>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 text-white text-xs rounded">
        Original
      </div>
      <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded">
        Result
      </div>
    </div>
  )
}
