---
title: Fuwari 博客 Category 字段从字符串改为数组的代码修改记录
published: 2026-07-15
description: Fuwari (Astro) 博客将 category 字段从 string 改为 string[] 的实际代码变更记录，涉及 schema、组件和工具函数
tags: [其他]
category: [Fuwari个性化]
draft: false
---

Fuwari 博客原版的 `category` 字段类型是 `string`（单个字符串），支持 `category: 技术笔记` 这种写法。为了实现一篇文章多分类的能力，将整个链路的类型从 `string` 改为 `string[]`。

以下是所有代码层面的修改记录。

## 1. Schema 定义 — src/content/config.ts

**变更**：字段类型从字符串改为数组

```diff
- category: z.string().optional().nullable().default(""),
+ category: z.array(z.string()).optional().default([]),
```

| 维度 | 改前 | 改后 |
|------|------|------|
| 类型 | `string` | `string[]` |
| 可空 | `.nullable()` | 移除（数组为空即表示无分类） |
| 默认值 | `""`（空字符串） | `[]`（空数组） |

**影响范围**：所有文章 Frontmatter 的 category 字段必须按照数组格式书写，即 `category: [技术笔记]` 而非 `category: 技术笔记`。

## 2. 分类聚合函数 — src/utils/content-utils.ts

**变更**：`getCategoryList()` 函数替换字符串处理逻辑为数组迭代

```diff
-allBlogPosts.forEach((post: { data: { category: string | null } }) => {
-  if (!post.data.category) {
-    const ucKey = i18n(I18nKey.uncategorized);
-    count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
-    return;
-  }
-  const categoryName =
-    typeof post.data.category === "string"
-      ? post.data.category.trim()
-      : String(post.data.category).trim();
-  count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
-});
+allBlogPosts.forEach((post: { data: { category: string[] } }) => {
+  if (!post.data.category || post.data.category.length === 0) {
+    const ucKey = i18n(I18nKey.uncategorized);
+    count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
+    return;
+  }
+  post.data.category.forEach((cat: string) => {
+    const categoryName = cat.trim();
+    count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
+  });
+});
```

**改动点**：
- 类型标注从 `string | null` 改为 `string[]`
- 空判断从 `!post.data.category` 改为 `!post.data.category || post.data.category.length === 0`
- 字符串的 `trim()` + 单次计数 → 数组的 `forEach` 遍历每一项分别计数
- 移除了 `typeof === "string"` 的类型兼容判断（不再需要兼容旧格式）

## 3. 文章元信息展示 — src/components/PostMeta.astro

**变更**：Props 类型 + 渲染逻辑改为数组遍历

**Props 类型**：
```diff
- category: string | null;
+ category: string[];
```

**渲染逻辑**（支持多分类，分类间用 `/` 分隔）：
```diff
- <a href={getCategoryUrl(category)} ...>
-   {category || i18n(I18nKey.uncategorized)}
- </a>
+ {category && category.length > 0
+   ? category.map((cat, i) => (
+       <div class:hidden={i == 0}>/</div>
+       <a href={getCategoryUrl(cat)} ...>
+         {cat.trim()}
+       </a>
+     ))
+   : <span>{i18n(I18nKey.uncategorized)}</span>
+ }
```

**改动点**：
- 单个 `<a>` 标签 → `category.map()` 渲染多个分类链接
- 分类间添加 `/` 分隔符（第一个分类前不显示）
- 未分类时改用 `<span>` 而非 `<a>`（无链接意义）

## 4. 文章卡片 — src/components/PostCard.astro

**变更**：Props 类型对齐

```diff
- category: string | null;
+ category: string[];
```

仅类型标注变更，渲染逻辑由 PostMeta.astro 接管，PostCard 只做透传。

## 5. 归档页筛选 — src/components/ArchivePanel.svelte

**变更**：类型标注 + 筛选逻辑适配数组

**Props 类型**：
```diff
- category?: string | null;
+ category?: string[];
```

**按分类筛选**：
```diff
- (post) => post.data.category && categories.includes(post.data.category),
+ (post) =>
+   Array.isArray(post.data.category) &&
+   post.data.category.some((cat) => categories.includes(cat)),
```

**未分类筛选**：
```diff
- (post) => !post.data.category,
+ (post) => !post.data.category || post.data.category.length === 0,
```

**改动点**：
- `includes()` 单字符串匹配 → `some()` 数组任意一项匹配
- 增加了 `Array.isArray()` 安全判断
- 未分类判定增加了空数组长度检查

## 修改总览

| 文件 | 变更类型 | 行数变化 |
|------|----------|----------|
| `src/content/config.ts` | Schema 类型定义 | +1 -1 |
| `src/utils/content-utils.ts` | 分类聚合逻辑重写 | +12 -14 |
| `src/components/PostMeta.astro` | Props + 渲染逻辑 | +12 -6 |
| `src/components/PostCard.astro` | Props 类型对齐 | +1 -1 |
| `src/components/ArchivePanel.svelte` | Props + 筛选逻辑 | +7 -3 |
---

本文章由助手CoCo生成~
