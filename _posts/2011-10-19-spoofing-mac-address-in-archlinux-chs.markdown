---
layout: post
title: "Archlinux 中伪装 MAC 地址"
date: 2011-10-19 07:51:22
categories: [ linux ]
---

装好 Archlinux 以后，我遇到的第一个麻烦就是如何修改 MAC 地址来接入校园网。
之前我写过一篇短文，里面介绍 Linux 下如何修改 MAC 地址(在[这里][linux-mac])。
那篇文章介绍了如何使用 [ifconfig][ifconfig] 程序临时修改 MAC 地址，以及在 Red Hat/CentOS/Fedora 或 Debian/ubuntu 中如何修改网络配置文件来修改 MAC 地址。
但是我发现我新装的 Archlinux 没有 ifconfig 程序(我安装系统时选择的包很少)。所以我得找个其他的方法，幸好，Arch 有自己的 Arch Way。

<!-- more -->

(This post is also available in English: [link][english])

在 [Arch Wiki][archwiki] 中提到了两种临时改变 MAC 地址的方法，使用 [`macchanger`][macchanger] 或者使用 [`ip`][ip] 命令：

``` bash
macchanger --mac=XX:XX:XX:XX:XX:XX
```

或者

``` bash
ip link set dev eth0 down
ip link set dev eth0 address XX:XX:XX:XX:XX:XX
ip link set dev eth0 up
```

其中 `eth0` 是有线网卡的设备名字。我新装的系统里还没有 `macchanger`，所以我使用了第二种方法(以后应该熟悉一下 `ip` 这个程序了，它是用来代替陈旧的 `ifconfig` 程序的)。
连上互联网以后，你可能会对 `macchanger` 这个工具比较有兴趣，它甚至可以为你的设备增加一个随机的 MAC 地址，非常有趣。

使用上述两个方法修改 MAC 地址都是临时的，重启之后修改就会失效。Arch Wiki 给出了一种非常符合 Arch Way 的方法，可以在启动时就修改 MAC 地址。
只需要创建文件 `/etc/rc.d/functions.d/macspoof`，文件内容如下：

``` bash
spoof_mac() {
    ip link set dev eth0 address XX:XX:XX:XX:XX:XX
}
add_hook sysinit_end spoof_mac
```

这个文件在系统初始化过程最后增加了一个钩子函数，这个函数调用 `ip` 这个程序修改 MAC 地址，从而在每次启动时都使用修改的 MAC 地址。

[linux-mac]:        /linux/2011/07/16/how-to-change-mac-address-in-linux/
[ifconfig]:         http://en.wikipedia.org/wiki/Ifconfig
[english]:          /linux/2011/10/19/spoofing-mac-address-in-archlinux/
[archwiki]:         https://wiki.archlinux.org/index.php/MAC_Address_Spoofing
[macchanger]:       http://www.alobbs.com/macchanger
[ip]:               http://linux.die.net/man/8/ip
