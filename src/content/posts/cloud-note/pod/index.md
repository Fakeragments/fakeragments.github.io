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
- 一个pod里可以包含`一个或多个容器`。
- 同一个pod内的容器资源共享：
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


环境信息：
- master1 192.168.24.130
- worker1 192.168.24.131

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

这里选择用container里的镜像加速地址来拉取，也可以用本地pull的镜像，见之前K8S部署文章。

生产环境下几乎都是使用yaml文件来创建pod，使用`kubectl apply -f nginx.yaml`来创建nginx pod，这里`使用的环境为前面部署的单master+单worker`，由于master自带taint（污点）无法跑普通pod，所以这里会分配到worker1去。
```bash
root@k8s-master1:~# kubectl apply -f nginx.yaml

root@k8s-master1:~# kubectl get pods -o wide
# NAME        READY   STATUS    RESTARTS   AGE     IP              NODE          NOMINATED NODE   READINESS GATES
# nginx-pod   1/1     Running   0          2m15s   172.30.194.68   k8s-worker1   <none>           <none>

# 临时把本地端口转发到Pod的80端口，不加0.0.0.0的话只能在本机访问，这里需要在宿主机浏览器来访问就加上0.0.0.0
# 端口转发在master1执行的，但是pod是跑在worker1上的，k8s会自动把请求转发到worker1
root@k8s-master1:~# kubectl port-forward pod/nginx-pod 8080:80 --address=0.0.0.0

root@k8s-master1:~# curl 192.168.24.130:8080
# <!DOCTYPE html>
# <html>
# <head>
# <title>Welcome to nginx!</title>
# ...

```

可以通过命令 `kubectl exec -it podname`进入Pod的shell：
```bash
root@k8s-master1:~# kubectl exec -it nginx-pod -- /bin/bash
# root@nginx-pod:/# 
```

# 3. Pod和container
**Pod是K8S中最小的可部署、可管理的运行单位，而一个Pod里可以包含1个或多个容器。**
```shell
Pod A
  ├─ Container 1（nginx1）
  └─ Container 2（nginx2）
```

还是用例子来说明，回到上面的 `nginx.yaml` ，修改下，新增一个redis：
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-redis-pod
spec:
  containers:
    - name: nginx
      image: nginx
      ports:
        - containerPort: 80

    - name: redis
      image: redis:alpine
      ports:
        - containerPort: 6379
```

:::tip
多容器 Pod 适合放互相配合的业务（Web+DB），不适合放相同服务的container，如放两个nginx的话会端口冲突，需要修改容器内nginx配置文件。
:::

先delete之前的，因为pod中的container无法扩缩容，之后再apply即可。
```shell
root@k8s-master1:~# kubectl delete -f nginx.yaml
# 也可以直接 kubectl delete pod podname删除

root@k8s-master1:~# kubectl apply -f nginx.yaml
root@k8s-master1:~# kubectl get pods
# NAME              READY   STATUS    RESTARTS   AGE
# nginx-redis-pod   2/2     Running   0          78s

# 通过-c 指定container名称来进入容器 
root@k8s-master1:~# kubectl exec -it nginx-redis-pod -c nginx -- /bin/bash
root@k8s-master1:~# kubectl exec -it nginx-redis-pod -c redis -- /bin/sh

```

# 简单总结
1. Pod=K8s最小调度单位
2. 一个Pod可包含1到多个容器
3. 同一Pod内：网络共享、文件隔离、端口不能冲突
4. Pod不可变：增删容器必须重建
