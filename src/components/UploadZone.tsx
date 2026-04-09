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
      className={`relative w-full max-w-xl mx-auto rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
        isDragging
          ? 'border-indigo-400 bg-indigo-50'
          : 'border-indigo-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
      <div className="py-16 px-8 text-center">
        {/* Cloud upload icon */}
        <div className={`mb-6 flex justify-center transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-lg font-semibold text-slate-700">
            拖拽图片到这里，或点击选择文件
          </div>
          <div className="text-sm text-slate-500">
            支持 JPG、PNG、WebP 格式，最大 25MB
          </div>
        </div>
      </div>
    </div>
  )
}
