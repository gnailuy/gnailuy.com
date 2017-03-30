--- 
layout: post
title: 无光驱、无 USB，网络安装 CentOS
date: 2011-12-25 23:02:33 +0800
categories: [ linux ]
---

实验室有台非常老的机器，今天被我翻出来打算当作我们 Hadoop 集群中的一个节点。这台机器上原有一个 Fedora 8 可以用，不过我还是想给它安装一个全新的 CentOS 5.7。
只有一个问题，就是这台机器太老了，光驱和 USB 接口竟然全都坏掉了。

<!-- more -->

看起来问题似乎很棘手，不过最后还是找到了一个办法，不借助光驱或者 U 盘等任何一种外部设备，通过网络将新的 CentOS 安装到这台机器上。
也许你会疑惑，网络安装不也需要一张 CD 或者 U 盘之类的启动介质吗？确实，通常的网络安装也需要在某种介质中写个启动引导器，使用它们启动来安装系统。
但是我的机器中原本安装了一个 Fedora 8，我们可以利用这个旧系统中的 GRUB，来启动网络安装的内核。下面是详细步骤：

首先，启动旧的操作系统，下载 CentOS 网络安装的 ISO 镜像并校验它的 MD5 值：

``` bash
wget http://mirrors.163.com/centos/5.7/isos/i386/CentOS-5.7-i386-netinstall.iso \
    http://mirrors.163.com/centos/5.7/isos/i386/md5sum.txt
diff <(grep "netinstall" md5sum.txt) <(md5sum CentOS-5.7-i386-netinstall.iso) && echo OK
```

然后我们把这个 ISO 镜像中唯一的目录，`isolinux` 目录，释放到 `/boot` 目录下。这里将 `isolinux` 放在 `boot` 目录下，只是为了后面的步骤方便。
因为旧系统的 GRUB 加载后，这里是默认的根目录。

``` bash
mkdir tmp
mount -o loop CentOS-5.7-i386-netinstall.iso tmp/
cp -Rv tmp/isolinux/ /boot/
```

再然后，重启操作系统。在 GRUB 菜单出现后按 `c` 进入 GRUB 命令行。敲下面的命令启动 `isolinux` 目录中的迷你系统。

``` text
kernel /isolinux/vmlinuz
initrd /isolinux/initrd.img
boot
```

如果 `isolinux` 被放在了其他的分区里，还需要使用 GRUB 的 `root` 命令来指定 `isolinux` 目录的位置。

这样网络安装镜像中的系统就可以正确的启动了，和我们使用光盘或者 U 盘的效果一样。
接下来只需在 'Installation Method' 这一屏上选择 HTTP 或者 FTP 方式，然后配置好网络，选择一个镜像站点的地址或者自己搭建一个本地 CentOS 服务器(会更快)，
就可以按照常规的步骤安装 CentOS 了。

(This post is also available in English: [link][english])

[english]:      /linux/2011/12/26/install-centos-via-network-without-cd-rom-and-without-usb/
