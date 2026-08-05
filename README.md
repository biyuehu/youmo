<!-- markdownlint-disable-next-line -->
<div align="center">

# YOUMO · 贴吧自动签到

[![百度贴吧](https://img.shields.io/badge/百度贴吧-passing-success.svg?style=flat-square&logo=baidu&logoWidth=20&logoColor=white)](https://github.com/biyuehu/youmo/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-latest-fbf0df.svg?style=flat-square&logo=bun)](https://bun.sh/)
[![GitHub stars](https://img.shields.io/github/stars/biyuehu/youmo?style=flat-square&logo=github)](https://github.com/biyuehu/youmo/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/biyuehu/youmo?style=flat-square&logo=github)](https://github.com/biyuehu/youmo/network/members)
[![License](https://img.shields.io/github/license/biyuehu/youmo?style=flat-square)](LICENSE)

还在被黄牌蛆歧视吗？还在因为是引流狗的事实自卑吗？还在被老东西踩头吗？还在因玩网太浅备受嘲讽吗？你需要这个工具！一个基于 GitHub Actions 的贴吧自动签到工具——无论你是神友视奸、带友转正、粉转带、狗粉丝还是引流二刺螈、皮套狗、二游魔怔痴、迷你世界钓鱼佬、反二吧复制粘贴巨硬、页游、瞎骂蛆、做题蠢蛆、g笑傻缺、幽默支黑、魂斗罗高手、左左右右上上下下BBAA、文艺青年、网哲、百破雅士、百合豚、待开化基本盘，它都能让你躺在出租屋就迅速当上人人羡慕的冲浪老资历！

</div>

## Features

- 🧰 TypeScript & Bun：使用 TypeScript 开发、Bun 运行，提供更好的类型安全、代码可维护性及运行便利性（Fuck Node.js）
- 🔄 自动签到：每天自动完成所有关注贴吧的签到
- 🔐 安全可靠：只需配置 BDUSS 环境变量，无需泄露账号密码
- 🐧 通知推送：支持第三方 QQ 机器人、官方 QQ 机器人等多种方式推送
- 📊 详细统计：签到后生成详细的统计报告，包含签到排名和连签天数
- 🚀 部署简单：一次配置，持续运行，无需服务器
- ⚡ 批量处理：支持批量签到，提高效率并避免请求限制
- 🔁 智能重试：对签到失败的贴吧自动进行多次重试，提高签到成功率

## Steup

### 1. 获取百度 BDUSS

首先需要获取百度的 BDUSS，这是百度贴吧 API 的登录凭证.

获取方法：

1. 登录百度贴吧网页版.
2. 打开浏览器开发者工具（F12）.
3. 切换到 “Application” 或 “应用” 标签.
4. 在左侧找到 “Cookies”.
5. 找到并复制 BDUSS 的值.

> [!WARNING]
> 请勿泄露BDUSS，它相当于你的登录凭证！

### 2. Star 本仓库

点击本仓库右上角的 “Star” 按钮.

### 3. 配置 GitHub Secrets

在你 Fork 的仓库中：

1. 点击 “Settings” → “Secrets and variables” → “Actions”.
2. 点击 “New repository secret” 按钮.
3. 添加 Secret：
   - 名称：
   - 值：你的百度 BDUSS 值.

### 4. 启用 GitHub Actions

1. 在你 Fork 的仓库中，点击 “Actions” 标签.
2. 点击 “I understand my workflows, go ahead and enable them”.
3. 找到 “百度贴吧自动签到” workflow 并启用.

现在，系统会按照预设的时间（默认每天凌晨）自动运行签到脚本.

## Usage

### Configuration

本项目使用环境变量进行配置，可以在 GitHub Secrets 中设置以下变量：

**Base：**

| 变量名 | 必填 | 说明 | 默认值 |
| ----- | ---- | ---- | ----- |
| `BDUSS` | ✅ | 百度贴吧登录凭证，用于身份验证 | 无 |
| `FILTER_MODE` | ❌ | 贴吧过滤模式: `include`(仅签到) / `exclude`(排除) | 无(不过滤) |
| `FILTER_LIST` | ❌ | 英文逗号分隔的过滤吧名列表，完全匹配 | 无 |
| `BATCH_SIZE` | ❌ | 每批签到的贴吧数量 | 20 |
| `BATCH_INTERVAL` | ❌ | 批次之间的等待时间(毫秒) | 1000 |
| `MAX_RETRIES` | ❌ | 签到失败时的最大重试次数 | 3 |
| `RETRY_INTERVAL` | ❌ | 重试之间的等待时间(毫秒) | 5000 |

**Notification：**

可选择性配置以下通知渠道，支持多个：

| 变量名 | 说明 | 参考文档 |
| ----- | ---- | ------- |
| `MAKI_URL` | Maki酱服务地址，如 `http://127.0.0.1:720` | **[[Maki酱详细信息](https://github.com/kotorijs/maki-chan)]** |
| `MAKI_TOKEN` | Maki酱认证 Token | 同上 |
| `SERVERCHAN_KEY` | Server酱的推送密钥 | [Server酱文档](https://sct.ftqq.com/) |
| `BARK_KEY` | Bark 推送密钥或完整URL | [Bark文档](https://github.com/Finb/Bark) |
| `TG_BOT_TOKEN` | Telegram 机器人Token | [Telegram Bot API](https://core.telegram.org/bots/api) |
| `TG_CHAT_ID` | Telegram 接收消息的用户或群组ID | [获取Chat ID教程](https://core.telegram.org/bots/features#chat-id) |
| `DINGTALK_WEBHOOK` | 钉钉机器人的Webhook URL | [钉钉自定义机器人文档](https://open.dingtalk.com/document/robots/custom-robot-access) |
| `DINGTALK_SECRET` | 钉钉机器人的安全密钥（可选） | 同上 |
| `WECOM_KEY` | 企业微信机器人的 WebHook Key | [企业微信机器人文档](https://developer.work.weixin.qq.com/document/path/91770) |
| `PUSHPLUS_TOKEN` | PushPlus 推送 Token | [PushPlus文档](https://www.pushplus.plus/) |

**Maki酱**：基于强大的 [KotoriBot](https://kotori.js.org)，支持第三方QQ、官方QQ等多种方式，并且开源，强烈推荐使用.

> [!TIP]
> 你可以根据自己的需求配置一个或多个通知渠道. 如果配置了多个渠道，脚本将向所有渠道发送通知.

**设置方法**:

- 在仓库中点击 Settings → Secrets and variables → Actions.
- 点击 “New repository secret” 添加以上对应的配置项.

### Sign In Immediately

如果你想立即测试签到功能，可以手动触发：

1. 进入 “Actions” 标签.
2. 选择 “百度贴吧自动签到” workflow.
3. 点击 “Run workflow” 按钮.
4. 点击 “Run workflow” 确认运行.

> [!TIP]
> 手动触发时会使用你在 GitHub Secrets 中配置的环境变量，如果没有配置则使用默认值.

### Set Signin Time

修改 `.github/workflows/tieba-signin.yml` 文件中的 cron 表达式. 默认为每天凌晨 2 点（UTC 时间，即北京时间上午 10 点）.

### View Signin Results

签到完成后，可以在 Actions 的运行记录中查看详细的签到结果和统计信息，包括：

- 签到成功数量与贴吧列表.
- 已经签到的贴吧数量.
- 签到失败的贴吧及原因.
- 成功签到贴吧的排名和连签天数.

### Local Running

你可以在本地环境中测试签到功能，无需依赖 GitHub Actions.

1. 克隆此仓库到本地：

   ```bash
   git clone https://github.com/biyuehu/youmo.git
   cd tieba
   ```

2. 安装依赖：

   ```bash
   bun install
   ```

3. 创建`.env`文件，用于配置本地测试环境变量：

   ```bash
   cp .env.example .env
   ```

4. 编辑 `.env` 文件，填入你的 `BDUSS` 和其他配置.

## Questions

### 通知逻辑？

本项目的通知逻辑为：

1. 只要配置了任一通知渠道，无论签到成功或失败都会发送通知
2. 脚本执行出错时也会发送错误通知

> [!TIP]
> 本地测试时BDUSS的有效性会直接影响到结果，如需测试不同场景，可以修改`.env`文件中的BDUSS值.

### 签到失败怎么办？

- 检查 BDUSS 是否正确且未过期.
- 查看 Actions 运行日志，确认具体错误原因.
- 如果 BDUSS 过期，请重新获取并更新 Secret.
- 签到过快导致失败时，可以尝试增大批次间隔时间.
- 对于偶发的网络问题，脚本会自动进行重试（最多3次），可通过配置 `MAX_RETRIES` 和 `RETRY_INTERVAL` 调整重试次数和间隔.

### 如何获取新BDUSS？

BDUSS一般有效期较长，但如果失效，需要重新获取. 方法同初始配置步骤，然后更新GitHub Secrets中的值.

## License

MIT

## Announcement

1. 本项目仅供学习和研究目的使用，不得用于商业或非法用途.
2. 使用本项目可能违反百度贴吧的服务条款，请自行评估使用风险.
3. 本项目不保证功能的可用性，也不保证不会被百度官方检测或封禁.
4. 使用本项目造成的任何问题，包括但不限于账号被封禁、数据丢失等，项目作者概不负责.
5. 用户需自行承担使用本项目的全部风险和法律责任.
