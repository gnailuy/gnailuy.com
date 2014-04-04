--- 
layout: post
title: "配置 iptables 后 FTP 停在 Entering Passive Mode 的问题"
date: 2011-07-03 16:54:20
categories: [ linux ]
---
今天配置完 iptables 规则后，发现 FTP 无法使用了。
通过 ftp 命令行的测试，发现可以发起连接并登录，然后客户端就会停滞在下面的提示上，直到超时：

<!-- more -->

    227 Entering Passive Mode

我们知道，FTP 使用 21 端口作为控制端口，但是 FTP 数据的传输则有两种模式，
一种是主动模式 (Active Mode)，一种是被动模式 (Passive Mode)。
这里的主动被动是相对于服务器而言的：<br>

> 在主动模式下，FTP 客户端首先向服务器 21 端口发起连接请求，然后由服务器主动通过 20 端口连接到客户；

> 在被动模式下，FTP 客户端先向服务器 21 端口发起连接请求，然后再向服务器 1024 以后的一个随机端口发起连接请求，这个模式下服务器总是被动的。

我配置的 iptables 规则，INPUT 链只放行了几个熟知端口，其中包括 FTP 的控制端口 21，
其他端口的输入默认全部都是 DROP，也没有放行主动模式下的数据端口 20，
只打算支持被动模式。
要解决上面无法进入被动模式的问题，可以通过在服务器端加载 ip_conntrack_ftp 这个内核模块来完成：

    modprobe ip_conntrack_ftp

加载上这个模块以后，断开 FTP 客户端重新连接即可正常登录 FTP 了。
最后，可以通过在 iptables 的配置文件中进行一下配置，使得 iptables 启动后可以自动加载这个模块：

    vi /etc/sysconfig/iptables-config

找到 IPTABLES_MODULES 这一行，后面加上 ip_conntrack_ftp 这个模块：

    IPTABLES_MODULES="ip_conntrack_ftp"
