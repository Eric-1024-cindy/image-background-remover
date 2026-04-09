'use client'

import { useState, useCallback } from 'react'
import UploadZone from '@/components/UploadZone'
import CompareSlider from '@/components/CompareSlider'

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

const REMOVE_BG_API_KEY = '2CRu7A18Vonjf7UbymGN7P5s'
const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg'

export default function Home() {
  const [state, setState] = useState<ProcessingState>('idle')
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [originalFileName, setOriginalFileName] = useState<string>('')

  const processImage = useCallback(async (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('图片太大了，请上传小于 25MB 的图片')
      setState('error')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('只支持 JPG、PNG、WebP 格式哦')
      setState('error')
      return
    }

    setOriginalFileName(file.name.replace(/\.[^/.]+$/, ''))
    setErrorMessage(null)
    setOriginalImage(URL.createObjectURL(file))
    setState('uploading')

    try {
      setState('processing')

      const formData = new FormData()
      formData.append('image_file', file)
      formData.append('size', 'auto')
      formData.append('format', 'png')

      const response = await fetch(REMOVE_BG_API_URL, {
        method: 'POST',
        headers: {
          'X-Api-Key': REMOVE_BG_API_KEY,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 402) {
          throw new Error('API 额度已用完，请明天再来或使用自己的 API Key')
        }
        throw new Error(errorData.errors?.[0]?.title || '处理失败，请稍后重试')
      }

      const blob = await response.blob()
      const resultUrl = URL.createObjectURL(blob)
      setResultImage(resultUrl)
      setState('done')
    } catch (error) {
      console.error('Processing error:', error)
      setErrorMessage(error instanceof Error ? error.message : '处理失败了，请稍后重试')
      setState('error')
    }
  }, [])

  const handleReset = useCallback(() => {
    if (originalImage) URL.revokeObjectURL(originalImage)
    if (resultImage) URL.revokeObjectURL(resultImage)
    setState('idle')
    setOriginalImage(null)
    setResultImage(null)
    setErrorMessage(null)
    setOriginalFileName('')
  }, [originalImage, resultImage])

  const handleDownload = useCallback(() => {
    if (!resultImage) return
    const link = document.createElement('a')
    link.href = resultImage
    link.download = `${originalFileName || 'image'}_remove_bg.png`
    link.click()
  }, [resultImage, originalFileName])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <header className="py-6 px-4 border-b border-indigo-100/50 bg-white/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Background Remover</h1>
            <p className="text-xs text-slate-500">AI-powered • 100% automatic</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {state === 'idle' && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <UploadZone onImageUpload={processImage} disabled={state !== 'idle'} />
            <div className="mt-6 text-sm text-slate-500">上传图片后，自动消除背景，无需任何操作</div>
          </div>
        )}

        {(state === 'uploading' || state === 'processing') && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="bg-white rounded-2xl p-12 shadow-xl shadow-indigo-100/50 max-w-md w-full text-center">
              {originalImage && (
                <div className="mb-6 flex justify-center">
                  <img src={originalImage} alt="Uploading" className="h-32 object-contain rounded-lg opacity-60" />
                </div>
              )}
              <div className="text-5xl mb-4">🌀</div>
              <div className="text-lg font-semibold text-slate-700 mb-2">
                {state === 'uploading' ? '正在上传图片...' : '正在消除背景...'}
              </div>
              <div className="text-sm text-slate-500">通常只需 3-5 秒</div>
            </div>
          </div>
        )}

        {state === 'done' && originalImage && resultImage && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-indigo-100/50">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-slate-700">✨ 处理完成！</h2>
                <p className="text-sm text-slate-500">拖动滑块对比原图和结果</p>
              </div>
              <CompareSlider originalImage={originalImage} resultImage={resultImage} alt={originalFileName} />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleDownload}
                className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                下载 PNG
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-600 font-medium rounded-xl border border-slate-200 transition-colors"
              >
                处理下一张
              </button>
            </div>

            <div className="text-center text-sm text-slate-500 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              您的图片在内存中处理后立即删除，不会存储在任何地方
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="text-5xl mb-4">❌</div>
                <div className="text-lg font-semibold text-red-600 mb-2">{errorMessage}</div>
                <div className="text-sm text-slate-500 mb-6">请尝试重新上传图片</div>
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  重新开始
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-4 px-4 text-center">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-sm text-slate-400">
          <a href="#" className="hover:text-slate-600 transition-colors">隐私声明</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-600 transition-colors">免责声明</a>
          <span>•</span>
          <span>Powered by Remove.bg API</span>
        </div>
      </footer>
    </div>
  )
}
