---
title: Fuwari 使用参考手册
published: 2024-01-01
description: Fuwari 博客模板的完整使用指南和功能参考
tags: [Fuwari, 指南, 参考]
category: 指南
draft: false
---

# Fuwari 使用参考手册

本手册整合了 Fuwari 博客模板的所有功能说明和使用示例，方便查阅。

---

## 1. 基础入门

### 1.1 文章 Frontmatter

每篇文章的开头需要包含以下元数据：

```yaml
---
title: 文章标题
published: 2024-01-01
updated: 2024-01-02
description: 文章简短描述
image: ./cover.jpg
tags: [标签1, 标签2]
category: 分类
draft: false
---
```

| 属性 | 说明 |
|------|------|
| `title` | 文章标题 |
| `published` | 发布日期 |
| `updated` | 更新日期（可选） |
| `description` | 文章描述，在首页显示 |
| `image` | 封面图片路径 |
| `tags` | 文章标签数组 |
| `category` | 文章分类 |
| `draft` | 是否为草稿，草稿不会显示 |

### 1.2 文章文件位置

文章文件应该放在 `src/content/posts/` 目录下，可以创建子目录来组织：

```
src/content/posts/
├── post-1.md
└── post-2/
    ├── cover.png
    └── index.md
```

### 1.3 草稿文章

设置 `draft: true` 可以将文章标记为草稿：

```yaml
---
title: Draft Example
published: 2024-01-01
tags: [Markdown, Blogging, Demo]
category: Examples
draft: true
---
```

草稿文章不会对访客显示，只有在编辑时才能看到。

---

## 2. Markdown 基础语法

### 2.1 标题

```markdown
# H1 标题
## H2 标题
### H3 标题
#### H4 标题
##### H5 标题
###### H6 标题
```

### 2.2 文本格式

```markdown
_斜体文本_
**粗体文本**
`行内代码`
```

### 2.3 列表

**无序列表：**
```markdown
- 项目一
- 项目二
- 项目三
```

**有序列表：**
```markdown
1. 第一项
2. 第二项
3. 第三项
```

**嵌套列表：**
```markdown
1. 首先，准备这些原料：
    - 胡萝卜
    - 芹菜
    - 扁豆
2. 烧开水
```

### 2.4 引用

```markdown
> 这是一段引用
> 可以跨多行
>
> 包含多个段落
```

### 2.5 代码块

**基本代码块：**
```markdown
```

