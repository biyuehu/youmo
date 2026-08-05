export function toQueryString(obj: Record<string, any>): string {
  return Object.keys(obj)
    .map((key) => `${key}=${encodeURIComponent(obj[key])}`)
    .join('&')
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min)
  return Math.floor(Math.random() * (Math.floor(max) - min + 1)) + min
}

export function formatDate(date: Date, timezone: string, offset: string): string {
  return `${date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timezone
  })} (${offset})`
}

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
  if (name.length <= 2) return `${name[0]}*`
  if (name.length <= 5) return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
  return name.substring(0, 2) + '*'.repeat(3) + name.substring(name.length - 1)
}
