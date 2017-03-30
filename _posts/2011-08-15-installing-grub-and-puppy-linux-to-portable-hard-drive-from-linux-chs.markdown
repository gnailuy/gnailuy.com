--- 
layout: post
title: "Linux 下为移动硬盘安装 Puppy Linux 和 GRUB 引导"
date: 2011-08-15 17:41:38 +0800
categories: [ linux ]
---

本文我们讨论如何在 Linux 下为移动硬盘安装 [Puppy Linux][puppylinux]，并使用 [GNU GRUB][grub] 作为 Puppy Linux 的 [Boot Loader][bootloader]。

<!-- more -->

(This post is also available in English: [link][english])

## 简介

Puppy Linux 是一个轻量级、功能强大并且易于使用的 [Linux 发行版][linux-dist]。这个系统的一大特色就是，它可以完全运行于[内存][ramdisk]当中。
因此 Puppy 的运行速度特别快，应用程序可以瞬间启动，并且可以即时响应用户的输入。Puppy 可以从内置硬盘、移动硬盘、U 盘、光盘和 SD 卡等许多设备上启动。
在移动硬盘上安装 Puppy，可以将它作为一个随身携带的 Linux，你可以在任何支持从 USB 设备启动的计算机上启动 Puppy Linux，随时随地保留自己的使用习惯，而且可以当作急救系统使用。

本文中我们介绍如何在 Linux 下把 Puppy Linux 安装到 USB 移动硬盘，所有操作均在 Linux 下进行。实际上，Puppy 运行并不需要硬盘，这里移动硬盘只是作为 Puppy 和我们个人数据的容器，
一旦系统启动，Puppy 就将完全运行在内存中。
安装过程非常简单，基本上只需要三步：1) 下载最新的 ISO 镜像；2) 将下载到的镜像挂载到本机文件系统中；3) 将 Puppy 文件复制到移动硬盘里。

复制好文件以后，我们还需要在移动硬盘上安装一个启动引导器 (Boot Loader)，使移动硬盘可以引导启动。本文中使用著名的 GNU GRUB 程序。
GRUB 是来自 [GNU Project][gnu-proj] 的一个强大而灵活的多重启动引导器。绝大多数现代的 Linux 发行版都使用它作为默认启动引导器。
本文中我们会把 GRUB 安装到移动硬盘中，并且配置它可以启动 Puppy。下面我们一步一步进行详细说明。

## 安装 Puppy

在[这里][puppy-down]下载最新的 Puppy 系统。到目前为止，最新的镜像文件是 `lupu-525.iso`。
挂载这个镜像到文件系统中去，例如挂载到我家目录下的 `puppy-tmp` 中：

``` bash
mount -o loop lupu-525.iso /home/yuliang/puppy-tmp/
```

注意，本文中所有操作都需要有 root 权限来执行。

接下来，将 ISO 镜像中的文件拷贝到移动硬盘中：

``` bash
cp -r /home/yuliang/puppy-tmp /media/diskone/lupu-525
```

上面命令中，你的移动硬盘中分区的卷标可能与我的不同。我的移动硬盘上分了四个主分区，分别命名为 diskone、disktwo、FAT32 和 NTFS。
前两个分区上的文件系统是 `ext3`，后两个和它的卷标一致。上面的命令把 Puppy 放在了分区 diskone 中，当然你可以把目录名 `lupu-525` 修改成你喜欢的其他名字。

另外，由于 GRUB 非常强大，也可以把 Puppy 放在逻辑分区中，还可以使用 `ext3` 之外的许多其它分区格式，譬如 FAT32 格式等。

## GRUB 的安装和配置

下面的步骤要把 GRUB 安装在移动硬盘上，以便在任意机器上启动 Puppy。GRUB 启动过程可以分为两个主要阶段：stage 1 和 stage 2。
stage 1 存储在磁盘的[主引导记录 (MBR)][mbr] 中，它的任务就是负责加载它后面的阶段。
在加载 stage 2 之前，stage 1 可能还需要加载特定的 stage 1.5 文件，来提供访问文件系统需要的驱动。
然后 stage 2 将被加载，它会寻找默认的配置文件和一些必须的模块。关于 GRUB 启动的更详细描述，可以参考 Wikipedia 上关于[启动过程][boot-process]的条目。

