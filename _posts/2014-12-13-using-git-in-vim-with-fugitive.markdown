--- 
layout: post
title: "在 Vim 中使用 Git 的插件: Fugitive"
date: 2014-12-13 01:37:30 +0800
categories: [ linux ]
---

刚才在 Vim 中编辑一些 Git 管理的 python 代码，改了一段时间代码后，
想看一下修改内容和原始内容的对比。

<!-- more -->

以往我看这种对比内容，要先退出或在 Vim 中 `:sh`，然后在 Shell 里 `git diff`
看传统格式的 differ，或者使用 `git difftool` 命令查看 vimdiff 可视化后的 differ。

感觉有点麻烦，于是顺手在 [vimawesome][vimawesome] 上搜索了一下 Vim 的 Git 相关插件，
果然发现了一个叫做 [Fugitive][fugitive] 的插件，试用了一下感觉不错。

插件安装非常简单，我使用 [Pathogen][pathogen] 管理 Vim 的第三方插件，所以只需要：

``` bash
cd ~/.vim/bundle
git clone https://github.com/tpope/vim-fugitive.git
```

就可以了。

安装完成后，退出 Vim 重新打开正在编辑的文件，命令 `:Gdiff`，
就可以方便的查看本次修改和仓库里代码的改动了。

此外 Fugitive 还提供很多其他 'G' 开头的 Git 命令，使用起来挺方便的。

[vimawesome]:   http://vimawesome.com/plugin/fugitive-vim
[fugitive]:     https://github.com/tpope/vim-fugitive
[pathogen]:     https://github.com/tpope/vim-pathogen
