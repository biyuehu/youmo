export interface DateFormatOptions {
  timeZone: string
  utcOffset: string
}

export type DateFormatTemplateFunction = (date: Date, options?: DateFormatOptions) => string