这里假设我们的移动硬盘是系统中的第二块硬盘，也就是 Linux 下的 `sdb`。
在 GRUB 中，则有另一种命名方式，这块硬盘叫做 `(hd1)` (第一块硬盘叫做 `(hd0)`)。`(hd1)` 上的第一个分区叫做 `(hd1,0)`，第二个分区叫做 `(hd1,1)`，依次类推。
因此上文中我们是将存放 Puppy 文件的目录 `lupu-525` 储存在了 `(hd1,0)` 中。下面我们把 GRUB 的 stage 文件和配置文件等放在分区 `(hd1,0)` 中。

### 安装 GRUB

可以通过两种方式为移动硬盘安装 GRUB：1) 使用 `grub-install `脚本；2) 使用 GRUB 交互式界面。下面分别介绍。

#### 1. 使用 `grub-install` 脚本

要将 GRUB 安装到 `(hd1,0)` (也就是我移动硬盘上的 diskone)，可以运行下面命令：

``` bash
grub-install --boot-directory=/media/diskone/ /dev/sdb
```

这样会将 GRUB 的 stage 文件安装到目录 `/media/diskone/boot/grub` 中，GRUB 的配置文件也在这个目录下。

#### 2. 使用 GRUB 交互式界面

GRUB 提供了一个类似 Bash 的命令行接口。在系统启动，进入到 GRUB 的图形选择界面后，按下 c 键，就可以进入 GRUB 的命令行接口。
不过这里我们将要使用的不是启动界面上的，而是 Linux 启动后通过 Bash 启动的 GRUB 命令行接口。

安装之前，我们先复制现有 Linux 的 GRUB 文件到移动硬盘中，因为这些文件不会像上面使用 `grub-install` 脚本那样自动生成：

``` bash
cp -r /boot/grub /media/diskone/
```

然后，还需要把 stage 1 安装到移动硬盘的 MBR 中去。在 Linux 命令行键入命令 `grub`，可以进入到 GRUB 命令行接口，在其中键入下面命令：

``` text
grub> root (hd1,0)
grub> setup (hd1)
grub> quit
```

这样会把 GRUB 文件安装到目录 `/media/diskone/grub` 中去，当然配置文件也在其中。

### 配置 GRUB

在 openSUSE 和 Debian/ubuntu 等系统中，GRUB 的配置文件默认是 `grub` 目录中的 `menu.lst` 文件。但是在 Gentoo 和 Redhat/CentOS/Fedora 等系统中，默认配置文件则是 `grub.conf`。

这也就意味着，如果在 Fedora 下安装 GRUB，但没有 `grub.conf` 这个文件，GRUB 就会找不到默认配置文件，从而直接进入开机时的命令行接口。
我就遇到了这个问题，最早我在 Debian 下安装的 GRUB，配置文件只有 `menu.lst`，后来我在 Fedora 下重新安装了 stage 1，重新启动时，就因为没有 grub.conf 而直接进入命令行。
实践上，可以把两个配置文件都放在 GRUB 目录下，其中一个可以是另一个的[符号链接][s-link]。

下面提供一个用来启动 Puppy 的样例配置文件。你可以直接使用这个文件，也可以把其中操作系统有关的行复制到你的配置文件中去。

{% highlight text linenos %}
### Simple Configuration File to Boot Puppy
### DEFAULT OPTIONS
default		0
timeout		3
### KERNELS LIST
title Puppy Linux 525
kernel /lupu-525/vmlinuz ramdisk_size=256000 pmedia=usbflash psubdir=lupu-525
initrd /lupu-525/initrd.gz
{% endhighlight %}

使用本文的安装结构，还可以安装多个 Puppy 到移动硬盘中，例如一个英文版，一个中文版。只需要将 Puppy 文件放在不同的目录中，然后按照其放置位置添加 GRUB 配置文件中的条目即可。

[puppylinux]:           http://puppylinux.org/
[grub]:                 http://www.gnu.org/software/grub/
[bootloader]:           http://en.wikipedia.org/wiki/Booting#Boot_loader
[linux-dist]:           http://en.wikipedia.org/wiki/Linux_distribution
[ramdisk]:              http://en.wikipedia.org/wiki/Ramdisk
[gnu-proj]:             http://www.gnu.org/
[puppy-down]:           http://puppylinux.org/main/Download%20Latest%20Release.htm
[mbr]:                  http://en.wikipedia.org/wiki/Master_boot_record
[boot-process]:         http://en.wikipedia.org/wiki/GNU_GRUB#Boot_process
[s-link]:               http://en.wikipedia.org/wiki/Symbolic_link
[english]:              /linux/2011/08/16/installing-grub-and-puppy-linux-to-portable-hard-drive-from-linux/
