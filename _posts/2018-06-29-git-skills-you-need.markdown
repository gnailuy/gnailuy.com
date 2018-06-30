---
layout: post
title: "程序员 Git 技能进阶"
date: 2018-06-29 17:16:10 +0800
categories: [ linux ]
---

最近为一个 Git 课程写了一套将近七万字的教案，正在由我们的设计师同学制作视频课程。
尽管是做一套初等水平的课程，但是本着"取乎其上，得乎其中"的精神，我通读了一些 Git 的书系统学习。
因此，写完这套教案稿子，我自己也对 Git 的方方面面有了更深入的理解。

作为一个程序员，我使用 Git 已经有很多年了，自认为水平也不差，能够解决日常开发中各种各样的问题。
然而写完这个课程我才意识到，如果不是这次写课的契机，可能我还会长期保持掌握点 Git 皮毛的状态了。

如果你和我一样长期使用 Git，但还没有去深入了解过它，这里我列出几个技能进阶的方向，可以找资料学习一下。

<!-- more -->

## 基本架构

作为一个版本控制系统，Git 以 Commit 为单位来组织。
我们的每一个 Commit 都代表了项目历史上的一个状态，Commit 连在一起就组成了项目的演化历史。
就像命令：

``` bash
git log --graph
```

展示的这样。

Git 里面除了第一个 Commit 之外，其他 Commit 都有父 Commit。
普通的 Commit 有一个父 Commit，Merge Commit 则有两个父 Commit。

一个 Commit 除了代表项目的一个历史状态，也代表和它父 Commit 相比，它做出了哪些修改。
当你用命令：

``` bash
git show <commit-hash>
```

查看一个 Commit 的时候，下面输出的 Diff 信息就是它和父 Commit 相比，发生的修改。

## 存储对象

Commit 在 Git 内部保存为 `commit` 类型的对象，例如我这个博客项目现在最新的 Commit `e58d655`，
用 `cat-file` 可以查看这个对象里面的信息：

``` bash
git cat-file -p e58d655
```

输出是这样的：

``` text
tree 7cffe3f846e1aaf37e92f4ae79e1665a916f490f
parent 7325ed312aee71cab2c77f82232f1faf64c3e766
author Yuliang Jin <我的邮箱> 1530267107 +0800
committer Yuliang Jin <我的邮箱> 1530267107 +0800

add url to github
```

这里面，`parent` 就是这个 Commit 的父 Commit。
也就是说，Git 就跟单链表一样，Commit 对象里面保存了父 Commit 的指针，
只是这里我们允许某些 Commit 对象里面有两个父 Commit 指针。

其他的作者、提交者、邮箱，还有 Commit Message，都很好理解。
在 Git 里，一个 Commit 作者和提交者可以是不一样的，例如你通过邮件给项目维护者提交了 Patch，
项目维护者就可以用你的 Patch 提交一个 Commit，作者是你，提交者是他自己。

最上面的这个 `tree` 类型的对象 `7cffe3f`，就是当前这个 Commit 代表的目录树结构了。
我们看它的内容：

``` bash
git cat-file -p 7cffe3f
```

输出是这样的：

``` text
100644 blob 7317f0d3e50961f076fe4363bfc7dee01d2328c2	.gitignore
100644 blob 5a6e646728fb52dc554871cb9254118eae03ff70	.gitmodules
100644 blob b8328a6ab2a7116226ebf610244da075f8d78153	404.markdown
100644 blob 3bbbc1ee92562e6a2eebfc6a366f4309d06c7d54	LICENSE
100644 blob d9ad1490aa76a7dcf6cd4c59f719e748ce7ae3be	README.md
100644 blob ec8ff16c3211140cd823b4138b78b5f4e6d08f44	_config.yml
040000 tree 6486d116d42960008439afbe700ffb546e5c9685	_drafts
160000 commit be797a0f091e352bb14164b8aa141620b2bbbac1	_image-tag
040000 tree 72f2320f2da66723a674ee1291a682caa935ebdf	_includes
040000 tree c3625b684be7742f35a716ee491cf043b4ebe0bc	_layouts
040000 tree 016c30455489e23398c687778953cf51de66239d	_plugins
040000 tree 8aa98b075e71ed1bd772bd6e2613d8d0e09562bd	_posts
100644 blob 15589383425e83bad3bd4533a36dee974960880b	about.markdown
100644 blob 37b1c20dc385b7ac0fc71804f051fed622276bbc	archive.html
040000 tree 188f5cbb8d699329c741e965be158f688a026ee8	assets
040000 tree d0223d549f3f35c881018ac4605318202b5285cb	css
100644 blob c1f7683ff289d4bba91c2a4ddd3a07a309a00147	favicon.ico
100644 blob d878f3ac7edff9ae701624661ae1d104a2cd816b	index.html
```

我们看，Tree 对象里面保存的有三种对象。

其中，Blob 对象就是某个版本的文件，你用 `cat-file` 打印出来，就是文件内容。

Tree 对象里面保存的其他 Tree 对象，就是子目录了，子目录里一样可以有 Blob 和 Tree，
这样就构成了项目的目录结构。

