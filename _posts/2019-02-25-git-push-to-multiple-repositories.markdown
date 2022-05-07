---
layout: post
title: "Git 推送到多个仓库"
date: 2019-02-25 20:06:10 +0800
categories: [ linux ]
---

Github 现在支持无限私有仓库了，所以我把之前保存在 Bitbucket 上的一些仓库转移到了这里来。
不过原来 Bitbucket 上的仓库也没有删掉，我是想可以做一个备份仓库来用。

刚开始我是想这样做：
把仓库转移到 Github 上，origin 的 fetch 的 push 都设置为 Github 仓库；
然后 Bitbucket 作为另一个 remote，每次更新了 origin 之后再 push 到这里来。

不过后来我看到 Git 的 remote 是可以设置多个 URL 的，于是就改成了下面这个做法。

<!-- more -->

使用 `git remote` 命令的 `set-url` 子命令，`--add` 参数就可以为一个 remote 额外添加 URL。
所以把 Github 作为 remote，设置好仓库之后，使用下面的命令就可以直接添加一个额外的仓库地址，作为额外 push 的目标来用：

``` bash
git remote set-url --add --push origin https://bitbucket.org/user/project.git
```

添加了这个 URL 之后，Git 默认的 Pull/Fetch 操作仍然是从 origin 里配置的 Github 地址进行，
而 Push 操作则可以只需要执行一个 `git push` 命令，一次性把仓库推送到 Github 和 Bitbucket 两个仓库去。
这种配置就比较适合我这种添加备份仓库的场景了。

这个小技巧可以从 Git 文档的[这里][seturl]找到说明。

[seturl]:    https://git-scm.com/docs/git-remote#git-remote-emset-urlem
