---
title: M3UA
published: 2024-02-11
description: IPv4基础
tags: [计算机网络, IPv4, TCP/IP, 子网划分, NAT]
category: 技术笔记
draft: false
---


# M3UA 协议详解

## 概述

**M3UA**（MTP3 User Adaptation Layer，MTP3用户适配层）是SIGTRAN协议栈中的关键协议之一，由IETF在RFC 4666中定义。它用于在IP网络上传输SS7 MTP3层（Message Transfer Part Level 3）的用户消息，使得传统的SS7信令网络能够平滑过渡到IP网络。

## 核心功能

### 1. 主要作用
- **协议适配**：为上层MTP3用户提供无缝的IP传输服务
- **信令网关功能**：连接传统SS7网络与IP信令网络
- **链路管理**：管理SCTP（Stream Control Transmission Protocol）关联
- **路由管理**：处理信令点的可达性和拥塞状态

### 2. 协议栈位置
```
┌─────────────────────────────────────┐
│        SCCP/ISUP/TUP/TCAP           │  ← 应用层协议
├─────────────────────────────────────┤
│              MTP3                   │  ← 原SS7第三层
├─────────────────────────────────────┤
│              M3UA                   │  ← 用户适配层（本文）
├─────────────────────────────────────┤
│              SCTP                   │  ← 传输层协议
├─────────────────────────────────────┤
│               IP                    │  ← 网络层
└─────────────────────────────────────┘
```

## 消息类型

### ASPSM（ASP State Maintenance）消息
| 消息名 | 描述 |
|--------|------|
| ASP Up | ASP向SG（信令网关）注册上线 |
| ASP Down | ASP从SG注销下线 |
| ASP Up Ack | 对ASP Up的确认 |
| ASP Down Ack | 对ASP Down的确认 |
| Heartbeat | 心跳检测 |
| Heartbeat Ack | 心跳确认 |

### ASPTM（ASP Traffic Maintenance）消息
| 消息名 | 描述 |
|--------|------|
| ASP Active | ASP请求激活，开始处理业务 |
| ASP Inactive | ASP请求去激活 |
| ASP Active Ack | 激活确认 |
| ASP Inactive Ack | 去激活确认 |

### MGMT（Management）消息
| 消息名 | 描述 |
|--------|------|
| Error | 错误报告 |
| Notify | 状态通知 |

### SSNM（SS7 Signaling Network Management）消息
| 消息名 | 描述 |
|--------|------|
| Destination Unavailable (DUNA) | 目的地不可达 |
| Destination Available (DAVA) | 目的地可达 |
| Destination State Audit (DAUD) | 目的地状态审计 |
| Signaling Congestion (SCON) | 信令拥塞 |
| Destination User Part Unavailable (DUPU) | 目的用户部分不可用 |
| Destination Restricted (DRST) | 目的地受限 |

### RKM（Routing Key Management）消息
| 消息名 | 描述 |
|--------|------|
| Registration Request | 注册路由密钥请求 |
| Registration Response | 注册响应 |
| Deregistration Request | 注销请求 |
| Deregistration Response | 注销响应 |

### 数据传输消息
| 消息名 | 描述 |
|--------|------|
| Payload Data (DATA) | 传输用户数据 |

## 网络架构

### 典型组网
```
        SS7 Network                    IP Network
    ┌─────────────────┐            ┌────────────────────┐
    │     SP          │            │       AS           │
    │  (信令点)        │◄──MTP3──► │   (应用服务器)      │
    └─────────────────┘            └────────────────────┘
                                          │
    ┌─────────────────┐            ┌──────▼───────────────┐
    │     STP         │◄──MTP3──► │       SG             │
    │  (信令转接点)    │            │   (信令网关)          │
    └─────────────────┘            └──────┬───────────────┘
                                          │ SCTP
    ┌─────────────────┐            ┌──────▼───────────────┐
    │     SEP         │◄──MTP3──► │       ASP            │
    │ (信令终端点)      │            │ (应用服务器进程)       │
    └─────────────────┘            └──────────────────────┘
```

### 关键组件

