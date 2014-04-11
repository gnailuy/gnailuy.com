--- 
layout: post
title: "Linux 下建立 SSH 隧道做 Socket 代理"
date: 2011-08-02 13:37:42
categories: [ linux ]
---

本文介绍如何使用 SSH 创建 Socket 代理，为本地局域网提供应用程序级别的代理服务，并提供一个自动化的脚本，一条命令完成工作。

<!-- more -->

### 介绍

[SSH (Secure Shell)][ssh] 是一个网络协议，它允许在网络上的两个设备之间使用加密隧道进行通信。
这个协议一般用于为 UNIX-like 的操作系统提供一个加密的远程 Shell，是一个非常有用的远程管理的工具。目前主流 Linux 发行版中预装的 SSH 程序都是 [OpenSSH][openssh]，
MAC 中也有 OpenSSH，本文中描述的内容在 MAC 系统中应该也可以用，但我没有 MAC 机器，没有试过。

SSH 程序包含客户端与服务器端两部分。服务器端程序的名字一般是 `sshd`，它启动后在 TCP 端口 22 上监听客户端的请求，许多 Linux 发行版都会默认安装且默认启动 `sshd`。
客户端程序一般是 `ssh`，它负责连接到服务器端的 SSH 服务，但它的功能远非如此简单，譬如本文介绍的 Socket 代理就是其强大功能之一。

使用 SSH 程序不仅可以与远程服务器建立加密连接进行通信，同时还可以在本地 Linux 主机上创建一个 Socket 代理服务。本地的应用程序使用这个代理，
就可以通过远程服务器间接访问互联网了。例如使用代理访问网页，浏览器首先将 Web 请求从 Socket 级别上加密，通过加密的隧道发送给远程服务器，然后再由远程服务器代理完成 Web 请求，
并将数据通过加密隧道送回来。如果远程服务器在长城之外，由于你与远程服务器的通信是加密的，还可以规避长城的拦截。

最后，本地 Linux 主机上的防火墙放行相应端口之后，这个代理服务可以被局域网上的所有机器使用，这样就可以在一个局域网里使用一台 Linux 机器作为代理服务器，为大家提供代理服务了。

原理说起来这么多，其实使用起来特别简单。`ssh` 命令的 `-D [bind_address:]port` 参数，可以在 `bind_address` 的 `port` 端口提供代理服务；
`-g` 参数则允许其他主机连接到 `-D` 在本地创建的代理服务上来。推荐使用 7070 这个端口来提供 SSH 代理，
Firefox 的 Autoproxy 插件中，'ssh -D' 这个代理默认设置的就是这个端口，比较方便。这样命令也就出来了：

``` bash
ssh -D 7070 -g username@your.hostname.com
```

使用你的用户名和域名/IP 地址登录，然后按照提示输入密码，(或者使用 public key 免密码登录，就不需要下一节的内容了)，就可以使用 SSH 创建的代理服务了。

### 自动化脚本

为了不每次都执行这么长的命令，也为了不每次都要输入密码，可以使用下面的自动化脚本来完成自动登录的工作：

``` bash
#!/usr/bin/expect
set timeout 60
spawn /usr/bin/ssh -D 7070 -g username@your.hostname.com
expect {
    "*yes/no*" { send "yes\r"; exp_continue }
    "*password:" { send "your_password\r" }
}
interact { timeout 60 { send " "} }
```

上述脚本依赖 `expect` 程序的支持，如果没有安装，软件源里就有，使用 `yum` 或 `apt-get` 安装上就行了：

可以将这个脚本保存到 PATH 中的某个目录下，例如我将它保存为 `/usr/local/bin/sshproxy`，然后加上执行权限：

``` bash
chmod +x /usr/local/bin/sshproxy
```

由于使用的端口号大于 1024，无需动用 root，使用普通用户运行命令 sshproxy 即可。

### 应用程序设置

要使用上面创建的代理，需要应用程序可以使用 Socket 代理。我知道大家一般都是用浏览器设置代理上上网爬爬墙，所以就推荐下面两个浏览器 + 插件的组合好了：

* Firefox + Autoproxy
* Chrome + Switchy

它们都非常好用。我一直使用的是 Firefox，对 Autoproxy 比较熟悉，这个插件可以自动识别预先定义好的规则，某些网站使用代理访问，另一些则不使用代理。
它提供的默认规则集就是爬长城用的，十分方便。要使用上面建立的 SSH 代理，只需在 Autoproxy 的代理选择中选择 'ssh -D' 就可以了，
局域网中的其他机器只需将 IP 改为提供 SSH 代理的 Linux 主机即可。Switchy 则是 Chrome 上对应功能的插件，它可以使用 Autoproxy 已经做的非常好的规则，提供智能爬长城的功能。

另外，如果想让普通命令行程序使用这个 Socket 代理，可以考虑使用 `proxychains` 这个命令，配置简单并且很好用。

[ssh]:      http://en.wikipedia.org/wiki/Secure_Shell
[openssh]:  http://www.openssh.com/
