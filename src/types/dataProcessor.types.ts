export interface ProcessedSignResult {
  success: boolean
  message: string
  info: {
    rank?: number | string
    continueCount?: number | string
    totalCount?: number | string
    [key: string]: any
  }
}

export interface SignResultItem extends ProcessedSignResult {
  name: string
  index: number
  retried?: boolean
  retryCount?: number
}

export interface SignResultSummary {
  totalCount: number
  successCount: number
  alreadySignedCount: number
  failedCount: number
  signResults: {
    success: SignResultItem[]
    failed: SignResultItem[]
  }
}
