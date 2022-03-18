---
layout: post
title: "A clash script on Ubuntu Gnome"
date: 2022-03-19 02:12:01 +0800
categories: [ linux ]
---

又是一些在翻墙上面花的时间，一些被浪费掉的生命。写一下记下来，下次就少浪费一些。

<!-- more -->

我在一台新的 Ubuntu 上面下载了 [Clash][clash]，配置了我平时用的代理。
Clash 启动之后，就需要在各处设置代理，才能正常使用。

第一方面是设置 Gnome 的代理。
Gnome 代理设置之后，大多数的桌面应用，包括 Chrome，都会继承使用这里的代理。

从 GUI 上面，可以在 Settings 里面的 Network Tab 中找到代理设置。
要使用 Clash，设置 HTTP 和 SOCK 代理即可。

<center>
{% image fullWidth gnome_settings.png alt="Gnome Proxy Settings" %}
</center>

不过每次去 GUI 里面修改设置比较麻烦，可以用 `gsettings` 命令行来搞定。
我包装了一个脚本，如下：

``` bash
#!/bin/bash

CLASH_BIN="/home/yuliang/bin/clash-linux-amd64-v1.9.0"

# Enable Gnome proxy, to use this proxy in shell, manually run `pon`
gsettings set org.gnome.system.proxy.http host '127.0.0.1'
gsettings set org.gnome.system.proxy.http port 7890
gsettings set org.gnome.system.proxy.socks host '127.0.0.1'
gsettings set org.gnome.system.proxy.socks port 7891
gsettings set org.gnome.system.proxy mode 'manual'

${CLASH_BIN}

# Clear proxy settings
gsettings set org.gnome.system.proxy mode 'none'
```

它很直接，启动 Clash 之前先设置好代理，并且在 `Ctrl+C` 结束掉 Clash 进程之后，它还会清理掉代理设置。

除此之外，我还添加了两个 Alias，用于在命令行终端设置代理。
命令行程序可能不识别 Gnome 的代理设置，但一般会识别这两个环境变量。

``` bash
alias pon='export http_proxy=http://127.0.0.1:7890;export https_proxy=$http_proxy'
alias poff='unset http_proxy;unset https_proxy'
```

如果其他一些 APP 还是不识别这些代理的设置，那可能就要 Per-App 地去进行设置了。
遇到了再说。


[clash]:	https://github.com/Dreamacro/clash

