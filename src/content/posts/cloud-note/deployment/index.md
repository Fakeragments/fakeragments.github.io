---
title: K8S deployment
published: 2025-08-09
description: K8S deployment 学习
tags: [Docker, Pod, 云计算, K8S]
category: 技术笔记
draft: true
---

# deployment基本概念
Deployment 是 Kubernetes 中最常用的`工作负载资源`，**用于管理无状态应用，实现 Pod 的部署、自愈、扩缩容、滚动更新与回滚**，实现应用高可用、自动化运维，是K8s最核心、最常用的资源对象。
> 工作负载资源：K8s 管理业务的控制器（Deployment 等）

> 无状态应用：不存数据、随便删随便扩的服务

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hellok8s-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hellok8s
  template:
    metadata:
      labels:
        app: hellok8s
    spec:
      containers:
        - image: guangzhengli/hellok8s:v1
          name: hellok8s-container
```