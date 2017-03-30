--- 
layout: post
title: "Portable Installation of TexLive"
date: 2015-02-08 01:35:07 +0800
latex: true
categories: [ linux ]
---

这几天准备用 LaTeX 写点东西，于是把 [TexLive][texlive] 安装到了
Virtual Box 上的一台 Archlinux 虚拟机上去。

<!-- more -->

先要吐个槽，天国的网络越来越妈蛋的没法用了，TexLive 正常下载无论如何速度上不去。
于是我只好请迅雷资深会员及迅雷小王子 @Gene 同学帮忙下载了最新的
[TexLive ISO Image][texliveDVD]，
并回报以三部好片，@Gene 同学表示看到片很高兴。

开始安装的时候，发现虚拟机的磁盘不够用了。
我想干脆把 TexLive 单独安装到一块磁盘上好了，于是创建了一块新的 vdi，
挂载到了 `/opt/` 目录上去。

安装 TexLive 时，我按 `V` 选择了 Portable 模式，安装路径改成了 `/opt/texlive/`。
于是安装完成后，我还需要把 bin, man 等资源加到系统搜索路径中去。
这里，可以直接在 `PATH` 变量中加入路径 `/opt/texlive/bin/x86_64-linux/`，
也可以像老的 TexLive 里那样为各个文件创建软链接。

新的 TexLive 安装时我没有看到创建软链接的选项，
但 TexLive 提供了一个叫 `tlmgr` 的工具，可以把一个 TexLive 安装
"链接"到系统目录里，默认是链接到 `/usr/local/{bin/share/man}` 等目录：

``` bash
sudo /opt/texlive/bin/x86_64-linux/tlmgr path add
```

这样，$\LaTeX$ 等各种命令、资源和手册就可以用了。

其实对于这台虚拟机来说，我新建一块磁盘做一个 Portable 的安装是没有必要的，
可以直接把 ISO 挂载到虚拟机上，用 `tlmgr` 创建软链接就可以了。
不过既然虚拟机磁盘不够了，而且 DVD 文件放在宿主 Mac 上也太大，
所以这么安装也是科学的。

Portable 的 TexLive 可以安装到 U 盘或者移动硬盘等设备上，使用时候像上面那样创建
软链接就可以了。如果用完不想保留软链接了，`tlmgr` 还提供了删除命令：

``` bash
sudo /path/to/texlive/bin/x86_64-linux/tlmgr path remove
```

[texlive]:      https://www.tug.org/texlive/
[texliveDVD]:   https://www.tug.org/texlive/acquire-iso.html
