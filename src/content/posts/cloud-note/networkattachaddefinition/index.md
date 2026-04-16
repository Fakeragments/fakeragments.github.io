---
title: K8S NAD
published: 2025-08-13
description: K8S Network Attachment Definition
tags: [云计算, K8S]
category: 技术笔记
draft: false
---

# NAD概述
之前学习K8S基础的时候，pod都是以单网卡的形式工作，`默走集群CNI（Container Network Interface）网络`（Flannel/Calico 等）。

以核心网容器化为例，不同的网元可能需要工作在不同的网段，网络资源需要更明细的划分，其实这只是核心网容器化最最基础的需求，其他的如状态保持之类的就更麻烦。
- 普通**网元一般会区分业务网段和管理网段**，单POD的单网卡限制了这一点
- 使用`NodePort`将POD服务端口映射到节点端口，对于UPF数据转发业务并不适用（GTP封装不允许NAT）。
- 强状态网元也不适用于用`clusterIP`提供服务，如AMF SMF会保留上下文和PDU会话，不能随便负载均衡。

NAD（Network Attachment Definition）是K8S的一种资源定义，用于描述一个Pod的网络附件。