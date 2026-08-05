/**
 * 工具函数集合
 */

/**
 * 将对象转换为URL查询字符串
 * @param obj - 要转换的对象
 * @returns URL查询字符串
 */
export function toQueryString(obj: Record<string, any>): string {
  return Object.keys(obj)
    .map((key) => `${key}=${encodeURIComponent(obj[key])}`)
    .join('&')
}

/**
 * 获取指定范围内的随机整数
 * @param min - 最小值
 * @param max - 最大值
 * @returns 随机整数
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 格式化时间
 * @param date - 日期对象
 * @param timezone - 时区x
 * @param offset - 时区偏移显示值
 * @returns 格式化后的时间字符串
 */
export function formatDate(date: Date, timezone: string, offset: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timezone
  }

  const formattedDate = date.toLocaleString('zh-CN', options)
  return `${formattedDate} (${offset})`
}

/**
 * 生成随机设备ID
 * @returns 随机设备ID
 */
export function generateDeviceId(): string {
  return `BDTIEBA_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * 对贴吧名称进行脱敏处理
 * @param name - 贴吧名称
 * @returns 脱敏后的名称
 */
export function maskTiebaName(name: string): string {
  if (!name) return '未知贴吧'

  // 对于极短的名称，保留第一个字符
  if (name.length <= 2) {
    return `${name[0]}*`
  }

  // 对于普通长度的名称，保留首尾字符，中间用星号代替
  if (name.length <= 5) {
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
  }

  // 对于较长的名称，保留前两个字符和最后一个字符
  return name.substring(0, 2) + '*'.repeat(3) + name.substring(name.length - 1)
}
