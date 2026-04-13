---
title: K8S deployment
published: 2025-08-11
description: K8S deployment 学习
tags: [云计算, K8S]
category: 技术笔记
draft: false
---

# deployment基本概念
Deployment 是k8s中最常用的`工作负载资源`，**用于管理无状态应用，实现Pod的部署、自愈、扩缩容、滚动更新与回滚**，实现应用高可用、自动化运维，是K8s最核心、最常用的资源对象。

说白了就是管pod的东西。


# deployment实践

环境使用上节部署的nginx-redis pod，还是用大佬的案例来展开：
::github{repo="guangzhengli/k8s-tutorials"}

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-redis-deployment
spec:
  replicas: 1

  selector:
    matchLabels:
      app: nginx-redis

  template:
    metadata:
      labels:
        app: nginx-redis
    spec:
      containers:
        # 容器1：Nginx
        - name: nginx
          image: nginx
          ports:
            - containerPort: 80

        # 容器2：Redis
        - name: redis
          image: redis:alpine
          ports:
            - containerPort: 6379
```

- 类型 `kind` 为 `Deployment`，名称为 `nginx-redis-deployment`。
- `spec` 字段中 ：
1. `replicas` 为 1，表示部署一个pod副本。
2. `selector` 字段中 `matchLabels` 表示 deployment 会管理 (selector) 所有 `labels = nginx-redis` 的 pod，`selector` 是 Deployment 要找的 Pod。
3. `template` 里面是用来定义 `pod` 资源的，这里的 `label app` 需要和前面对应。 

使用 `apply -f deployment.yaml` 部署：
```bash
root@k8s-master1:~# kubectl apply -f deployment.yaml
root@k8s-master1:~# kubectl get pods
# NAME                                      READY   STATUS    RESTARTS   AGE
# nginx-redis-deployment-6c69b4d46c-p886c   1/1     Running   0          2d10h

# 查看使用的deployment文件
root@k8s-master1:~# kubectl get deployment
# NAME                     READY   UP-TO-DATE   AVAILABLE   AGE
# nginx-redis-deployment   1/1     1            1           2d23h

kubectl get deploy nginx-redis-deployment -o yaml


```

这时候手动把这个pod给删除：
```bash
root@k8s-master1:~# kubectl delete pod nginx-redis-deployment-6c69b4d46c-p886c
root@k8s-master1:~# kubectl get pods
# NAME                                      READY   STATUS    RESTARTS        AGE
# nginx-redis-deployment-6c69b4d46c-b4k85   1/1     Running   0               5m3s
# nginx-redis-pod                           2/2     Running   2 (8m16s ago)   4d3h
```
**deployment会自动创建一个新的pod**，即可以通过只维护deployment这一个文件来实现多个pod的管理。

这里删除时遇到了 `Failed to create pod sandbox: open /run/systemd/resolve/resolv.conf: no such file or directory`，只需要在`worker1`节点上创建下这个文件的软连接就行。
```bash
mkdir -p /run/systemd/resolve/
ln -s /etc/resolv.conf /run/systemd/resolve/resolv.conf
```
