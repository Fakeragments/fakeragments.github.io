---
title: K8S安装
published: 2025-08-09
description: K8S安装学习记录
tags: [云计算, K8S]
category: 技术笔记
draft: false
---


# 环境说明
开始想的是用minikube，但是局限性有太多，网上的教程有点乱，还是想着自己折腾一下。

正好有个核心网+K8S的项目是采用多节点方式部署，这里就使用**kubeadm**方式来部署了，为了熟悉命令，不使用dashboard。

所有节点虚拟机参数如下：
- 系统：ubuntu-24.04.4-live-server-amd64；
- VMware部署，单处理器8核，16G运存，80G磁盘；
- 单网卡做NAT

-----

# Master单节点部署
**k8s安装**，这里安装的是 **1.28** 版本，apt源使用阿里源：
```bash
hostnamectl set-hostname k8s-master1
echo “192.168.24.130 k8s-master1” >> /etc/hosts

swapoff -a
sed -i '/swap/s/^/#/' /etc/fstab

ufw disable

# 调整网络参数
cat <<EOF | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

# 安装配置containerd（替代docker）
apt install -y containerd
mkdir -p /etc/containerd
containerd config default > /etc/containerd/config.toml
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/g' /etc/containerd/config.toml
systemctl restart containerd
systemctl enable containerd
systemctl status containerd

# 安装k8s https://developer.aliyun.com/mirror/kubernetes
apt-get update && apt-get install -y apt-transport-https
curl -fsSL https://mirrors.aliyun.com/kubernetes-new/core/stable/v1.28/deb/Release.key |
    gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://mirrors.aliyun.com/kubernetes-new/core/stable/v1.28/deb/ /" |
    tee /etc/apt/sources.list.d/kubernetes.list
apt-get update
apt-get install -y kubelet kubeadm kubectl
```

-----

**到这里container和k8s组件已经基本部署完成，接下来开始初始化k8s：**
:::note[踩坑记录]
这里使用的阿里云的镜像仓库，因此还需要修改container的配置文件。
:::

```bash
sed -i 's|sandbox_image = .*|sandbox_image = "registry.aliyuncs.com/google_containers/pause:3.9"|' /etc/containerd/config.toml<br>
systemctl restart containerd

kubeadm init \
  --apiserver-advertise-address=192.168.24.130 \
  --image-repository registry.aliyuncs.com/google_containers \
  --kubernetes-version v1.28.4 \
  --service-cidr=10.0.0.0/12 \
  --pod-network-cidr=192.168.0.0/16
```

这时候通过`kubectl get nodes`看主节点是连接失败的，需要配置其他组件：
```bash
kubectl get nodes
# E0405 15:48:47.825576   45541 memcache.go:265] couldn't get current server API group list: Get "http://localhost:8080/api?timeout=32s": dial tcp 127.0.0.1:8080: connect: connection refused
# The connection to the server localhost:8080 was refused - did you specify the right host or port?


# 给权限
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config
kubectl get nodes
#NAME          STATUS     ROLES           AGE   VERSION
#k8s-master1   NotReady   control-plane   17m   v1.28.15

# 网络插件，可以理解为k8s集群中负责通信的网络设备
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/calico.yaml

# 查看整体
kubectl get pods -n kube-system  &&  kubectl get nodes
# NAME                                       READY   STATUS    RESTARTS   AGE
# calico-kube-controllers-66f8b6cf45-h7cmw   1/1     Running   0          5m21s
# calico-node-fzrsr                          1/1     Running   0          5m21s
# coredns-66f779496c-4j4w7                   1/1     Running   0          25m
# coredns-66f779496c-njdsz                   1/1     Running   0          25m
# etcd-k8s-master1                           1/1     Running   1          25m
# kube-apiserver-k8s-master1                 1/1     Running   1          25m
# kube-controller-manager-k8s-master1        1/1     Running   1          25m
# kube-proxy-bl7zf                           1/1     Running   0          25m
# kube-scheduler-k8s-master1                 1/1     Running   1          25m
# NAME          STATUS   ROLES           AGE   VERSION
# k8s-master1   Ready    control-plane   25m   v1.28.15
```
**到这里 Master 节点已经部署完成了，现在处理工作（Worker）节点。**

# Master单节点部署