```
define foobar() {
    print "Hello!";
}
```
```

**带语法高亮：**
```markdown
```python
import time
for i in range(10):
    time.sleep(0.5)
    print(i)
```
```

### 2.6 链接

```markdown
[外部链接](http://foo.bar)
[内部链接](local-doc.html)
[锚点链接](#section-heading)
```

### 2.7 表格

```markdown
size | material | color
--- | --- | ---
9 | leather | brown
10 | hemp canvas | natural
11 | glass | transparent
```

### 2.8 数学公式

**行内公式：**
```markdown
$\omega = d\phi / dt$
```

**块级公式：**
```markdown
$$I = \int \rho R^{2} dV$$
```

---

## 3. Markdown 扩展功能

### 3.1 GitHub 仓库卡片

可以添加动态 GitHub 仓库卡片：

```markdown
::github{repo="Fabrizz/MMM-OnSpotify"}
```

语法：
```markdown
::github{repo="<所有者>/<仓库>"}
```

### 3.2 提示框 (Admonitions)

支持以下类型的提示框：`note`、`tip`、`important`、`warning`、`caution`

**基本语法：**
```markdown
:::note
提醒用户注意的信息，即使在快速浏览时也应该注意到。
:::

:::tip
帮助用户成功的可选信息。
:::

:::important
用户成功所需的关键信息。
:::

:::warning
由于潜在风险需要立即注意的关键内容。
:::

:::caution
某个操作的负面潜在后果。
:::
```

**自定义标题：**
```markdown
:::note[我的自定义标题]
这是一个带自定义标题的提示框。
:::
```

**GitHub 语法（也支持）：**
```markdown
> [!NOTE]
> 也支持 GitHub 语法。

> [!TIP]
> 这是一个提示。
```

### 3.3 剧透 (Spoiler)

可以添加剧透文本：

```markdown
The content :spoiler[is hidden **ayyy**]!
```

语法：
```markdown
:spoiler[要隐藏的内容]
```

鼠标悬停时才会显示内容。

---

## 4. Expressive Code 代码块功能

### 4.1 语法高亮

```javascript
console.log('This code is syntax highlighted!')
```

### 4.2 编辑器和终端框架

**带标题的代码编辑器：**
```javascript title="my-test-file.js"
console.log('Title attribute example')
```

**文件名注释：**
```html
<!-- src/content/index.html -->
<div>File name comment example</div>
```

**终端框架：**
```bash
echo "This terminal frame has no title"
```

**带标题的终端：**
```powershell title="PowerShell terminal example"
Write-Output "This one has a title!"
```

**覆盖框架类型：**
```sh frame="none"
echo "Look ma, no frame!"
```

```ps frame="code" title="PowerShell Profile.ps1"
# Without overriding, this would be a terminal frame
function Watch-Tail { Get-Content -Tail 20 -Wait $args }
New-Alias tail Watch-Tail
```

### 4.3 文本和行标记

**标记整行和行范围：**
```javascript {1, 4, 7-8}
// Line 1 - targeted by line number
// Line 2
// Line 3
// Line 4 - targeted by line number
// Line 5
// Line 6
// Line 7 - targeted by range "7-8"
// Line 8 - targeted by range "7-8"
```

**选择行标记类型（mark、ins、del）：**
```javascript title="line-markers.js" del={2} ins={3-4} {6}
function demo() {
  console.log('this line is marked as deleted')
  // This line and the next one are marked as inserted
  console.log('this is the second inserted line')

  return 'this line uses the neutral default marker type'
}
```

**为行标记添加标签：**
```jsx {"1":5} del={"2":7-8} ins={"3":10-12}
// labeled-line-markers.jsx
<button
  role="button"
  {...props}
  value={value}
  className={buttonClassName}
  disabled={disabled}
  active={active}
>
  {children &&
    !active &&
    (typeof children === 'string' ? <span>{children}</span> : children)}
</button>
```

**在单独的行上添加长标签：**
```jsx {"1. Provide the value prop here:":5-6} del={"2. Remove the disabled and active states:":8-10} ins={"3. Add this to render the children inside the button:":12-15}
// labeled-line-markers.jsx
<button
  role="button"
  {...props}

  value={value}
  className={buttonClassName}

  disabled={disabled}
  active={active}
>

  {children &&
    !active &&
    (typeof children === 'string' ? <span>{children}</span> : children)}
</button>
```

**使用 diff 语法：**
```diff
+this line will be marked as inserted
-this line will be marked as deleted
this is a regular line
```

```diff
--- a/README.md
+++ b/README.md
@@ -1,3 +1,4 @@
+this is an actual diff file
-all contents will remain unmodified
 no whitespace will be removed either
```

**结合语法高亮和 diff 语法：**
```diff lang="js"
  function thisIsJavaScript() {
    // This entire block gets highlighted as JavaScript,
    // and we can still add diff markers to it!
-   console.log('Old code to be removed')
+   console.log('New and shiny code!')
  }
```

**标记行内的单个文本：**
```javascript "given text"
function demo() {
  // Mark any given text inside lines
  return 'Multiple matches of the given text are supported';
}
```

**正则表达式：**
```typescript /ye[sp]/
console.log('The words yes and yep will be marked.')
```

**转义正斜杠：**
```sh /\/ho.*\//
echo "Test" > /home/test.txt
```

**选择内联标记类型（mark、ins、del）：**
```javascript "return true;" ins="inserted" del="deleted"
function demo() {
  console.log('These are inserted and deleted marker types');
  // The return statement uses the default marker type
  return true;
}
```

### 4.4 自动换行

**每个块配置自动换行：**
```javascript wrap
// Example with wrap
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
```

**禁用自动换行：**
```javascript wrap=false
// Example with wrap=false
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
```

**配置换行的缩进：**
```javascript wrap preserveIndent
// Example with preserveIndent (enabled by default)
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
```

```javascript wrap preserveIndent=false
// Example with preserveIndent=false
function getLongString() {
  return 'This is a very long string that will most probably not fit into the available space unless the container is extremely wide'
}
```

### 4.5 可折叠部分

```javascript collapse={1-5, 12-14, 21-24}
// All this boilerplate setup code will be collapsed
import { someBoilerplateEngine } from '@example/some-boilerplate'
import { evenMoreBoilerplate } from '@example/even-more-boilerplate'

const engine = someBoilerplateEngine(evenMoreBoilerplate())

// This part of the code will be visible by default
engine.doSomething(1, 2, 3, calcFn)

function calcFn() {
  // You can have multiple collapsed sections
  const a = 1
  const b = 2
  const c = a + b

  // This will remain visible
  console.log(`Calculation result: ${a} + ${b} = ${c}`)
  return c
}

// All this code until the end of the block will be collapsed again
engine.closeConnection()
engine.freeMemory()
engine.shutdown({ reason: 'End of example boilerplate code' })
```

### 4.6 行号

**每个块显示行号：**
```javascript showLineNumbers
// This code block will show line numbers
console.log('Greetings from line 2!')
console.log('I am on line 3')
```

**禁用行号：**
```javascript showLineNumbers=false
// Line numbers are disabled for this block
console.log('Hello?')
console.log('Sorry, do you know what line I am on?')
```

**更改起始行号：**
```javascript showLineNumbers startLineNumber=5
console.log('Greetings from line 5!')
console.log('I am on line 6')
```

---

## 5. 添加图片和视频

### 5.1 添加图片

**基本 Markdown 语法：**
```markdown
![图片描述](图片路径)
```

**图片路径说明：**

1. **相对路径**（推荐）- 图片放在 `src/assets/images/` 目录下：
```markdown
![示例图片](assets/images/demo-avatar.png)
```

2. **绝对路径** - 图片放在 `public` 目录下：
```markdown
![示例图片](/favicon/ding.jpg)
```

3. **外部链接**：
```markdown
![示例图片](https://example.com/image.jpg)
```

**高级设置：**

**带链接的图片：**
```markdown
[![图片描述](图片路径)](链接地址)
```

**使用 HTML 控制尺寸：**
```html
<img src="assets/images/demo-avatar.png" width="300" alt="示例图片">
```

**图片对齐：**
```html
<div style="text-align: center;">
  <img src="assets/images/demo-avatar.png" alt="示例图片">
</div>
```

**注意：** Fuwari 内置了 PhotoSwipe 图片预览功能，点击图片会自动弹出大图预览。

### 5.2 添加视频

直接复制 YouTube、Bilibili 等平台的嵌入代码，粘贴到 Markdown 文件中即可。

**YouTube 示例：**
```html
<iframe width="100%" height="468" src="https://www.youtube.com/embed/5gIf0_xpFPI?si=N1WTorLKL0uwLsU_" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
```

**Bilibili 示例：**
```html
<iframe width="100%" height="468" src="//player.bilibili.com/player.html?bvid=BV1fK4y1s7Qf&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
```

---

## 6. 配置选项

### 6.1 网站配置 (`src/config.ts`)

```typescript
export const siteConfig: SiteConfig = {
  title: "网站标题",
  subtitle: "网站副标题",
  lang: "zh_CN",
  
  themeColor: {
    hue: 250,
    fixed: false,
  },
  
  banner: {
    enable: true,
    src: "assets/images/banner.jpg",
    position: "top",
    credit: {
      enable: true,
      text: "图片来源",
      url: "https://example.com",
    },
  },
  
  toc: {
    enable: true,
    depth: 2,
  },
};
```

### 6.2 导航栏配置

```typescript
export const navBarConfig: NavBarConfig = {
  links: [
    LinkPreset.Home,
    LinkPreset.Archive,
    LinkPreset.About,
    {
      name: "GitHub",
      url: "https://github.com/username/repo",
      external: true,
    },
  ],
};
```

### 6.3 个人资料配置

```typescript
export const profileConfig: ProfileConfig = {
  avatar: "assets/images/avatar.jpg",
  name: "你的名字",
  bio: "个人简介",
  links: [
    {
      name: "Twitter",
      icon: "fa6-brands:twitter",
      url: "https://twitter.com",
    },
  ],
};
```

### 6.4 许可协议配置

```typescript
export const licenseConfig: LicenseConfig = {
  enable: true,
  name: "CC BY-NC-SA 4.0",
  url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};
```

---

## 7. 快速参考

### 7.1 常用图标来源

访问 [icones.js.org](https://icones.js.org/) 查找图标代码。

需要安装对应的图标集：
```bash
pnpm add @iconify-json/<icon-set-name>
```

### 7.2 文章创建脚本

使用提供的脚本快速创建新文章：
```bash
node scripts/new-post.js
```

### 7.3 项目结构

```
fuwari/
├── src/
│   ├── assets/
│   │   └── images/          # 文章图片
│   ├── components/          # 组件
│   ├── content/
│   │   ├── posts/           # 文章目录
│   │   └── spec/
│   ├── i18n/                # 国际化
│   ├── layouts/             # 布局
│   ├── pages/               # 页面
│   ├── styles/              # 样式
│   └── config.ts            # 配置文件
├── public/                  # 静态资源
└── package.json
```

---

**参考资源：**
- [Astro 文档](https://docs.astro.build/)
- [Expressive Code](https://expressive-code.com/)
