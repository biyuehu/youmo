import * as crypto from 'node:crypto'
import type { AxiosResponse } from 'axios'
import axios from 'axios'
import {
  type BarkOptions,
  type DingTalkOptions,
  type MakiOptions,
  type NotifyResult,
  type PushPlusOptions,
  type ServerChanOptions,
  type TelegramOptions,
  type WeComOptions
} from './types/notify.types'
import { formatDate } from './utils'

/**
 * 构建通知标题
 * @returns 通知标题
 */
export function getNotifyTitle(): string {
  return `百度贴吧自动签到 - ${formatDate(new Date(), 'Asia/Shanghai', '+8').split(' ')[0]}`
}

/**
 * 处理通知发送的结果
 * @param platform - 平台名称
 * @param response - 响应结果
 */
function handleNotifyResult(platform: string, response: AxiosResponse | undefined): void {
  if (response && response.status === 200) {
    console.log(`✅ ${platform}通知发送成功`)
  } else {
    console.log(`⚠️ ${platform}通知发送失败: ${response?.statusText || '未知错误'}`)
  }
}

/**
 * Maki酱通知
 * @param options - Maki酱配置选项
 * @returns 发送结果
 */
export async function sendMaki(options: MakiOptions): Promise<NotifyResult> {
  const { url, token, title, content } = options
  if (!url || !token) return { success: false, message: 'Maki酱配置不完整', channel: 'Maki' }

  try {
    const apiUrl = `${url.replace(/\/$/, '')}/maki`
    const response = await axios.post(apiUrl, {
      token,
      title,
      content
    })
    if (response.data?.code === 0) {
      console.log(`✅ Maki酱通知发送成功`)
      return { success: true, message: 'Maki酱通知发送成功', channel: 'Maki' }
    }
    console.log(`⚠️ Maki酱通知发送失败: ${response.data?.message || '未知错误'}`)
    return { success: false, message: response.data?.message || '未知错误', channel: 'Maki' }
  } catch (error) {
    const err = error as Error
    console.error(`❌ Maki酱通知发送失败: ${err.message}`)
    return { success: false, message: err.message, channel: 'Maki' }
  }
}

/**
 * Server酱通知 (ServerChan)
 * @param options - Server酱配置选项
 * @returns 发送结果
 */
export async function sendServerChan(options: ServerChanOptions): Promise<NotifyResult> {
  const { key, title, content } = options
  if (!key) return { success: false, message: 'Server酱KEY未设置' }

  try {
    const url = `https://sctapi.ftqq.com/${key}.send`
    const response = await axios.post(url, {
      title: title,
      desp: content
    })
    handleNotifyResult('Server酱', response)
    return {
      success: true,
      message: 'Server酱通知发送成功',
      channel: 'ServerChan'
    }
  } catch (error) {
    const err = error as Error
    console.error(`❌ Server酱通知发送失败: ${err.message}`)
    return { success: false, message: err.message, channel: 'ServerChan' }
  }
}

/**
 * Bark通知
 * @param options - Bark配置选项
 * @returns 发送结果
 */
export async function sendBark(options: BarkOptions): Promise<NotifyResult> {
  const { key, title, content } = options
  if (!key) return { success: false, message: 'Bark KEY未设置', channel: 'Bark' }

  try {
    // 处理Bark地址，兼容自建服务和官方服务
    let barkUrl = key
    if (!barkUrl.startsWith('http')) {
      barkUrl = `https://api.day.app/${key}`
    }
    if (!barkUrl.endsWith('/')) {
      barkUrl += '/'
    }

    const url = `${barkUrl}${encodeURIComponent(title || '')}/${encodeURIComponent(content)}`
    const response = await axios.get(url)
    handleNotifyResult('Bark', response)
    return { success: true, message: 'Bark通知发送成功', channel: 'Bark' }
  } catch (error) {
    const err = error as Error
    console.error(`❌ Bark通知发送失败: ${err.message}`)
    return { success: false, message: err.message, channel: 'Bark' }
  }
}

/**
 * Telegram Bot通知
 * @param options - Telegram配置选项
 * @returns 发送结果
 */
export async function sendTelegram(options: TelegramOptions): Promise<NotifyResult> {
  const { botToken, chatId, message, parseMode = 'Markdown' } = options
  if (!botToken || !chatId)
    return {
      success: false,
      message: 'Telegram配置不完整',
      channel: 'Telegram'
    }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`

    const response = await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: parseMode
    })
    handleNotifyResult('Telegram', response)
    return {
      success: true,
      message: 'Telegram通知发送成功',
      channel: 'Telegram'
    }
  } catch (error) {
    const err = error as Error
    console.error(`❌ Telegram通知发送失败: ${err.message}`)
    return { success: false, message: err.message, channel: 'Telegram' }
  }
}

/**
 * 钉钉机器人通知
 * @param options - 钉钉配置选项
 * @returns 发送结果
 */
export async function sendDingTalk(options: DingTalkOptions): Promise<NotifyResult> {
  const { webhook, secret, title, content } = options
  if (!webhook)
    return {
      success: false,
      message: '钉钉Webhook未设置',
      channel: 'DingTalk'
    }

  try {
    // 如果有安全密钥，需要计算签名
    let url = webhook
    if (secret) {
      const timestamp = Date.now()
      const hmac = crypto.createHmac('sha256', secret)
      const sign = encodeURIComponent(hmac.update(`${timestamp}\n${secret}`).digest('base64'))
      url = `${webhook}&timestamp=${timestamp}&sign=${sign}`
    }

    const response = await axios.post(url, {
      msgtype: 'markdown',
      markdown: {
        title: title || '通知',
        text: `### ${title || '通知'}\n${content}`
      }
    })
    handleNotifyResult('钉钉', response)
    return { success: true, message: '钉钉通知发送成功', channel: 'DingTalk' }
  } catch (error) {
    const err = error as Error
    console.error(`❌ 钉钉通知发送失败: ${err.message}`)
    return { success: false, message: err.message, channel: 'DingTalk' }
  }
}

