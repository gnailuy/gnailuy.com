--- 
layout: post
title: "又一个 VIM 配置文件"
date: 2011-07-18 13:55:36 +0800
categories: [ linux ]
---

这篇文章记录我的 VIM 配置，包括带注释的配置文件 `.vimrc`，和几个很好玩的插件。
VIM 可以依照个人习惯进行很多有趣的配置，因此每个人的配置多多少少都不太一样，这也是这个编辑器的强大与灵活所在。
我在配置自己的 VIM 时，也是参考了许多其他人的配置文件，再依照自己的使用习惯增删修改。
因此虽然网上已经有很多配置 VIM 的文章，我也不介意增加一篇，希望本文的内容能够成为众多有价值的参考之一。

<!-- more -->

## 正文
从开始用 Linux 就与 VIM 结下不解之缘，到现在差不多有三四年了，VIM 已经成了自己学习工作不可或缺的工具。
不过虽然使用时间很长，但是我基本上一直是在使用 vim-enhanced 的基本功能，加上一些简单的配置选项，最多试验过 ctags 之类的插件罢了。
我一直觉得 VIM 本身就已经够强大，并且很享受那种在代码中间跳来跳去，对缓冲、行、块、单词、字母的操作得心应手，以及头脑还没意识到手上已经敲完了一串快捷键的感觉，
各种补齐、高亮以及自动缩进的功能也让我对 VIM 爱不释手。我猜也会有很多 VIM 用户和我一样，会在任何编辑文本的地方不自觉地猛按 Esc，会尝试把许许多多其他工具变成 VIM 风格，
譬如 Firefox，譬如 Chrome，譬如 MS Word，譬如 Eclipse ...

### VIM 配置文件
前一阵子在一个朋友的提醒下，我也整理了一下自己的 `.vimrc`。除了原有几行配置之外，还参考了很多手册、配置样例，增加到现在的样子：

{% highlight vim %}
" == gnailuy's .vimrc ==
"
" vimRepress 的变量
let VIMPRESS = [{'username':'name','password':'pass','blog_url':'http://blog_url.com/'}]
" =======
"
" 配色方案(可用 :highlight 查看配色方案细节)
colorscheme murphy

" 打开语法高亮
syntax on

" 侦测文件类型
filetype on

" 载入文件类型插件
filetype plugin on

" 为不同文件类型使用不用缩进
filetype indent on

" =======
"
" 显示行号
set number

" 打开自动缩进
set autoindent

" 使用 C/C++ 的缩进方式
set cindent

" 为 C 程序提供自动缩进
set smartindent

" 设置自动缩进长度为四个空格
set shiftwidth=4

" 按退格键时可以一次删掉 4 个空格
set softtabstop=4

" 设定 tab 键长度为 4
set tabstop=4

" 将 tab 展开为空格
set expandtab

" 去掉输入错误时的提示声音
set noerrorbells

" 右下角显示光标位置
set ruler

" 总是显示状态行
set laststatus=2

" 自定义状态行
set statusline=%F%m%r%h%w[%L][%{&ff}]%y[%p%%][%04l,%04v]
"              | | | | |  |   |      |  |     |    |
"              | | | | |  |   |      |  |     |    +-- 当前列数
"              | | | | |  |   |      |  |     +-- 当前行数
"              | | | | |  |   |      |  +-- 当前光标位置百分比
"              | | | | |  |   |      +-- 使用的语法高亮器
"              | | | | |  |   +-- 文件格式
"              | | | | |  +-- 文件总行数
"              | | | | +-- 预览标志
"              | | | +-- 帮助文件标志
"              | | +-- 只读标志
"              | +-- 已修改标志
"              +-- 当前文件绝对路径

" 强调匹配的括号
set showmatch

" 光标短暂跳转到匹配括号的时间, 单位是十分之一秒
set matchtime=2

" 显示当前正在键入的命令
set showcmd

" 设置自动切换目录为当前文件所在目录，用 :sh 时候会很方便
set autochdir

" 搜索时忽略大小写
set ignorecase

" 随着键入即时搜索
set incsearch

" 有一个或以上大写字母时仍大小写敏感
set smartcase

" 代码折叠
set foldenable
" 折叠方法
" manual	手工折叠
" indent	使用缩进表示折叠
" expr		使用表达式定义折叠
" syntax	使用语法定义折叠
" diff		对没有更改的文本进行折叠
" marker	使用标记进行折叠, 默认标记是 {% raw %} {{{ 和 }}} {% endraw %}
set foldmethod=indent

" 在左侧显示折叠的层次
"set foldcolumn=4
" =======
"
" 退出编辑模式时自动保存，条件为文件存在且可写，文件名非空（注:与 Conque Shell 冲突）
"if has("autocmd") && filewritable(bufname("%"))
"    autocmd InsertLeave ?\* write
"endif

