export interface UserInfo {
  status: number
  message?: string
  displayname?: string
  userId?: string
  bduss?: string
  isValid?: boolean
  deviceId?: string
  [key: string]: any
}

export interface TiebaInfo {
  forum_id: number
  forum_name: string
  is_sign: number
  is_like: boolean
  favo_type: number
  user_level: string
  user_exp: string
  [key: string]: any
}

export interface TiebaList extends Array<TiebaInfo> {}

export interface SignResult {
  error_code?: string | number
  error_msg?: string
  error?: string
  no?: number
  data?: {
    errno?: number
    errmsg?: string
    uinfo?: {
      user_sign_rank?: number
      cont_sign_num?: number
    }
    [key: string]: any
  }
  user_info?: {
    user_id?: number | string
    is_sign_in?: number
    user_sign_rank?: number
    sign_time?: number | string
    cont_sign_num?: number
    total_sign_num?: number
    cout_total_sing_num?: number
    hun_sign_num?: number
    total_resign_num?: number
    is_org_name?: number
  }
  [key: string]: any
}

export interface TbsResult {
  tbs: string
  is_login: number
  [key: string]: any
}
