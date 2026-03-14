---
title: sccp
published: 2024-02-11
description: IPv4基础
tags: [计算机网络, IPv4, TCP/IP, 子网划分, NAT]
category: 技术笔记
draft: false
---
# SCCP 协议详解

## 概述

**SCCP**（Signaling Connection Control Part，信令连接控制部分）是SS7（Signaling System No.7）协议栈的重要组成部分，由ITU-T在Q.711-Q.719系列建议书中定义。SCCP位于MTP3之上，提供了比MTP3更强大的寻址和路由功能，支持面向连接和无连接的信令传输服务。

## 核心功能

### 1. 主要能力
- **增强的寻址能力**：支持全局码（Global Title, GT）翻译
- **连接管理**：支持面向连接的数据传输
- **分段重组**：处理大数据包的分段和重组
- **多协议支持**：承载TCAP、RANAP、BSSAP等多种上层协议

### 2. 协议栈位置
```
┌────────────────────────────────────────┐
│    TCAP / RANAP / BSSAP / MAP / CAP    │  ← 应用层
├────────────────────────────────────────┤
│                 SCCP                   │  ← 信令连接控制部分
├────────────────────────────────────────┤
│                 MTP3                   │  ← 消息传输部分第三层
├────────────────────────────────────────┤
│                 MTP2                   │  ← 消息传输部分第二层
├────────────────────────────────────────┤
│                 MTP1                   │  ← 消息传输部分第一层
└────────────────────────────────────────┘
```

## 寻址方式

### 1. 地址类型
SCCP支持三种主要的地址标识方式：

#### DPC + SSN（信令点码 + 子系统号）
```
地址结构:
┌─────────────────┬─────────────────┐
│     DPC         │      SSN        │
│  (14/24 bits)   │   (8 bits)      │
└─────────────────┴─────────────────┘

示例:
- DPC: 0x1234 (信令点码)
- SSN: 6 (HLR), 7 (VLR), 8 (MSC) 等
```

#### Global Title（全局码）
```
GT结构:
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│  GTAI   │  TT     │  NP     │  NA     │  Address│
│  (4bit) │ (8bit)  │ (4bit)  │ (4bit)  │ (可变)   │
└─────────┴─────────┴─────────┴─────────┴─────────┘

GTAI: Global Title Address Indicator
TT: Translation Type
NP: Numbering Plan (ISDN/Telephony, Data, etc.)
NA: Nature of Address
Address: 实际地址号码
```

常用SSN值：
| SSN值 | 子系统名称 | 说明 |
|-------|------------|------|
| 0 | SSN not known | 未知 |
| 1 | SCCP Management | SCCP管理 |
| 6 | HLR | 归属位置寄存器 |
| 7 | VLR | 访问位置寄存器 |
| 8 | MSC | 移动交换中心 |
| 146 | RANAP | 无线接入网应用部分 |
| 149 | BSSAP | BSS应用部分 |
| 254 | BSS Operation | BSS操作维护 |
| 255 | BSSAP-LE | BSSAP专用 |

## 业务类别

### 1. 四类基本业务

#### Class 0 - 基本无连接类
- **特点**：消息独立传输，无顺序保证
- **适用**：短消息、无需排序的业务
- **原语**：N-UNITDATA.request/indication

#### Class 1 - 有序无连接类
- **特点**：消息保持顺序传输
- **适用**：需要顺序保证的短消息
- **原语**：N-UNITDATA.request/indication

#### Class 2 - 基本面向连接类
- **特点**：建立连接，无流量控制
- **适用**：可靠数据传输
- **原语**：N-CONNECT, N-DATA, N-DISCONNECT

#### Class 3 - 流量控制面向连接类
- **特点**：建立连接，带流量控制
- **适用**：大数据量传输
- **原语**：增加N-EXPEDITED-DATA, N-RESET等

### 2. 业务选择
```
┌─────────────────────────────────────────────┐
│              SCCP 业务选择                    │
├─────────────────────────────────────────────┤
│  无连接业务                                  │
│  ├── Class 0: 无序传输                       │
│  └── Class 1: 有序传输                       │
├─────────────────────────────────────────────┤
│  面向连接业务                                │
│  ├── Class 2: 基本连接（无流控）              │
│  └── Class 3: 增强连接（带流控）              │
└─────────────────────────────────────────────┘
```

## 消息类型

### 无连接消息
| 消息名 | 缩写 | 描述 |
|--------|------|------|
| Unitdata | UDT | 单元数据，基本无连接消息 |
| Unitdata Service | UDTS | 单元数据服务（可选返回） |
| Extended Unitdata | XUDT | 扩展单元数据（支持分段） |
| Extended Unitdata Service | XUDTS | 扩展单元数据服务 |
| Long Unitdata | LUDT | 长单元数据 |
| Long Unitdata Service | LUDTS | 长单元数据服务 |