/**
 * 企业微信通知
 * @param options - 企业微信配置选项
 * @returns 发送结果
 */
export async function sendWecom(options: WeComOptions): Promise<NotifyResult> {
  const { key, content, title } = options
  if (!key) return { success: false, message: '企业微信KEY未设置', channel: 'WeCom' }

  try {
    const url = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${key}`
    const response = await axios.post(url, {
      msgtype: 'markdown',
      markdown: {
        content: `### ${title || '通知'}\n${content}`
      }
    })
    handleNotifyResult('企业微信', response)
    return { success: true, message: '企业微信通知发送成功', channel: 'WeCom' }
  } catch (error) {
    const err = error as Error
    console.error(`❌ 企业微信通知发送失败: ${err.message}`)
    return { success: false, message: err.message, channel: 'WeCom' }
  }
}

/**
 * PushPlus通知
 * @param options - PushPlus配置选项
 * @returns 发送结果
 */
export async function sendPushPlus(options: PushPlusOptions): Promise<NotifyResult> {
  const { token, title, content, template = 'markdown' } = options
  if (!token)
    return {
      success: false,
      message: 'PushPlus Token未设置',
      channel: 'PushPlus'
    }

  try {
    const url = 'https://www.pushplus.plus/send'
    const response = await axios.post(url, {
      token: token,
      title: title || '通知',
      content: content,
      template: template
    })
    handleNotifyResult('PushPlus', response)
    return {
      success: true,
      message: 'PushPlus通知发送成功',
      channel: 'PushPlus'
    }
  } catch (error) {
    const err = error as Error
    console.error(`❌ PushPlus通知发送失败: ${err.message}`)
    return { success: false, message: err.message, channel: 'PushPlus' }
  }
}

/**
 * 发送通知到所有已配置的平台
 * @param summary - 要发送的通知内容
 * @returns 是否有任何通知发送成功
 */
export async function sendNotification(summary: string): Promise<boolean> {
  console.log('📱 开始发送通知...')

  const title = getNotifyTitle()
  let anySuccess = false
  let enabled = false

  // Maki酱通知
  if (process.env.MAKI_URL && process.env.MAKI_TOKEN) {
    enabled = true
    const result = await sendMaki({
      url: process.env.MAKI_URL,
      token: process.env.MAKI_TOKEN,
      title: title,
      content: summary
    })
    if (result.success) anySuccess = true
  }

  // Server 酱通知
  if (process.env.SERVERCHAN_KEY) {
    enabled = true
    const result = await sendServerChan({
      key: process.env.SERVERCHAN_KEY,
      title: title,
      content: summary
    })
    if (result.success) anySuccess = true
  }

  // Bark 通知
  if (process.env.BARK_KEY) {
    enabled = true
    const result = await sendBark({
      key: process.env.BARK_KEY,
      title: title,
      content: summary
    })
    if (result.success) anySuccess = true
  }

  // Telegram 通知
  if (process.env.TG_BOT_TOKEN && process.env.TG_CHAT_ID) {
    enabled = true
    const result = await sendTelegram({
      botToken: process.env.TG_BOT_TOKEN,
      chatId: process.env.TG_CHAT_ID,
      message: `${title}\n\n${summary}`
    })
    if (result.success) anySuccess = true
  }

  // 钉钉通知
  if (process.env.DINGTALK_WEBHOOK) {
    enabled = true
    const result = await sendDingTalk({
      webhook: process.env.DINGTALK_WEBHOOK,
      secret: process.env.DINGTALK_SECRET,
      title: title,
      content: summary
    })
    if (result.success) anySuccess = true
  }

  // 企业微信通知
  if (process.env.WECOM_KEY) {
    enabled = true
    const result = await sendWecom({
      key: process.env.WECOM_KEY,
      title: title,
      content: summary
    })
    if (result.success) anySuccess = true
  }

  // PushPlus 通知
  if (process.env.PUSHPLUS_TOKEN) {
    enabled = true
    const result = await sendPushPlus({
      token: process.env.PUSHPLUS_TOKEN,
      title: title,
      content: summary
    })
    if (result.success) anySuccess = true
  }

  if (anySuccess) {
    console.log('✅ 通知发送完成')
  } else if (enabled) {
    console.log('⚠️ 没有通知被发送，请检查通知配置')
  } else {
    console.log('ℹ️ 未配置任何通知渠道，跳过通知发送')
  }

  return anySuccess
}
