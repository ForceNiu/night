# 深夜树洞

一款 Chrome 浏览器插件，为深夜陷入懊悔、自我否定情绪的人提供一个安全的情绪出口。

## 产品理念

深夜 12 点到凌晨 6 点，当你因过去的决定陷入懊悔，反复浏览社交媒体、搜索相关内容时，这个插件会温和介入，引导你把情绪说出来、拆解清楚、然后封存。

**核心价值：**
- 打断 rumination（反刍思维）循环
- 将模糊的懊悔拆解成具体的小点
- 通过记录让你看到自己的情绪轨迹

## 功能特性

### 触发机制
- **时间触发**：00:00-06:00 守护时段，图标变色提醒
- **手动触发**：随时点击图标主动进入
- **二次提醒**：30 分钟后再次提醒，之后不再打扰

### 干预流程（五步）
1. **温和提醒** — "夜深了，你现在的情绪可能在放大很多事"
2. **写下想法** — 自由书写，不限字数
3. **AI 辅助拆解** — 帮你把模糊情绪拆解成具体方向
4. **情绪标签** — 后悔、焦虑、孤独、愤怒、其他
5. **封存仪式** — "今晚的话，我替你收好了"

### 历史回顾
- 时间线展示所有记录
- 情绪标签云图
- AI 生成的一句话摘要（不展示原文）
- 情绪分布统计

### 隐私保护
- 所有数据存储在浏览器本地（IndexedDB）
- 不上传到任何服务器
- AI 调用是"过路"处理，不持久化到第三方

## 技术栈

| 层面 | 选择 | 说明 |
|------|------|------|
| 框架 | React 19 + TypeScript | 类型安全，组件化 |
| 构建 | Vite 8 + CRXJS | 快速开发，热更新 |
| AI 服务 | DeepSeek | 便宜、中文情绪理解强 |
| 存储 | IndexedDB + Dexie.js | 纯本地，无后端 |
| 样式 | CSS Modules | 组件样式隔离 |

## 项目结构

```
src/
├── popup/              ← 简要概览入口
│   ├── App.tsx
│   └── index.css
├── newtab/             ← 干预页面（新标签页接管）
│   ├── App.tsx
│   ├── steps/
│   │   ├── GentleReminder.tsx    ← 第一步：温和提醒
│   │   ├── WriteThoughts.tsx     ← 第二步：写下想法
│   │   ├── Decompose.tsx         ← 第三步：AI 辅助拆解
│   │   ├── EmotionTag.tsx        ← 第四步：情绪标签
│   │   └── Seal.tsx              ← 第五步：封存仪式
│   ├── components/
│   │   ├── ChatBubble.tsx        ← 对话气泡组件
│   │   └── ProgressBar.tsx       ← 进度指示器
│   └── index.css
├── history/            ← 历史记录详情页
│   ├── App.tsx
│   └── index.css
├── background/         ← Service Worker
│   └── index.ts
├── shared/
│   ├── storage/        ← IndexedDB 封装
│   │   └── db.ts
│   ├── ai/             ← AI 调用封装
│   │   ├── client.ts
│   │   ├── prompts.ts
│   │   └── dev-config.ts
│   ├── types/          ← TypeScript 类型定义
│   └── utils/
└── assets/
    └── icons/
```

## 快速开始

### 环境要求

- Node.js >= 20.19
- npm >= 10
- Chrome 浏览器

### 安装

```bash
# 克隆项目
git clone https://github.com/ForceNiu/night.git
cd night

# 安装依赖
npm install

# 配置环境变量（可选，用于测试打包）
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek API Key
```

### 开发

```bash
# 启动开发服务器
npm run dev

# 在 Chrome 中加载
# 1. 打开 chrome://extensions/
# 2. 开启"开发者模式"
# 3. 点击"加载已解压的扩展程序"
# 4. 选择 dist 目录
```

### 构建

```bash
# 正式构建（不含 API Key）
npm run build

# 测试构建（包含 .env 中的 API Key）
npm run build:test
```

## API 配置

插件支持自定义 AI 服务配置：

```typescript
interface AIConfig {
  baseUrl: string    // 默认 https://api.deepseek.com
  apiKey: string     // 用户提供
  model: string      // 默认 deepseek-chat
}
```

**支持的 AI 服务：**
- DeepSeek（默认）
- OpenAI 兼容接口
- 其他兼容 DeepSeek API 格式的服务

## 隐私说明

### 数据存储
- 所有情绪记录存储在浏览器本地（IndexedDB）
- 不上传到任何服务器
- 换设备数据丢失（当前版本不支持同步）

### AI 调用
- AI 分析通过 API 调用处理，数据不持久化到第三方
- API 调用是"过路"处理，分析完即丢
- 用户需要提供自己的 API Key

### 隐私承诺
- 你的数据不会被任何人看到
- 插件内展示完整的隐私说明

## 设计原则

1. **温暖但不腻** — 像一个安静的朋友，不是话痨
2. **引导但不强迫** — 始终给用户"继续"的选项
3. **具体化模糊的痛苦** — 帮你把"一切都完了"拆解成具体的小点
4. **隐私是基石** — 你愿意把最脆弱的时刻交给我，前提是信任
5. **不许空头支票** — 不说"明天会更好"，因为我不知道

## 开发指南

### 代码规范

- TypeScript strict mode
- 函数式组件 + hooks
- CSS Modules 样式隔离
- React Context 状态管理

### AI 调用

所有 AI 调用封装在 `shared/ai/` 下：

```typescript
// 获取 AI 配置
const config = getDevConfig() || await getStoredConfig()

// 调用 AI
const response = await fetch(`${config.baseUrl}/chat/completions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: config.model,
    messages: [...]
  })
})
```

### 存储操作

所有存储操作封装在 `shared/storage/` 下：

```typescript
import { db } from './db'

// 添加记录
await db.records.add({
  id: crypto.randomUUID(),
  timestamp: Date.now(),
  content: '...',
  emotionTags: ['后悔'],
  aiSummary: '...'
})

// 查询记录
const records = await db.records
  .orderBy('timestamp')
  .reverse()
  .toArray()
```

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -m 'feat: add xxx'`)
4. 推送到分支 (`git push origin feature/xxx`)
5. 创建 Pull Request

## 许可证

MIT License

## 致谢

- [DeepSeek](https://deepseek.com/) — 提供 AI 服务
- [Dexie.js](https://dexie.org/) — IndexedDB 封装
- [CRXJS](https://crxjs.dev/) — Chrome Extension 开发工具
- [Vite](https://vitejs.dev/) — 下一代前端构建工具

---

**如果你在深夜看到这个插件，希望它能帮到你。**
