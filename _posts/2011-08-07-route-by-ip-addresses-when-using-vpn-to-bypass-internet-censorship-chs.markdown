---
layout: post
title: "设置路由表使国内 IP 不走 VPN 线路"
date: 2011-08-07 16:55:44 +0800
categories: [ linux ]
---

国内"科学上网"的方式多种多样，其中我认为 [SSH 隧道][ssh-tunnel]和 [VPN (Virtual Private Network)][vpn] 是两种最安全和最流行的方法了。
我自己就在一个美国 VPS 上配置了自己的 VPN 服务，我的[这篇文章][pptp-vpn]里有配置方法。

<!-- more -->

通常情况下，VPN 连接是全局的。也就是说一旦连接上 VPN，所有的网络流量都将通过 VPN 网络。
但是显然国内 IP 不会被防火墙封锁，因此我们希望上国内网站时不走 VPN，这样速度上也会有很大的优势。

网友的力量是无穷的，开源项目 [Chnroutes][chnroutes] 就是一个通过设置路由来达到上述目的的解决方案。
这个项目提供了一个 Python 脚本，运行这个脚本时，它会利用 [APNIC][apnic] 提供的 [`country-ipv4.lst`][ipv4-list] 文件，自动找到国内 IP 列表，并使用这个列表生成两个 Bash 脚本。
这两个 Bash 脚本就可以用于在 VPN 连接前和断开后设置内核路由表，来区分国内 IP 和国外 IP 走不同线路。

这里以我使用的 PPTP VPN 为例。首先，下载 Python 脚本 [`chnroutes_ovpn_linux`][ovpn-script] 到 Linux 客户机。给这个脚本增加执行权限并运行：

``` bash
chmod +x chnroutes_ovpn_linux
./chnroutes_ovpn_linux
```

运行完毕将会在当前目录生成两个脚本，`vpnup` 和 `vpndown`。为它们也加上执行权限：

``` bash
chmod +x vpnup vpndown
```

拷贝这两个文件到 ppp 配置目录的合适位置，并命上合适的名字：

``` bash
cp vpnup /etc/ppp/ip-pre-up
cp vpndown /etc/ppp/ip-down.local
```

然后，断开并重连 VPN，这时你和国内 IP 的网络通讯就会不再走 VPN 线路，而是直连到服务器了。可以使用 `route` 命令查看一下内核路由表，条目非常多。

Chnroutes 这个项目支持 OpenVPN 和 PPTP，并且在 Mac、Linux 和 Windows 均可部署。我只在 Fedora 14 上使用它，目前为止并没有发现什么问题。

(This post is also available in English: [Link][english])

[ssh-tunnel]:           http://en.wikipedia.org/wiki/Tunneling_protocol#Secure_Shell_tunneling
[vpn]:                  http://en.wikipedia.org/wiki/Virtual_private_network
[pptp-vpn]:             /linux/2011/07/04/pptp-vpn/
[chnroutes]:            http://code.google.com/p/chnroutes/
[apnic]:                http://www.apnic.net/
[ipv4-list]:            http://ftp.apnic.net/apnic/dbase/data/country-ipv4.lst
[ovpn-script]:          http://code.google.com/p/chnroutes/downloads/detail?name=chnroutes_ovpn_linux
[english]:              /linux/2011/08/08/route-by-ip-addresses-when-using-vpn-to-bypass-internet-censorship/
