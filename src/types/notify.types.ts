export interface NotifyOptions {
  title?: string
  content: string
  [key: string]: any
}

export interface NotifyResult {
  success: boolean
  message: string
  channel?: string
}

export interface ServerChanOptions {
  key: string
  title?: string
  content: string
}

export interface BarkOptions {
  key: string
  title?: string
  content: string
  sound?: string
  icon?: string
}

export interface TelegramOptions {
  botToken: string
  chatId: string
  message: string
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
}

export interface DingTalkOptions {
  webhook: string
  secret?: string
  content: string
  title?: string
}

export interface WeComOptions {
  key: string
  content: string
  title?: string
}

export interface PushPlusOptions {
  token: string
  title?: string
  content: string
  template?: 'html' | 'json' | 'markdown' | 'txt'
}