### 连接管理消息
| 消息名 | 缩写 | 描述 |
|--------|------|------|
| Connection Request | CR | 连接请求 |
| Connection Confirm | CC | 连接确认 |
| Connection Refused | CREF | 连接拒绝 |
| Released | RLSD | 释放连接 |
| Release Complete | RLC | 释放完成 |

### 数据传输消息
| 消息名 | 缩写 | 描述 |
|--------|------|------|
| Data Form 1 | DT1 | 数据形式1（基本） |
| Data Form 2 | DT2 | 数据形式2（带确认） |
| Expedited Data | ED | 加急数据 |
| Expedited Data Ack | EA | 加急数据确认 |
| Data Acknowledgement | AK | 数据确认 |

### 协议控制消息
| 消息名 | 缩写 | 描述 |
|--------|------|------|
| Reset Request | RSR | 复位请求 |
| Reset Confirmation | RSC | 复位确认 |
| Inactivity Test | IT | 不活动测试 |

## 消息格式

### 通用消息头
```
SCCP消息结构:
┌─────────────────────────────────────────────┐
│           Routing Label (MTP3)              │ ← 由MTP3处理
├─────────────────────────────────────────────┤
│  Message Type (1 byte)                      │
├─────────────────────────────────────────────┤
│  Mandatory Fixed Part (可选)                 │
├─────────────────────────────────────────────┤
│  Mandatory Variable Part (可选)              │
├─────────────────────────────────────────────┤
│  Optional Part (可选)                        │
└─────────────────────────────────────────────┘
```

### UDT消息格式示例
```
Unitdata (UDT) 消息:
┌─────────────────────────────────────────────┐
│  Message Type = 0x09 (UDT)                  │
├─────────────────────────────────────────────┤
│  Protocol Class (Class 0 or 1)              │
├─────────────────────────────────────────────┤
│  Called Party Address Pointer               │
├─────────────────────────────────────────────┤
│  Calling Party Address Pointer              │
├─────────────────────────────────────────────┤
│  Data Pointer                               │
├─────────────────────────────────────────────┤
│  Called Party Address (Variable)            │
├─────────────────────────────────────────────┤
│  Calling Party Address (Variable)           │
├─────────────────────────────────────────────┤
│  Data (Variable)                            │
└─────────────────────────────────────────────┘
```

### 地址格式详解
```
地址参数结构:
┌─────────────────────────────────────────────┐
│  Address Indicator (1 byte)                 │
│  ├── 7-6 bits: Routing Indicator (RI)       │
│  │   00: Route on GT                        │
│  │   01: Route on DPC+SSN                   │
│  │   10: Route on DPC                       │
│  │   11: Reserved                           │
│  ├── 5 bit: GT Present                      │
│  ├── 4 bit: SSN Present                     │
│  ├── 3 bit: PC Present                      │
│  └── 0-2 bits: Reserved                     │
├─────────────────────────────────────────────┤
│  Signaling Point Code (if present)          │
├─────────────────────────────────────────────┤
│  Subsystem Number (if present)              │
├─────────────────────────────────────────────┤
│  Global Title (if present)                  │
└─────────────────────────────────────────────┘
```

## GT翻译过程

### 1. 翻译原理
```
GT翻译流程:
┌────────────┐      ┌─────────────────┐      ┌────────────┐
│   源节点    │─────▶│  GT翻译服务器    │─────▶│  目的节点   │
│            │      │  (STP/SCCP)      │      │            │
└────────────┘      └─────────────────┘      └────────────┘
                           │
                    查找GT翻译表
                    DPC = f(GT)
```

### 2. 翻译表示例
```
GT翻译表结构:
┌────────────────────┬────────────────────┬───────────┐
│      GT范围         │    翻译结果        │  优先级   │
├────────────────────┼────────────────────┼───────────┤
│ 86138* (中国移动)   │ DPC=0x1234, SSN=6  │    1      │
│ 86139* (中国移动)   │ DPC=0x1234, SSN=6  │    1      │
│ 86186* (中国联通)   │ DPC=0x5678, SSN=6  │    1      │
│ 86189* (中国电信)   │ DPC=0x9ABC, SSN=6  │    1      │
└────────────────────┴────────────────────┴───────────┘
```

## 连接管理

### 1. 建立连接流程（Class 2/3）
```
Calling Party                        Called Party
      │                                    │
      │───────── CR (Connection Request) ─▶│
      │     包含: 源地址、目的地址、        │
      │           用户数据(可选)            │
      │                                    │
      │◄────────── CC (Connection Confirm) │
      │     包含: 响应地址、                │
      │           用户数据(可选)            │
      │                                    │
      │ 连接建立成功，分配本地引用(LRN)      │
      │                                    │
```

