/**
 * 本地测试模块 - 加载环境变量后调用主程序
 */
// 加载.env文件中的环境变量
import * as dotenv from 'dotenv'

dotenv.config()

console.log('==========================================')
console.log('🧪 本地测试模式启动')

// 测试环境设置小批量参数，如果.env中没有设置的话
if (!process.env.BATCH_SIZE) {
  process.env.BATCH_SIZE = '5' // 本地测试使用较小的批次
}

if (!process.env.BATCH_INTERVAL) {
  process.env.BATCH_INTERVAL = '500' // 本地测试使用较短的间隔
}

// 调用主程序
import './index'
