--- 
layout: post
title: "Mac OS 中使用 launchd 自动启动 Shadowsocks"
date: 2015-05-18 22:34:26 +0800
categories: [ mac ]
---

[Shadowsocks][shadowsocks] 是一个人见人爱花见花开的加密 Sock5 代理，本朝翻越运动员都很喜欢它。
Shadowsocks 在 Mac 上有好几个好用的[客户端][clients]，其中 [shadowsocks-go][shadowsocks-go]
是一个命令行版客户端，最适合自动化。
这篇文章介绍如何使用 Mac 上的 [launchd][launchd] 自动启动 Shadowsocks 代理。

<!-- more -->

### Shadowsocks

shadowsocks-go 在 [Shadowsocks 官网][shadowsocks] 上的下载链接失效了(20150518)，
可以在它的 [Github 页面][shadowsocks-go]找到下载链接，或者直接 clone 项目进行编译。
这个客户端的使用非常简单，参数直观，我建议使用 `-c=configuration.json` 参数来启动，
其中 configuration.json 是配置文件，例如下面的配置：

``` json
{
    "server":"123.456.789.10",
    "server_port":8080,
    "local_address": "127.0.0.1",
    "local_port":7070,
    "password":"password",
    "timeout":300,
    "method":"aes-256-cfb",
    "fast_open":false
}
```

启动命令如下：

``` bash
/path/to/shadowsocks -c=configuration.json
```

默认情况下 Shadowsocks 在命令行启动后，会常驻前台，并没有 daemonize。
为了方便使用，我使用了 launchd 管理 Shadowsocks 服务，并且可以随系统自动启动。

### launchd

[launchd][launchd] 是一个开源项目，是 Mac OS 下常用的守护进程管理器。
launchd 使用一个 XML 文件定义一个守护进程，这个文件非常好写，
详细的参数配置可以参考 [launchd.info][launchd] 这个教程，这里先给出我的配置：

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>Label</key>
        <string>org.shadowsocks.dp</string>

        <key>WorkingDirectory</key>
        <string>/Users/gnailuy/bin/</string>

        <key>Program</key>
        <string>shadowsocks</string>

        <key>ProgramArguments</key>
        <array>
            <string>shadowsocks</string>
            <string>-c=configuration.json</string>
        </array>

        <key>StandardOutPath</key>
        <string>logs/shadowsocks.stdout</string>
        <key>StandardErrorPath</key>
        <string>logs/shadowsocks.stderr</string>

        <key>RunAtLoad</key>
        <true/>
    </dict>
</plist>
```

这个配置非常清晰，我将 shadowsocks 可执行文件放在了 `/Users/gnailuy/bin/` 目录下，
配置文件 configuration.json 也放在了同一目录下。
配置中的 `Program` 属性是冗余的，由于指定了这个属性，
`ProgramArguments` 的第一个属性值 `shadowsocks` 实质上变成了进程环境的 `argv[0]`。

将这个配置文件保存为 `~/Library/LaunchAgents/org.shadowsocks.dp.plist`，
然后使用下面命令加载：

``` bash
launchctl load ~/Library/LaunchAgents/org.shadowsocks.dp.plist
```

由于配置了 `RunAtLoad` 参数，所以加载后 Shadowsocks 就会运行。
可以在配置文件里指定的 `shadowsocks.stdout` 和 `shadowsocks.stderr` 里看到运行日志。

如果想要停止服务，只需要 'unload' 这个配置即可：

``` bash
launchctl unload ~/Library/LaunchAgents/org.shadowsocks.dp.plist
```

[shadowsocks]:      http://shadowsocks.org/en/index.html
[clients]:          http://shadowsocks.org/en/download/clients.html
[shadowsocks-go]:   https://github.com/shadowsocks/shadowsocks-go
[launchd]:          http://launchd.info/
