---
title: K8s Pod基础
published: 2025-08-10
description: K8s Pod基础学习记录
tags: [云计算, K8S, Pod]
category: 技术笔记
draft: false
---

# 1. Pod基本概念
**Pod是Kubernetes中最小的可部署、可管理的运行单位（不是容器）**
- 一个 Pod 里可以包含`一个或多个容器`。
- 同一个 Pod 内的容器：
      共享网络命名空间（同一个IP、端口空间）
      共享存储卷（Volume）
      共享UTS、IPC命名空间
      可以通过localhost互相访问
- Pod是短暂、易销毁、不可变的，一旦删除就重建，IP会变。
- Pod本身不保证高可用，崩溃不会自动重启，需要Deployment管理。
- Pod生命周期：`Pending → ContainerCreating → Running → Terminating → Terminated`
![pod](pod.png)

# 2. Pod创建
**案例来源：**
::github{repo="guangzhengli/k8s-tutorials"}

首先还是先新建一个 `nginx.yaml` 文件：
```yaml
# nginx.yaml
apiVersion: v1

kind: Pod

metadata:
  name: nginx-pod

spec:
  containers:
    - name: nginx-container
      image: nginx
```
了解下结构，yaml文件包含4个顶级字段：
- **apiVersion**：版本号（固定）
- **kind**：类型（Pod / Deployment / Service）
- **metadata**：元数据（名字、标签）
- **spec**：规格（核心内容：容器、镜像、资源）

生产环境下几乎都是使用yaml文件来创建pod，使用`kubectl apply -f nginx.yaml`来创建nginx pod，这里使用的环境为前面部署的单master+单worker，由于master自带taint（污点）无法跑普通pod，所以这里会分配到worker1去。
```bash
kubectl apply -f nginx.yaml

```
