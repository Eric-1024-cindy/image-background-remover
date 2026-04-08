'use client'

import { useCallback, useState } from 'react'

interface UploadZoneProps {
  onImageUpload: (file: File) => void
  disabled?: boolean
}

export default function UploadZone({ onImageUpload, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file)
    }
  }, [disabled, onImageUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageUpload(file)
    }
  }, [onImageUpload])

  return (
    <div
      className={`relative w-full max-w-xl mx-auto border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-white hover:border-gray-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />
      <div className="space-y-4">
        <div className="text-5xl">🖼️</div>
        <div className="text-lg font-medium text-gray-700">
          拖拽图片到这里，或点击选择文件
        </div>
        <div className="text-sm text-gray-500">
          支持 JPG、PNG、WebP 格式，最大 25MB
        </div>
      </div>
    </div>
  )
}