### 2. 数据传输流程
```
已建立连接后:
Calling Party                        Called Party
      │                                    │
      │────────── DT1 (Data Form 1) ──────▶│
      │   或 DT2 (Data Form 2 with seq)    │
      │                                    │
      │◄───────────────────────────────────│
      │   双向数据传输                      │
      │                                    │
      │──────── ED (Expedited Data) ──────▶│
      │   加急数据（Class 3）                │
      │                                    │
```

### 3. 释放连接流程
```
释放连接:
Calling Party                        Called Party
      │                                    │
      │──────── RLSD (Released) ──────────▶│
      │     包含: 释放原因                  │
      │                                    │
      │◄─────── RLC (Release Complete) ────│
      │     确认释放                        │
      │                                    │
      │ 连接释放，资源回收                   │
      │                                    │
```

## 释放原因代码

| 原因码 | 说明 |
|--------|------|
| 0x00 | End User Originated |
| 0x01 | End User Congestion |
| 0x02 | End User Failure |
| 0x03 | SCCP User Originated |
| 0x04 | Remote Procedure Error |
| 0x05 | Inconsistent Connection Data |
| 0x06 | Access Failure |
| 0x07 | Access Congestion |
| 0x08 | Subsystem Failure |
| 0x09 | Subsystem Congestion |
| 0x0A | MTP Failure |
| 0x0B | Network Congestion |
| 0x0C | Expiration of Connect Timer |
| 0x0D | Expiration of Release Timer |
| 0x0E | Expiration of Reset Timer |
| 0x0F | Expiration of Inactivity Timer |
| 0x10 | Unqualified |
| 0x11 | SCCP Failure |
| 0x12 | Used by Hop Counter |
| 0x13 | Cannot Segment Data |
| 0x14 | Incomplete Data Received |
| 0x15 | Subsystem Unauthorized |

## 应用场景

### 1. 移动通信网络
```
┌──────────┐    SCCP    ┌──────────┐    SCCP    ┌──────────┐
│   MSC    │◄──────────▶│   HLR    │◄──────────▶│   VLR    │
└──────────┘   (MAP)     └──────────┘   (MAP)    └──────────┘
                              │
                              ▼ SCCP (MAP)
                         ┌──────────┐
                         │   AUC    │
                         └──────────┘
```

### 2. 智能网
```
┌──────────┐    SCCP    ┌──────────┐    SCCP    ┌──────────┐
│   SSP    │◄──────────▶│   SCP    │◄──────────▶│   SMP    │
└──────────┘   (INAP)    └──────────┘  (CAP)     └──────────┘
```

### 3. 3G/4G/5G网络
```
┌──────────┐    SCCP    ┌──────────┐    SCCP    ┌──────────┐
│   RNC    │◄──────────▶│   MSC    │◄──────────▶│   HLR    │
└──────────┘  (RANAP)   └──────────┘   (MAP)    └──────────┘
     │                                             │
     │ SCCP                                        │ SCCP
     ▼                                             ▼
┌──────────┐                                 ┌──────────┐
│    UE    │                                 │    SGSN  │
└──────────┘                                 └──────────┘
```

## SCCP管理

### 1. 子系统状态管理
SCCP管理消息用于报告子系统的状态变化：
- **Subsystem Allowed (SSA)**: 子系统可用
- **Subsystem Prohibited (SSP)**: 子系统不可用
- **Subsystem Congested (SSC)**: 子系统拥塞

### 2. 信令点状态管理
- **Signaling Point Allowed (SPA)**: 信令点可用
- **Signaling Point Prohibited (SPP)**: 信令点不可用

## 与上层协议关系

| 上层协议 | 用途 | SCCP业务类 |
|----------|------|-----------|
| TCAP | 事务能力应用部分，用于数据库查询 | Class 1 (有序UDT) |
| MAP | 移动应用部分，用于GSM/UMTS信令 | Class 1 |
| CAP | CAMEL应用部分，用于智能网 | Class 1 |
| RANAP | 无线接入网应用部分 | Class 1/2 |
| BSSAP | BSS应用部分 | Class 1/2 |
| INAP | 智能网应用部分 | Class 2 |

## 总结

SCCP是SS7信令网络的核心协议之一，它提供了：
1. **灵活的寻址机制** - 支持GT翻译和DPC+SSN寻址
2. **多样的业务类别** - 从无连接到面向连接的多种服务
3. **可靠的数据传输** - 支持流量控制和错误恢复
4. **强大的网络互通** - 是多种电信应用的基础

在现代电信网络中，SCCP仍然是2G/3G/4G/5G核心网信令传输的重要组件，尽管随着Diameter、HTTP/2等新协议的出现，SCCP的使用场景有所变化，但在传统网络的互通和演进中仍然不可或缺。

## 参考文档

- ITU-T Q.711 - Functional description of the Signalling Connection Control Part
- ITU-T Q.712 - Definition and function of SCCP messages
- ITU-T Q.713 - SCCP formats and codes
- ITU-T Q.714 - SCCP procedures
- ITU-T Q.715 - SCCP user guide
