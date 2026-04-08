export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const ErrorCodes = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FORMAT: 'INVALID_FORMAT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  TIMEOUT: 'TIMEOUT',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

export function getErrorMessage(code: ErrorCode): string {
  switch (code) {
    case ErrorCodes.FILE_TOO_LARGE:
      return '图片太大了，请上传小于 25MB 的图片'
    case ErrorCodes.INVALID_FORMAT:
      return '只支持 JPG、PNG、WebP 格式哦'
    case ErrorCodes.NETWORK_ERROR:
      return '网络不稳定，请检查网络后重试'
    case ErrorCodes.API_ERROR:
      return '处理失败了，请稍后重试'
    case ErrorCodes.TIMEOUT:
      return '处理超时，请稍后重试'
    case ErrorCodes.QUOTA_EXCEEDED:
      return '今日免费额度已用完，请明天再来或使用自己的 API Key'
    default:
      return '出了点小问题，请稍后重试'
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  result?: T
  error?: string
  code?: string
}