#### SG（Signaling Gateway）- 信令网关
- 连接SS7网络与IP网络的边界设备
- 将MTP3消息转换为M3UA格式
- 管理多个SCTP关联
- 一个SG可以支持多个ASP

#### ASP（Application Server Process）- 应用服务器进程
- 运行在IP网络侧的端点
- 代表SS7信令点
- 处理M3UA消息并传递给上层应用
- 可以工作在主备或负荷分担模式

#### AS（Application Server）- 应用服务器
- 一个逻辑实体，代表一组ASP
- 通过Routing Key识别业务流
- 支持冗余和负荷分担

#### Routing Key（路由密钥）
- 用于将SS7信令路由到特定的AS
- 包含OPC（源信令点码）、DPC（目的信令点码）、SIO（业务指示语）等
- 支持灵活的流量分发策略

## 工作流程

### 1. 建立连接
```
ASP                              SG
 │                                │
 │──────────── ASP UP ───────────▶│
 │◄────────── ASP UP ACK ────────│
 │                                │
 │─────────── ASP ACTIVE ────────▶│
 │◄──────── ASP ACTIVE ACK ──────│
 │                                │
```

### 2. 数据传输
```
┌─────────┐      ┌─────────┐      ┌─────────┐
│   应用   │─────▶│  M3UA   │─────▶│  SCTP   │
└─────────┘      └─────────┘      └─────────┘
                      │
                      ▼
                DATA消息格式:
                ┌────────────────┐
                │  Common Header │
                ├────────────────┤
                │ Routing Context│
                ├────────────────┤
                │ Protocol Data  │
                ├────────────────┤
                │    Correlation │
                └────────────────┘
```

### 3. 状态管理
- **ASP状态**: DOWN → UP → ACTIVE/INACTIVE
- **AS状态**: INACTIVE → ACTIVE → PENDING → DOWN
- **链路状态**: 通过SCTP的heartbeat机制检测

## 与MTP3的对应关系

| MTP3功能 | M3UA对应实现 |
|----------|--------------|
| 消息路由 | Routing Key + SGP/ASP选择 |
| 链路管理 | SCTP关联管理 |
| 信令网管理 | SSNM消息组 |
| 用户数据 | Payload Data消息 |
| 信令点码 | 通过Routing Context映射 |

## 应用场景

### 1. 软交换系统
- MSC Server和媒体网关之间的信令传输
- 传统TDM交换机与IP网络的互通

### 2. 短信中心（SMSC）
- 基于IP的短信业务处理
- MAP/CAP信令的传输

### 3. 智能网（IN）
- 业务控制点（SCP）的IP化改造
- CAP信令传输

### 4. 4G/5G核心网
- STP（信令转接点）的IP化
- Diameter/SCTP信令路由

## 配置要点

### SCTP参数配置
```
SCTP关联配置:
- 本地端口: 2905（标准M3UA端口）
- 远端端口: 2905
- 流数目: 通常配置2-4个流
- 心跳间隔: 30秒
- 重传超时: 1-5秒
```

### 路由密钥配置示例
```
Routing Key配置:
- OPC: 1234（源信令点码）
- DPC: 5678（目的信令点码）
- SIO: 3（SCCP消息）
- Routing Context: 100
- AS名称: AS-SCCP-001
```

## 相关协议

| 协议 | 说明 | RFC |
|------|------|-----|
| M2UA | MTP2用户适配层 | RFC 3331 |
| M2PA | MTP2用户对等适配层 | RFC 4165 |
| SUA | SCCP用户适配层 | RFC 3868 |
| SCTP | 流控制传输协议 | RFC 4960 |

## 总结

M3UA是SIGTRAN协议族中最常用的协议，它实现了SS7 MTP3层在IP网络中的功能映射，使得传统电信网络可以平滑过渡到IP网络。通过SCTP提供可靠的传输服务，支持丰富的网络管理功能和灵活的负荷分担策略。

## 参考文档

- RFC 4666 - Signaling System 7 (SS7) Message Transfer Part 3 (MTP3) - User Adaptation Layer (M3UA)
- ITU-T Q.704 - Signaling network functions and messages
- IETF SIGTRAN Working Group Documents
