---
title: WSL 中 pnpm install 在 Windows NTFS 上的符号链接问题
published: 2026-07-15
description: 在 WSL 环境通过 pnpm 安装 node_modules 后，Windows 原生 Node.js 找不到模块的排查与解决
tags: [其他]
category: [技术笔记]
draft: false
---

最近在 Windows 上维护 Fuwari (Astro) 博客时遇到一个奇怪的错误——`pnpm dev` 报模块找不到，但 `node_modules` 里明明有 `astro` 包。记录一下排查过程和根因。

## 1. 现象

在 Windows PowerShell 中运行：

```powershell
pnpm dev
```

报错：

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
'D:\...\node_modules\astro\dist\cli\index.js'
```

报错路径指向 `astro` 包的入口文件 `dist/cli/index.js` 不存在。

## 2. 排查过程

### 2.1 检查 node_modules

先从 WSL 侧看 `node_modules/astro/`：

```bash
ls node_modules/astro/
# 输出: components/  astro.js
```

`astro.js` 在，但 `dist/` 目录下**没有 `cli/` 子目录**。进一步检查发现 `package.json` 甚至读取失败：

```bash
cat node_modules/astro/package.json
# cat: No such file or directory
```

### 2.2 确认安装假象

细看目录权限：

```
777  dist/actions/
777  dist/assets/
777  dist/core/
```

所有 `dist/` 子目录权限是 `777` 且没有类型标识（缺少 `d` 前缀），`find` 能找到但 `ls` 访问就报 "No such file or directory"。

这说明文件**看似存在，实际内容是空洞的**——典型的符号链接目标丢失。

## 3. 根因：WSL + NTFS + pnpm 的符号链接问题

问题链路如下：

1. **pnpm 的 node_modules 结构重度依赖符号链接**——它使用内容寻址存储（Content-addressable store），`node_modules` 里的包大部分是指向 pnpm store 的符号链接。
2. **WSL 在 `/mnt/d/`（Windows NTFS 挂载点）上创建符号链接的行为与 Windows 原生不同**——WSL 的 `symlink()` 系统调用可能创建 Linux 风格的符号链接，Windows 原生程序（Node.js、pnpm）无法正确解析。
3. **pnpm install 在 WSL 侧成功返回**，因为 pnpm 认为链接创建成功，但实际上 Windows 侧的符号链接目标悬空。

简言之：**不要在 WSL 里对 `/mnt/` 下的 Windows 项目跑 `pnpm install`**。

## 4. 解决方案

### 4.1 清理残骸

在 **Windows PowerShell**（非 WSL）中删除 WSL 留下的半残 `node_modules`：

```powershell
rm -r -Force node_modules
```

### 4.2 原生环境重装

还是在 Windows PowerShell 里：

```powershell
pnpm install
pnpm dev
```

pnpm 在 Windows 原生环境中会使用 Windows 风格的符号链接（或 fallback 到拷贝模式），`node_modules` 结构完整可用。

装成功后确认 `cli/index.js` 存在：

```powershell
ls node_modules/astro/dist/cli/index.js
# 应该输出现实文件信息
```

## 5. 总结

| 环节 | 结论 |
|------|------|
| 根因 | WSL 在 NTFS 上创建的符号链接 Windows 原生程序无法解析 |
| 触发条件 | 在 WSL 中对 `/mnt/` 下的 Windows 项目执行 pnpm install |
| 表征 | node_modules 看似存在但实际文件缺失，报 ERR_MODULE_NOT_FOUND |
| 修复 | 在 Windows 原生终端（PowerShell/cmd）中重装依赖 |
| 预防 | 涉及 pnpm/npm 依赖安装时，**始终在项目所在 OS 的原生环境中操作** |

这条规则不仅适用于 pnpm，也适用于 npm 和 yarn——任何依赖符号链接的包管理器在 WSL ↔ NTFS 边界上都可能出问题。老实回到原生环境装依赖就没事了喵~

---

本文章由助手CoCo生成~
