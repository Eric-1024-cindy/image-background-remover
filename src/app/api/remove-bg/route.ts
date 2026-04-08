import { NextRequest, NextResponse } from 'next/server'

const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY
const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image } = body

    if (!image) {
      return NextResponse.json(
        { success: false, error: '缺少图片数据' },
        { status: 400 }
      )
    }

    // Extract base64 data from data URL
    const base64Data = image.split(',')[1]
    if (!base64Data) {
      return NextResponse.json(
        { success: false, error: '无效的图片格式' },
        { status: 400 }
      )
    }

    // Convert base64 to Buffer
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // Call Remove.bg API
    const formData = new FormData()
    formData.append('image_file', new Blob([imageBuffer]), 'image.png')
    formData.append('size', 'auto')
    formData.append('format', 'png')

    const apiKey = REMOVE_BG_API_KEY || process.env.REMOVE_BG_API_KEY_FALLBACK

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Key 未配置，请联系管理员' },
        { status: 500 }
      )
    }

    const response = await fetch(REMOVE_BG_API_URL, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Remove.bg API error:', errorText)

      if (response.status === 402) {
        return NextResponse.json(
          { success: false, error: 'API 额度已用完，请明天再来或使用自己的 API Key' },
          { status: 402 }
        )
      }

      return NextResponse.json(
        { success: false, error: '处理失败，请稍后重试' },
        { status: 500 }
      )
    }

    const resultBuffer = await response.arrayBuffer()
    const resultBase64 = Buffer.from(resultBuffer).toString('base64')
    const resultDataUrl = `data:image/png;base64,${resultBase64}`

    return NextResponse.json({
      success: true,
      result: resultDataUrl,
    })
  } catch (error) {
    console.error('Remove-bg API error:', error)
    return NextResponse.json(
      { success: false, error: '处理超时，请稍后重试' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
  },
}
