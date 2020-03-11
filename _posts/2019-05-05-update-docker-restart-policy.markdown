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


[containers]:  https://github.com/gnailuy/githook/blob/master/README.md
[document]:    https://docs.docker.com/config/containers/start-containers-automatically/

