---
layout: post
title: "Vim 配置和 VsVim 配置冲突"
date: 2019-05-05 00:14:54 +0800
categories: [ linux ]
---

假期前我在 Windows 本地配置了 Vim，使用了 [spf13][spf13] 的配置，然后 Visual Studio 里的 VsVim 就挂了。

<!-- more -->

起初我发现 VsVim 挂了，没有想到是配置了本地 Vim 的原因，又因为有工作在忙活，忍了没有 Vim 的几天，然后就假期了。
今天来公司看了一下 VsVim 的日志，发现是读取 vimrc 文件时报的错。
于是我去看了看文档，发现 VsVim 默认是会读取家目录里面 vimrc 的，而我配置这个 vimrc 比较复杂，于是 VsVim 就挂了。

解决的办法也很简单，VsVim 的配置项里有读取配置文件的选项，可以选择读取 vsvimrc 和 vimrc 中任意一项，
或者两者都读取，或者干脆不读取任何配置文件。把 vimrc 从 VsVim 的配置文件中去掉就好了。

[spf13]:       https://github.com/gnailuy/spf13-vim-local
