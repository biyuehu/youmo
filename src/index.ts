import { getTbs, getTiebaList, login, signTieba } from './apiService'
import { formatSummary, processSignResult, summarizeResults } from './dataProcessor'
import { sendNotification } from './notify'
import type { TiebaInfo } from './types/apiService.types'
import type { SignResultItem } from './types/dataProcessor.types'
import { formatDate, maskTiebaName } from './utils'

const isDebug = process.argv.includes('--debug') || process.env.DEBUG === 'true'

interface TiebaTrackInfo {
  tieba: TiebaInfo
  tiebaName: string
  tiebaIndex: number
}

const startTime = Date.now()
try {
  console.log('==========================================')
  console.log('🏆 开始执行 百度贴吧自动签到 脚本...')
  if (isDebug) console.log('🐛 [DEBUG] 调试模式已启用 - 不会真正请求签到接口')
  console.log('==========================================')

  const now = new Date()

  console.log(`📅 标准时间: ${formatDate(now, 'UTC', '+0')}`)
  console.log(`📅 北京时间: ${formatDate(now, 'Asia/Shanghai', '+8')}`)

  if (!process.env.BDUSS) throw new Error('缺少必要的环境变量: BDUSS')
  const bduss = process.env.BDUSS

  console.log('▶️ 步骤1: 验证登录凭证...')
  const userInfo = await login(bduss)
  console.log(
    `🔑 登录凭证验证结果: ${JSON.stringify({
      status: userInfo.status,
      userId: userInfo.userId ? `${String(userInfo.userId).substring(0, 3)}***` : undefined,
      isValid: userInfo.isValid
    })}`
  )
  if (userInfo.status === 200) console.log('✅ 验证BDUSS成功')
  else throw new Error('验证BDUSS失败，请检查BDUSS是否有效')

  console.log('▶️ 步骤2: 获取贴吧列表和TBS...')
  const tiebaList = await getTiebaList(bduss)
  const filterMode = process.env.FILTER_MODE || '' // 'include' | 'exclude' | ''
  const filterListRaw = process.env.FILTER_LIST || '' // 英文逗号分隔的吧名
  let filteredTiebaList = tiebaList

  if (filterMode && filterListRaw) {
    const filterNames = filterListRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    console.log(`🔍 过滤模式: ${filterMode}`)
    console.log(`🔍 过滤列表: ${filterNames.join(', ')}`)

    if (filterMode === 'include') {
      filteredTiebaList = tiebaList.filter((tieba) => filterNames.includes(tieba.forum_name))
    } else if (filterMode === 'exclude') {
      filteredTiebaList = tiebaList.filter((tieba) => !filterNames.includes(tieba.forum_name))
    } else {
      console.log(`⚠️ 未知的过滤模式 "${filterMode}"，已忽略过滤，将对全部贴吧进行操作`)
      filteredTiebaList = tiebaList
    }
  }

  if (filteredTiebaList.length === 0) {
    console.log('⚠️ 过滤后没有贴吧需要签到')
    console.log('==========================================')
    console.log(`⏱️ 总执行时间: ${((Date.now() - startTime) / 1000).toFixed(2)}秒`)
    process.exit(0)
  }

  console.log(`📋 总共 ${tiebaList.length} 个关注的贴吧，过滤后 ${filteredTiebaList.length} 个待签到`)

  console.log('📜 贴吧列表:')
  tiebaList.forEach((tieba, idx) => {
    const filtered = filteredTiebaList.includes(tieba) ? '✓' : '✗'
    const signStatus = tieba.is_sign === 1 ? '已签' : '待签'
    console.log(`  ${idx + 1}. [${filtered}] ${tieba.forum_name} (Lv.${tieba.user_level}, ${signStatus})`)
  })

  if (isDebug) {
    console.log('🐛 [DEBUG] 过滤后贴吧列表原始数据:')
    console.log(JSON.stringify(filteredTiebaList, null, 2))
  }

  console.log('▶️ 步骤3: 开始签到过程...')

  const tbs = isDebug ? 'debug_tbs' : await getTbs(bduss)
  if (isDebug) {
    console.log('🐛 [DEBUG] TBS: 使用模拟值，跳过真实请求')
  }

  const batchSize = parseInt(process.env.BATCH_SIZE || '20', 10)
  const batchInterval = parseInt(process.env.BATCH_INTERVAL || '1000', 10)

  const maxRetries = parseInt(process.env.MAX_RETRIES || '3', 10) // 最大重试次数，默认3次
  const retryInterval = parseInt(process.env.RETRY_INTERVAL || '5000', 10) // 重试间隔，默认5秒

  const signResults: SignResultItem[] = []
  let alreadySignedCount = 0
  let successCount = 0
  let failedCount = 0

  console.log(`📊 开始批量处理签到，每批 ${batchSize} 个，间隔 ${batchInterval}ms`)

  for (let i = 0; i < filteredTiebaList.length; i += batchSize) {
    const batchTiebas = filteredTiebaList.slice(i, i + batchSize)
    const batchPromises: Promise<SignResultItem>[] = []

    const currentBatch = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(filteredTiebaList.length / batchSize)
    console.log(`📌 批次 ${currentBatch}/${totalBatches}: 处理 ${batchTiebas.length} 个贴吧`)

    const needSignTiebas: TiebaTrackInfo[] = []

    for (let j = 0; j < batchTiebas.length; j++) {
      const tieba = batchTiebas[j]
      const tiebaName = tieba.forum_name
      const tiebaIndex = i + j + 1 // 全局索引，仅用于结果存储

      // 已签到的贴吧跳过
      if (tieba.is_sign === 1) {
        alreadySignedCount++
        console.log(`📌 ${tiebaName} - 已经签到过了`)
        signResults.push({
          success: true,
          message: '已经签到过了',
          name: tiebaName,
          index: tiebaIndex,
          info: {}
        })
        continue
      }

      // 需要签到的贴吧
      needSignTiebas.push({
        tieba,
        tiebaName,
        tiebaIndex
      })

      // 添加签到任务
      const signPromise = (async () => {
        try {
          if (isDebug) {
            // DEBUG 模式：模拟签到，不真正请求接口
            console.log(`🐛 [DEBUG] 模拟签到: ${tiebaName}`)
            alreadySignedCount++
            return {
              success: true,
              message: '签到成功(模拟)',
              name: tiebaName,
              index: tiebaIndex,
              info: {}
            } as SignResultItem
          }

          // 正常模式：真正请求签到接口
          const result = await signTieba(bduss, tiebaName, tbs, tiebaIndex)
          const processedResult = processSignResult(result)

          // 更新计数
          if (processedResult.success) {
            if (processedResult.message === '已经签到过了') {
              alreadySignedCount++
              console.log(`📌 ${tiebaName} - 已经签到过了`)
            } else {
              successCount++
              console.log(`✅ ${tiebaName} - 签到成功`)
            }
          } else {
            failedCount++
            console.log(`❌ ${tiebaName} - 签到失败: ${processedResult.message}`)
          }

          return {
            ...processedResult,
            name: tiebaName,
            index: tiebaIndex
          }
        } catch (error) {
          failedCount++
          console.log(`❌ ${tiebaName} - 签到出错: ${(error as Error).message}`)
          return {
            success: false,
            message: (error as Error).message,
            name: tiebaName,
            index: tiebaIndex,
            info: {}
          }
        }
      })()

      batchPromises.push(signPromise)
    }

    // 等待当前批次的签到任务完成
    const batchResults = await Promise.all(batchPromises)

    // 收集签到失败的贴吧
    const failedTiebas: TiebaTrackInfo[] = []
    batchResults.forEach((result) => {
      if (!result.success) {
        // 找到该贴吧的原始信息
        const failedTieba = needSignTiebas.find((t) => t.tiebaName === result.name)
        if (failedTieba) {
          failedTiebas.push(failedTieba)
        }
      }
    })

    // 将当前批次结果添加到总结果中
    signResults.push(...batchResults)

    // 每批次后输出简洁的进度统计
    console.log(
      `📊 批次${currentBatch}完成: ${i + batchTiebas.length}/${filteredTiebaList.length} | ` +
        `成功: ${successCount} | 已签: ${alreadySignedCount} | 失败: ${failedCount}`
    )

    // 如果有失败的贴吧，进行重试
    if (failedTiebas.length > 0 && !isDebug) {
      // 进行多次重试
      for (let retryCount = 1; retryCount <= maxRetries; retryCount++) {
        if (failedTiebas.length === 0) break // 如果没有失败的贴吧了，就退出重试循环

        console.log(
          `🔄 第${retryCount}/${maxRetries}次重试: 检测到 ${failedTiebas.length} 个贴吧签到失败，等待 ${retryInterval / 1000} 秒后重试...`
        )
        await new Promise((resolve) => setTimeout(resolve, retryInterval))

        console.log(`🔄 开始第${retryCount}次重试签到失败的贴吧...`)
        const retryPromises: Promise<{
          success: boolean
          tiebaName: string
        }>[] = []
        const stillFailedTiebas: TiebaTrackInfo[] = [] // 保存本次重试后仍然失败的贴吧

        // 对失败的贴吧重新签到
        for (const failedTieba of failedTiebas) {
          const { tiebaName, tiebaIndex } = failedTieba

          const retryPromise = (async () => {
            try {
              console.log(`🔄 第${retryCount}次重试签到: ${maskTiebaName(tiebaName)}`)
              const result = await signTieba(bduss, tiebaName, tbs, tiebaIndex)
              const processedResult = processSignResult(result)

              // 更新计数和结果
              if (processedResult.success) {
                // 找到之前失败的结果并移除
                const failedResultIndex = signResults.findIndex((r) => r.name === tiebaName && !r.success)
                if (failedResultIndex !== -1) {
                  signResults.splice(failedResultIndex, 1)
                }

                // 添加成功的结果
                signResults.push({
                  ...processedResult,
                  name: tiebaName,
                  index: tiebaIndex,
                  retried: true,
                  retryCount: retryCount
                })

                // 更新计数
                failedCount--
                if (processedResult.message === '已经签到过了') {
                  alreadySignedCount++
                  console.log(`📌 ${tiebaName} - 重试发现已签到`)
                } else {
                  successCount++
                  console.log(`✅ ${tiebaName} - 第${retryCount}次重试签到成功`)
                }

                return { success: true, tiebaName }
              }
              console.log(`❌ ${tiebaName} - 第${retryCount}次重试仍然失败: ${processedResult.message}`)
              // 将此贴吧保存到仍然失败的列表中，准备下一次重试
              stillFailedTiebas.push(failedTieba)
              return { success: false, tiebaName }
            } catch (error) {
              console.log(`❌ ${tiebaName} - 第${retryCount}次重试出错: ${(error as Error).message}`)
              // 将此贴吧保存到仍然失败的列表中，准备下一次重试
              stillFailedTiebas.push(failedTieba)
              return { success: false, tiebaName }
            }
          })()

          retryPromises.push(retryPromise)
        }

        // 等待所有重试完成
        await Promise.all(retryPromises)

        // 更新失败的贴吧列表，用于下一次重试
        failedTiebas.length = 0
        failedTiebas.push(...stillFailedTiebas)

        // 重试后统计
        console.log(
          `🔄 第${retryCount}次重试完成，当前统计: 成功: ${successCount} | 已签: ${alreadySignedCount} | 失败: ${failedCount}`
        )

        // 如果所有贴吧都已成功签到，提前结束重试
        if (failedTiebas.length === 0) {
          console.log(`🎉 所有贴吧签到成功，不需要继续重试`)
          break
        }

        // 如果不是最后一次重试，并且还有失败的贴吧，则增加重试间隔
        if (retryCount < maxRetries && failedTiebas.length > 0) {
          // 可以选择递增重试间隔
          const nextRetryInterval = (retryInterval * (retryCount + 1)) / retryCount
          console.log(`⏳ 准备第${retryCount + 1}次重试，调整间隔为 ${nextRetryInterval / 1000} 秒...`)
          await new Promise((resolve) => setTimeout(resolve, 1000)) // 短暂暂停以便于查看日志
        }
      }

      // 最终重试结果
      if (failedTiebas.length > 0) {
        console.log(`⚠️ 经过 ${maxRetries} 次重试后，仍有 ${failedTiebas.length} 个贴吧签到失败`)
      } else {
        console.log(`🎉 重试成功！所有贴吧都已成功签到`)
      }
    }

    // DEBUG 模式下跳过重试
    if (failedTiebas.length > 0 && isDebug) {
      console.log('🐛 [DEBUG] 调试模式，跳过重试')
    }

    // 在批次之间添加延迟，除非是最后一批
    if (i + batchSize < filteredTiebaList.length) {
      console.log(`⏳ 等待 ${batchInterval / 1000} 秒后处理下一批...`)
      await new Promise((resolve) => setTimeout(resolve, batchInterval))
    }
  }

  // 4. 汇总结果
  console.log('▶️ 步骤4: 汇总签到结果')
  const summary = summarizeResults(signResults)
  const summaryText = formatSummary(summary)

  // 完成
  console.log('==========================================')
  console.log(summaryText)
  console.log('==========================================')

  // 5. 发送通知 - 只有在有贴吧签到失败时才发送（DEBUG 模式下不发送）
  if (isDebug) {
    console.log('🐛 [DEBUG] 调试模式，跳过通知发送')
  } else {
    const shouldNotify = process.env.ENABLE_NOTIFY === 'true' && failedCount > 0

    if (shouldNotify) {
      console.log('▶️ 步骤5: 发送通知 (由于签到失败而触发)')
      await sendNotification(summaryText)
    } else if (process.env.ENABLE_NOTIFY === 'true') {
      console.log('ℹ️ 签到全部成功，跳过通知发送')
    } else {
      console.log('ℹ️ 通知功能未启用，跳过通知发送')
    }
  }
} catch (error) {
  console.error('==========================================')
  console.error(`❌ 错误: ${(error as Error).message}`)
  if ((error as any).response) {
    console.error('📡 服务器响应:')
    console.error(`状态码: ${(error as any).response.status}`)
    console.error(`数据: ${JSON.stringify((error as any).response.data)}`)
  }
  console.error('==========================================')

  // 发送错误通知 - BDUSS失效时一定要通知（DEBUG 模式下不发送）
  if (!isDebug) {
    const errMsg = (error as Error).message
    const isBdussError = errMsg.includes('BDUSS') || errMsg.includes('登录')
    const shouldNotify = process.env.ENABLE_NOTIFY === 'true' || isBdussError

    if (shouldNotify) {
      try {
        console.log('▶️ 步骤5: 发送通知 (由于BDUSS失效或严重错误触发)')
        await sendNotification(`❌ 签到脚本执行失败!\n\n错误信息: ${(error as Error).message}`)
      } catch (e) {
        console.error(`❌ 发送错误通知失败: ${(e as Error).message}`)
      }
    }
  } else {
    console.log('🐛 [DEBUG] 调试模式，跳过错误通知发送')
  }

  process.exit(1) // 失败时退出程序，退出码为1
} finally {
  // 无论成功还是失败都会执行的代码
  const endTime = Date.now()
  const executionTime = (endTime - startTime) / 1000
  console.log(`⏱️ 总执行时间: ${executionTime.toFixed(2)}秒`)
  console.log('==========================================')
}
