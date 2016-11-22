--- 
layout: post
title: "Docker 开发环境"
date: 2016-11-22 16:25:29
categories: [ linux ]
---

Docker 开发环境就建在 Docker 容器里，比较容易搭建。
本地搞一个 Docker 开发环境比较方便代码阅读、修改和调试，
尽管[官方文档][docker-dev] 中的指引已经很详细，我还是记一个符合国情的流水账。

要理解下面文章写的内容，需要熟悉 Docker，并熟悉 Docker 开发环境构建的[官方文档][docker-dev]。

<!-- more -->

### 克隆代码，并保持更新

这个很容易，首先在 Github 上 Fork 一份源代码到自己的仓库里，Fork 完成后克隆到本地，
以我的 Github 用户名 gnailuy 为例：

``` bash
mkdir -p $GOPATH/src/github.com/gnailuy/
cd $GOPATH/src/github.com/gnailuy/
git clone https://github.com/gnailuy/docker.git
```

Docker 的开发很活跃，所以要时不时的将自己的仓库和官方的同步：

``` bash
cd $GOPATH/src/github.com/gnailuy/docker/
git remote add upstream https://github.com/docker/docker.git
git fetch upstream
git checkout master
git merge upstream/master
git push origin master
```

这样保持自己 Fork 出来的仓库以及本地仓库和官方仓库都是同步的。

### Docker 开发环境

如官方文档所述，Docker 提供了一个 Docker 容器里的开发环境，
按说应该是再也不用为搭建环境发愁了，然而我们有墙没有枪。
为了加速把开发环境容器跑起来，需要把墙先翻了。
因为 Docker 跑在容器里，而我用 Mac 还得先在 Virtual Box 里跑 Linux，
所以最好是有一个全局 VPN，如果路由器这里就能翻墙最好了。
但是如果条件有限，或者像我这样用某态这种非全局翻墙服务的，至少可以做下面这几个事情，
来加速环境搭建。

#### 用国内 apt 源：

Docker 开发环境通过 `make shell` 来启动，可以查看代码根目录下这个 Makefile，
在 build 这个 Target 下，`docker build` 命令有个参数叫做 `DOCKER_APT_MIRROR`。
往上看 Makefile 开头部分 `DOCKER_APT_MIRROR` 的处理，发现它检测一个环境变量，
叫做 `DOCKER_BUILD_APT_MIRROR`，并用 `--build-arg APT_MIRROR=` 传给 `docker build`。

看根目录下的 Dockerfile 模板，可以看到开头就有一个 ARG 定义了`APT_MIRROR`，
因此解决方案就很容易了，make shell 改成：

``` bash
export DOCKER_BUILD_APT_MIRROR=mirrors.163.com && make shell
```

就可以使用良心厂网易的源了。

#### Github 代码用 proxychains 下载

Dockerfile 里可以看到，有不少地方现场下载 Github 上的代码来用，特别是 osxcross 这个库特别大。
虽然墙几度屏蔽 Github 都因为受到了大力反弹而作罢，但党国为了给程序员们添堵，
还是人为降低了 Github 的访问速度，因此这个校长还是得问候。

命令行工具翻墙有一个神器叫做 proxychains，
可以自行 Google 或者查看[官方介绍][proxychains]，下面我写一下怎么用。

1. 首先，需要写一个 proxychains.conf，按照里面的例子把自己的代理配置进去。
我这里，某态很贴心的提供了带用户名和密码的代理（我很喜欢这个服务）。

2. 然后，可以修改 Dockerfile，在开头的 apt-get 列表里加上 proxychains，
再用 COPY 命令把 proxychains.conf 添加到 /etc/ 目录里，就可以了。

3. 最后，所有 git clone 前面都加上 proxychains 命令就可以了，同理 curl 命令前面也加上它。

#### PIP 配置豆瓣源

此外，Dockerfile 里还有几处用 pip 下载了几个包，比如 awscli，用国外源比较耗时。
国内可以改用[豆瓣的源][pypi-douban]来加速，本地配置起来很容易，
只需要创建一个如下内容的文件叫做 `pip.conf`，放在 `~/.pip/` 目录就可以了。

``` ini
[global]
index-url = https://pypi.douban.com/simple
```

在我们的容器里，默认的用户是 root，家目录是 /root/，
因此 `~/.pip/` 需要改成 `/root/.pip/`：

```
COPY pip.conf /root/.pip/pip.conf
```

基本上上面几个加速选项配置完成之后，make shell 就会比较快了，感谢党和校长的照顾。

### 国情版 Dockerfile 模板

说个题外话，如上的几项配置加在一起，可以攒出来下面一个 Dockerfile 模板，
以后如果别的业务需要创建容器，可以直接从这个模板开始，多少免去些翻墙的痛苦：

首先，把 `DOCKER_BUILD_APT_MIRROR` 变量配置好，最好是放在自己的 `~/.bashrc` 或者
`~/.zshrc` 里。
然后把 proxychains.conf 和 pip.conf 文件准备好，我这里放在了 ./gfw 目录下。

接下来，可以利用下面的 Dockerfile 模板开始创建自己的容器，
也可以直接把下面容器做成镜像，其他容器 FROM 这个镜像来制作。
Dockerfile 里，所有需要从网络下载的命令前面都可以加上 proxychains 来加速。

``` Dockerfile
FROM debian:jessie

# Allow replacing httpredir or deb mirror
ARG APT_MIRROR=deb.debian.org
RUN sed -ri "s/(httpredir|deb).debian.org/$APT_MIRROR/g" /etc/apt/sources.list

RUN apt-get update && apt-get install -y proxychains pip

# Add proxychains configuration
COPY gfw/proxychains.conf /etc/proxychains.conf

# Add pip source
COPY gfw/pip.conf /root/.pip/pip.conf

ENTRYPOINT ["/bin/bash"]
```

最后构建容器时，用下面命令：

``` bash
docker build --build-arg APT_MIRROR=$DOCKER_BUILD_APT_MIRROR -t organization/image-name .
```

构建容器镜像。

### 阅读 Docker 代码：vimgo

工具没什么好说的，vimgo 可能是 Golang 开发现在最好的 'IDE' 了吧，
不知道啥时候 JetBrains 会搞一个 Golang 的 IDE，嘿嘿 =￣ω￣=

我现在读的代码还不太成体系，以后如果有心得的话再单独写吧。
这篇文章主要是解决了一个在别国不存在的问题，感谢那谁谁谁全家，并给病魔加油。

[docker-dev]:   https://docs.docker.com/opensource/project/set-up-dev-env/
[proxychains]:  http://proxychains.sourceforge.net/
[pypi-douban]:  http://pypi.doubanio.com/

