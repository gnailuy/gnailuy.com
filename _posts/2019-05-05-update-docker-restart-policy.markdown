---
layout: post
title: "Update docker restart policy"
date: 2019-05-05 00:14:54 +0800
categories: [ linux ]
---

网站好像挂了几天都没有发现，今天才看到，刚刚给恢复了。我的网站运行在几个 [Docker 容器][containers]里，
刚才查了一下[文档][document]，发现 Docker 是支持四种重启策略的：`no`, `on-failure`, `always` 和 `unless-stopped`。

<!-- more -->

`no` 就是不重启，挂了就挂了；
而 `always` 则是在任何情况下都重启 Docker 容器，包括 Docker 进程重启的情况(比如重启机器)；
`on-failure` 通过识别 Docker 内部进程的退出码决定是否重启，顾名思义，退出码 0 时候就不会重启了；
我使用的是 `unless-stopped` 这个策略，它比 `always` 更加温和一点，手动停掉 Docker 容器是可以的。

要想使用这些策略，可以在 `docker run` 命令行后面添加 `--restart <policy-name>` 参数。
不过我的几个容器已经运行起来了，在不停机的情况下，使用 `update` 命令可以更新 Docker 容器的配置。
因此，运行：

``` bash
docker update --restart <policy-name> container1 container2 ...
```

这样的命令即可。

---

#### 另一件事情

假期前我在 Windows 本地配置了 Vim，使用了 [spf13][spf13] 的配置，然后 Visual Studio 里的 VsVim 就挂了。

起初我发现 VsVim 挂了，没有想到是配置了本地 Vim 的原因，又因为有工作在忙活，忍了没有 Vim 的几天，然后就假期了。
今天来公司看了一下 VsVim 的日志，发现是读取 vimrc 文件时报的错。
于是我去看了看文档，发现 VsVim 默认是会读取家目录里面 vimrc 的，而我配置这个 vimrc 比较复杂，于是 VsVim 就挂了。

解决的办法也很简单，VsVim 的配置项里有读取配置文件的选项，可以选择读取 vsvimrc 和 vimrc 中任意一项，
或者两者都读取，或者干脆不读取任何配置文件。把 vimrc 从 VsVim 的配置文件中去掉就好了。

[containers]:  https://github.com/gnailuy/githook/blob/master/README.md
[document]:    https://docs.docker.com/config/containers/start-containers-automatically/
[spf13]:       https://github.com/gnailuy/spf13-vim-local

