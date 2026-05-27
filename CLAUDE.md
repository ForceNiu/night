# 深夜树洞 — Chrome Extension

一个为深夜陷入懊悔情绪的人提供情绪出口的 Chrome 浏览器插件。详见 `docs/PRD.md`。

## 开发原则

### 1. 先想再写代码

**不要假设。不要隐藏困惑。暴露权衡。**

- 明确说出你的假设。不确定就问。
- 存在多种解读时，全部列出来——不要默默选一个。
- 有更简单的方案就说出来。该反驳就反驳。
- 遇到不清楚的地方停下来。说清楚哪里困惑，然后问。

### 2. 简单优先

**用最少的代码解决问题。不做投机性设计。**

- 不做超出需求的功能。
- 不为只用一次的代码做抽象。
- 不加没被要求的"灵活性"或"可配置性"。
- 不为不可能的场景做错误处理。
- 如果 200 行能缩到 50 行，就重写。

检验标准：一个高级工程师会说这太复杂了吗？如果是，简化。

### 3. 精准修改

**只动必须动的。只清理自己制造的垃圾。**

编辑已有代码时：
- 不要"顺手改进"相邻的代码、注释或格式。
- 不要重构没坏的东西。
- 匹配现有风格，即使你会写得不一样。
- 发现无关的死代码，提出来——不要删掉。

你的修改产生孤儿代码时：
- 删除**你**的修改导致未使用的 import/变量/函数。
- 不要删除已有的死代码，除非被要求。

检验标准：每一行改动都应该能直接追溯到用户的需求。

### 4. 目标驱动执行

**定义成功标准。循环直到验证通过。**

把任务转化为可验证的目标：
- "加验证" → "为无效输入写测试，然后让它们通过"
- "修 bug" → "写一个复现 bug 的测试，然后让它通过"
- "重构 X" → "确保重构前后测试都通过"

多步骤任务，列出简要计划：
```
1. [步骤] → 验证: [检查项]
2. [步骤] → 验证: [检查项]
3. [步骤] → 验证: [检查项]
```

强成功标准让 AI 能独立循环。弱标准（"让它能跑"）需要不断确认。

---

## 技术栈

| 层面 | 选择 |
|------|------|
| 框架 | React + TypeScript + Vite + CRXJS |
| AI 服务 | DeepSeek（默认），接口可配置 |
| 存储 | IndexedDB，Dexie.js 封装 |
| 后端 | 无，纯客户端 |

## 项目结构

```
src/
├── popup/              ← 简要概览入口
├── newtab/             ← 干预页面（新标签页接管）
│   └── steps/          ← 五步流程组件
├── history/            ← 历史记录详情页
├── background/         ← Service Worker（定时触发、图标状态）
├── shared/
│   ├── storage/        ← IndexedDB 封装
│   ├── ai/             ← AI 调用封装
│   ├── types/          ← TypeScript 类型定义
│   └── utils/
└── assets/
```

## 编码规范

- 使用 TypeScript strict mode
- 组件用函数式组件 + hooks
- 样式用 CSS Modules
- 状态管理用 React Context（不需要 Redux，项目体量不需要）
- 所有 AI 调用封装在 `shared/ai/` 下，不散落在组件中
- 所有存储操作封装在 `shared/storage/` 下

## 端侧开发注意事项

### Service Worker 生命周期

**重要：** Chrome MV3 Service Worker 会频繁重启（30 秒空闲即终止），内存状态不可靠。

```javascript
// ❌ 错误：内存状态会丢失
let wasGuardHour = false;

// ✅ 正确：使用 chrome.storage 持久化
const { wasGuardHour } = await chrome.storage.session.get('wasGuardHour');
```

**检查清单：**
- [ ] 内存状态是否会在 Service Worker 重启后丢失？
- [ ] 关键状态是否使用 chrome.storage 持久化？
- [ ] 是否考虑了 Service Worker 的短生命周期？

### IndexedDB 性能

**重要：** 大数据量需要优化，避免全量加载和内存过滤。

```javascript
// ❌ 错误：全量加载
const records = await db.records.toArray();
const filtered = records.filter(r => r.emotionTags.includes('后悔'));

// ✅ 正确：使用索引查询
const records = await db.records
  .where('emotionTags')
  .equals('后悔')
  .toArray();
```

**检查清单：**
- [ ] 是否使用索引查询而不是全量加载？
- [ ] 大数据量是否使用游标分页？
- [ ] 聚合操作是否使用 Dexie 的游标机制？

### 异常处理

**重要：** 所有异步操作都需要 try/catch，考虑边界条件和异常情况。

```javascript
// ❌ 错误：乐观假设
async function handleSeal() {
  await addRecord(record);
  setSealed(true);
}

// ✅ 正确：防御性编程
async function handleSeal() {
  try {
    await addRecord(record);
    setSealed(true);
  } catch (error) {
    console.error('Failed to save record:', error);
    showError('保存失败，请重试');
  }
}
```

**检查清单：**
- [ ] 所有异步操作是否有 try/catch？
- [ ] 网络请求是否有超时机制？
- [ ] 是否验证了 API 响应的结构？
- [ ] 错误信息是否用户友好？

### 安全编码

**重要：** 端侧代码必须考虑安全问题。

```javascript
// ❌ 错误：baseUrl 没有验证
const response = await fetch(`${config.baseUrl}/v1/chat/completions`);

// ✅ 正确：验证 baseUrl
function validateBaseUrl(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') {
    throw new Error('必须使用 HTTPS');
  }
  return true;
}
```

**检查清单：**
- [ ] API Key 是否安全存储？
- [ ] baseUrl 是否验证了 HTTPS？
- [ ] 用户输入是否有长度限制？
- [ ] AI 响应是否清理后存储？
- [ ] 是否有 Content Security Policy？

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