" 针对 Python 文件的设定
if has("autocmd")
    autocmd FileType python set tabstop=4 shiftwidth=4 expandtab
endif
{% endhighlight %}

上述配色方案 murphy 可以在 `/usr/share/vim/vim73/colors` 中找到，当然你也可以在[这里][vim-color]挑选使用你喜欢的其他配色方案。

### 插件

VIM 的插件库很丰富，这里只是介绍几个我正在使用的小插件。

#### Conque Shell

现在的显示器都个顶个的大，相信很多朋友也会像我一样，在写代码时候喜欢把终端开为全屏。全屏写代码，也免不了会使用窗口 split 的功能，一次开很多个源文件互相参考。
一般来说，如果写代码时需要执行一些 Shell 命令，较简单的的命令可以使用单行模式下的 `!` 或者 `!!` 的功能来执行，较复杂的命令也可以使用 `:sh` 打开一个 Shell 来执行。
其实，VIM 既然可以开多窗口，为什么不在屏幕上专门开一个窗口作为 Shell 呢？这样根本就不需要离开编辑器的界面，就可以随意敲命令了。

幸运的是，实现这个功能的插件已经有了，它就是 [Conque Shell][conque-shell]。
其实上面描述的仅仅是 Conque Shell 的一个功能，这个插件的功能是让用户可以在 VIM 的一个 Buffer 里，执行诸如 Bash、Python 之类的交互性程序。
其实上面这些 Conque Shell 的功能也可以用 Screen 来代替，只是目前我还没有把 Screen 整明白。

关于 Conque Shell 的详细使用说明，在其 [Google Code 页面][conque-man]上很详细。
我经常用到的两个命令是 `:ConqueTermSplit bash` 或 `:ConqueTermVSplit bash`，类似 `:new` 和 `:vnew`，它们会在我的编辑窗口旁边（横向或纵向）打开一个新的窗口，
不同的是这个窗口里是一个 Bash Shell。
当然，其中的 `bash` 也可以用 `python` 或者 `mysql -u username -p password` 之类的命令来代替。总之很酷就是了，效果见下图，右下角的窗口就是 Conque Shell 打开的 bash：

{% image fullWidth Conque-Shell.png alt="Conque Shell" %}

有一点遗憾的是，这个插件与我在 `.vimrc` 中配置的自动保存设置（上述代码中最后注释掉的部分）有冲突。
Conque Shell 为它打开的 Buffer 设置了 buftype，禁止写操作，因此离开 Insert 模式后自动写的操作会报错。
我查了很久资料，试过为 if 语句加上 `filewritable()` 判断，但是看起来 autocmd 是在 VIM 打开时一次性设置的，只要打开一个可写的文件，再打开的所有窗口就都会尝试保存。
现在为了 Conque Shell 把自动保存暂时禁用掉了，其实我按 `:w` 已经有点神经质，也可以算是半自动保存了o(∩∩)o...

#### Code Complete

这也是一个很酷的插件，虽然我用到的机会不多，但是很有趣。[Code Complete][code-complete] 是那种可以让程序员偷点懒的插件，正如插件[插件官方网站][code-complete]所述，
它会自动帮你补齐一些常见的代码结构。
我也没必要做一个 GIF 动画专门演示它的功能了，你只需要装上这个插件，然后新建一个 `.c` 文件，输入 main 然后按 Tab 键，见证奇迹的时刻就又来了。

#### VimRepress

喜欢使用 VIM 的 Wordpress 用户，相信一定不会错过这样一款有爱心的插件。在 [VimRepress][vimrepress] 之前还有一个 VimPress，只是这个插件自 2007 年就没有更新了，
VimRepress 的作者于是自己发布了这个新插件。
论功能，VimRepress 也许只是另一个 Wordpress 的离线编辑器罢了，但是和 VIM 结合起来，你的任何 VIM 编辑习惯都可以拿来写 Blog，很酷吧？

这个插件安装后，可以在你的 `.vimrc` 中配置一个叫做 VIMPRESS 的变量，包括你的 Wordpress 用户名、密码和 URL，上面我的配置文件第一行就是一个例子。
当然如果不配置密码，VimRepress 会在连接时要求你输入密码。
具体插件的使用，大家参考[官方网站][vimrepress]的文档就可以了，在这里赘述无益，我就请大家看看截图好了：

{% image fullWidth vimRepress.png alt="VimRepress" %}

[vim-color]:            http://code.google.com/p/vimcolorschemetest/
[conque-shell]:         http://www.vim.org/scripts/script.php?script_id=2771
[conque-man]:           http://code.google.com/p/conque/
[code-complete]:        http://www.vim.org/scripts/script.php?script_id=1764
[vimrepress]:           http://www.vim.org/scripts/script.php?script_id=3510
