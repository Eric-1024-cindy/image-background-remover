'use client'

import { useState, useCallback, useRef } from 'react'
import UploadZone from '@/components/UploadZone'
import CompareSlider from '@/components/CompareSlider'

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export default function Home() {
  const [state, setState] = useState<ProcessingState>('idle')
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [originalFileName, setOriginalFileName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processImage = useCallback(async (file: File) => {
    // Validate file size (25MB)
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('图片太大了，请上传小于 25MB 的图片')
      setState('error')
      return
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('只支持 JPG、PNG、WebP 格式哦')
      setState('error')
      return
    }

    setOriginalFileName(file.name.replace(/\.[^/.]+$/, ''))
    setErrorMessage(null)

    // Read file as base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      setOriginalImage(base64)
      setState('uploading')

      try {
        setState('processing')

        const response = await fetch('/api/remove-bg', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64 }),
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || '处理失败')
        }

        setResultImage(data.result)
        setState('done')
      } catch (error) {
        console.error('Processing error:', error)
        setErrorMessage(error instanceof Error ? error.message : '处理失败了，请稍后重试')
        setState('error')
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const handleReset = useCallback(() => {
    setState('idle')
    setOriginalImage(null)
    setResultImage(null)
    setErrorMessage(null)
    setOriginalFileName('')
  }, [])

  const handleDownload = useCallback(() => {
    if (!resultImage) return
    const link = document.createElement('a')
    link.href = resultImage
    link.download = `${originalFileName || 'image'}_remove_bg.png`
    link.click()
  }, [resultImage, originalFileName])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900">🪄 BGRemover</h1>
          <p className="mt-2 text-gray-600">一键消除图片背景，无需注册，立即使用</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {state === 'idle' && (
          <UploadZone onImageUpload={processImage} disabled={state !== 'idle'} />
        )}

        {(state === 'uploading' || state === 'processing') && (
          <div className="space-y-8">
            {originalImage && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="text-center space-y-4">
                  <div className="text-5xl animate-bounce">⏳</div>
                  <div className="text-lg font-medium text-gray-700">
                    {state === 'uploading' ? '正在上传图片...' : '正在消除背景...'}
                  </div>
                  <div className="text-sm text-gray-500">
                    通常只需 3-5 秒，请稍候
                  </div>
                </div>
                {/* Show thumbnail of uploaded image */}
                <div className="mt-6 flex justify-center">
                  <img
                    src={originalImage}
                    alt="Uploading"
                    className="max-h-48 rounded-lg opacity-50"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {state === 'done' && originalImage && resultImage && (
          <div className="space-y-8">
            {/* Compare Slider */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <CompareSlider
                originalImage={originalImage}
                resultImage={resultImage}
                alt={originalFileName}
              />
            </div>

            {/* Download Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                <span>📥</span> 下载 PNG
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                处理下一张
              </button>
            </div>

            {/* Privacy Note */}
            <div className="text-center text-sm text-gray-500">
              🔒 您的图片在服务器内存中处理完成后立即删除，不会存储在任何地方
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <div className="font-medium text-red-800">{errorMessage}</div>
                  <div className="text-sm text-red-600 mt-1">请尝试重新上传图片</div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                重新开始
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-700">隐私声明</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-700">免责声明</a>
            <span>•</span>
            <span>Powered by Remove.bg</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
