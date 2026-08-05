import * as dotenv from 'dotenv'

dotenv.config()

console.log('==========================================')
console.log('🧪 本地测试模式启动')

if (!process.env.BATCH_SIZE) {
  process.env.BATCH_SIZE = '5'
}

if (!process.env.BATCH_INTERVAL) {
  process.env.BATCH_INTERVAL = '500'
}

import './index'