Tree 对象里面还可能保存 Commit 对象，这个功能用于实现 Git 的 Submodule 引用。
如果你用过 Submodule，到这里就应该理解，为什么每次 `git submodule update` 之后，
子模块项目总是 Detached Head 状态了，因为它 Checkout 的是一个具体的 Commit。

我们看到的这几个对象，Commit, Tree 和 Blob，加上 Git 还支持一种 Tag 对象，
就是 Git 的基本存储单元了。
Git 通过哈希值保存和引用这些对象，对象刚生成的时候，都是一个对象一个文件，
保存在 `.git/objects/` 这个目录底下。

## Packfile

我们说，一个 Blob 对象就是 Git 中一个版本的文件。
哪怕是你给一个文件做了一点点修改，Git 也会给你生成一个新的 Blob 对象，
然后就需要新的 Tree 对象，提交到新的 Commit 对象里面。
所以说，随着修改的积累，你的 Git 仓库里会有越来越多的对象。

Git 把压缩存储空间的工作放在了对象文件的存储上面。
在 Fetch 和 Push 的时候，以及你手动执行 `git gc` 的时候，
Git 都把零散的对象文件打包起来，保存成一种叫做 Packfile 的文件。
Packfile 都保存在 `.git/objects/pack` 这个目录底下，你可以去看一看。
Packfile 包括两个文件，一个是保存数据的 `.pack` 文件，另一个则是索引。

制作成 Packfile 后，相似的对象就可以压缩存储，Git 就能实现存储空间的压缩了。
具体 Packfile 的存储格式和索引格式也是个很有意思的主题，我还没有研究得很明白。

## 引用

Git 里面，我们使用的分支、标签之类的名字，统统称作引用。
其实引用就是一个文本文件，里面写着所引用的哈希值，Git 里面主要的几个引用目录包括
`.git/refs/heads/`，`.git/refs/remotes/`，`.git/refs/tags/`，里面的文件都是引用。

例如，`master` 分支实际上就是 `.git/refs/heads/master`；
Remote Tracking 分支 `origin/master` 实际上就是 `.git/refs/remotes/origin/master`。

Git 的 `show-ref` 子命令可以给你列出当前仓库里的引用。
此外，如果你有一个引用名字，想知道具体引用的对象哈希，可以用 `rev-parse` 子命令，
例如：

``` bash
git rev-parse master
```

就是你仓库里 `master` 分支最新的 Commit 了。

另外 Git 里还有几个引用名字，HEAD、ORIG\_HEAD 之类的，都是 `.git` 目录下的文件。
HEAD 就是我们本地仓库当前 Checkout 的版本，如果 HEAD 里面是个引用，
说明我们 Checkout 到了一个分支或者标签上，如果里面是个哈希值，可能就是 Detached HEAD 了。

## Index

在 Git 里面，两步提交是一个很重要的特点。
首先你需要把新修改的内容 `add` 到所谓的暂存区，然后才能去 `commit` 到仓库里。

这里面，暂存区实际上就是 Index 文件，这个文件就是仓库里的 `.git/index`。
这是一个二进制文件，你可以用 `ls-files` 命令查看当前 Index 里面的内容：

``` bash
git ls-files --stage
```

这个命令会列出你仓库里所有的文件，在暂存区里的版本。
头一列是文件权限，第二列是哈希值，可以是 Blob 对象的，可以是 Commit 对象的，例如 Submodule 的，
最后一列则是具体的文件路径。

上面的输出里，第三列是一个版本号，这个版本号在分支合并冲突的时候非常有用，
可以用来区分同一文件的不同版本。

Index 文件实际上保存了生成一个 Tree 对象的所有信息，在提交 Commit 时，
生成的新 Tree 对象实际上就是以当前 Index 为蓝本的了。
这也是为什么 Index 被称作暂存区的原因，它记录了一个完整的项目状态。

## Stash 和 Reflog

我们经常会使用 Stash 功能来保存当前工作，特别是在工作被打断的时候，
如果还不想把当前工作提交 Commit，就可以先 Stash 它。

Git Stash 表现地像是一个栈，我们用 `save` 和 `pop` 来压栈和出栈，
而 `apply` 则有点像栈的 Top 操作。
我们可以在 `.git/refs/stash` 这个文件里找到最新压栈的 Stash，
它引用的是一个 Commit 对象，而这个 Commit 对象则引用了 Stash 时刻项目的 Tree 对象。

不过，`refs` 里面这个 `stash` 文件引用只保存了当前最新的一个 Stash，
其他的 Stash 则不在这里保存。实际上，Git 的 Stash 保存在 Reflog 里面。

我们知道，Reflog 是 Git 忠实记录我们每一次 HEAD 移动记录的工具。
当我们误操作导致丢失数据时，例如 Reset 传了参数 `--hard`，
Reflog 就可以帮助我们找回丢失的数据。

如果你创建了一些 Stash，就可以使用命令：

``` bash
git reflog stash
```

看到 Stash 的历史，和标准命令：

``` bash
git stash list
```

看到的内容实质上是一样的。

另外，你可以打开文件 `.git/logs/refs/stash` 来看一下，这里面就保存了我们所有的 Stash。

