---
layout: post
title: "用 Parity 作为 Ethereum 客户端"
date: 2018-01-11 18:36:10 +0800
categories: [ internet ]
---

最近几天看了很多关于 [Ethereum][ethereum] 的资料，学习了一下 DAPP 开发相关的知识。
感觉区块链还是很有意思的，我打算再深入学习学习，看看有什么有趣的应该可以参与开发开发。
要搞事情，第一步还是得把客户端搭建起来，我试了试官方 Ethereum Wallet 和 Parity，
感觉这个 [Parity][parity] 非常好用，值得推荐，所以今天先记叙一下客户端的事情。

<!-- more -->

最开始，我先是尝试了官方的 Ethereum Wallet。
这个客户端的界面非常简洁，打开之后跟随提示创建自己的第一个帐号即可。
选择使用 Main Network 之后，它就开始创建节点，自动同步现在的 [Homestead][homestead] 链。

然而这个同步就是个噩梦啊。
我的经历是大概同步了两天多，总共下载了 58G 的数据，这也就是当前(201801) Homestead 链的大小了。
而且不光数据量大、同步慢，官方客户端在同步到最后的时候经常出现卡住不动的情况，
如果不是同步时 CPU 风扇狂转，都不知道后台的 geth 是不是挂了呢。

这两天里 Wallet 一边同步，我也就一边看文档和资料。后来发现有人说 Parity 客户端不错，
于是今天抽空试了试。果然不错。

首先是安装，在 Mac 上安装很简单：

``` bash
brew tap paritytech/paritytech
brew install parity
```

默认安装的是当前 beta 版，如果想安装 stable 版，后面就加个 `--stable` 参数。

其实主要也就是安装了一个 parity 可执行文件，这种光杆软件我非常喜欢，特别好管理。
然后运行起来也很容易，就执行 parity 命令就行了。
Parity 也支持很丰富的参数，可以用 `--help` 参数查看；如果想订制 Parity 的运行情况，
可以用 `--config /path/to/conf.toml` 来指定一个配置文件去运行。
配置文件可以去[这里][PCG]生成一个，参数非常丰富。

Parity 跑起来之后就可以去 `http://localhost:8180` 访问它的 WebUI 了。
第一次访问的时候它会要求你新建一个帐号，
我之前用官方 Wallet 已经创建了一个帐号，所以我就想能不能直接导入。
我先是在 WebUI 上找了半天，也没找到跳过这一步帐号创建的选项，
后来 Google 了一下，发现 Github 上有 [ISSUE][issue] 提到这个。
最后有回复说这版 UI 就这样了，只会做关键修补，下一代新 UI 会更好。那就期待吧。

不过虽然 WebUI 上没有入口，别忘了 parity 命令本身也是很强大的。
我看了一下 help，用下面的命令直接把官方 Wallet 用 geth 生成的帐号导入了进来：

``` bash
parity account import --import-geth-keys ~/Library/Ethereum/keystore/UTC--XXX
```

然后再去 WebUI 上刷新，就跳过引导直接进去了。

要开发 DAPP，需要去 WebUI 后面的 Settings 里面，把 Contracts 选显卡打开。
我现在这方面还没有领悟太深，等学会了再继续写一写。

[ethereum]:     https://www.ethereum.org/
[parity]:       https://www.parity.io/
[homestead]:    http://www.ethdocs.org/en/latest/introduction/the-homestead-release.html
[PCG]:          https://paritytech.github.io/parity-config-generator/
[issue]:        https://github.com/paritytech/parity/issues/6367
