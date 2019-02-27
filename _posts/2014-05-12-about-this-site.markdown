---
layout: post
title: "从 Wordpress 迁移到 Jekyll"
date: 2014-05-12 02:03:20 +0800
latex: true
categories: [ jekyll ]
---

虽然只有二十多篇文章，但是这次迁移仍然耗时巨长，从最初 `jekyll new gnailuy.com` 到现在终于替换掉 WP 已经俨然一个多月过去。
一方面是 Jekyll 这个新东西我要花时间学习，除去工作、学习其他东西以及四处浪的时间，留给 Jekyll 的业余时间确实不多；
另一方面直接从 WP 导出(导出工具[在此][wp-to-jekyll])的 Markdown 实在不忍直视，强迫症指使下我还要一篇一篇手打成'纯' Markdown。

<!-- more -->

迁移之后本来应该把过程搞一篇文章作为新博开篇的，不过现在是半夜，明天还要上班，所以从简好了。

1. 对 $\LaTeX$ 的支持写在了 [`default.html`][default-html] 里，使用的是 MathJax，公式比较多的文章也就是[这篇][gsl-post]，
因此 `default.html` 里可以看到会先判断文章的 `latex` 变量，只有在文章开头的 YAML front-matter 里指定了 `latex: true`，才会尝试加载 MathJax；
2. 图片使用了插件 [`jekyll-image-tag`][image-tag]，只是用它从原图生成了和文章宽度相同的图片；
3. 首页文章截断，使用了最简单地判断 `<!-- more -->` 然后截断地方式，代码在[这里][home-page]，
截断出来长短参差，因此我在首页每篇文章后面画了半条横线，来让分割显得明显一点；
4. 评论换用了高端大气国际化的 [Disqus][disqus]，代码放在了 [`_includes`][includes] 里面，在 [`post.html`][post-html] 和 [`page.html`][page-html] 里加载；
5. 原来有 Google Analytics，所以继续沿用，代码也在 [`_includes`][includes] 里面，在 [`default.html`][default-html] 里加载；
6. 原来网站的 URL 现在完全没有沿用，因此如果从别处跳转过来，可能有很多 404 错误，所以我给 404 页面增加了自动跳转到首页，代码在[这里][404-redirect]；
7. 新博所有代码都在 Github 上，链接在[这里][gnailuy-com-git]，所以其他没提到的事情，要么是默认，要么是 bla bla；

[wp-to-jekyll]:     http://import.jekyllrb.com/docs/wordpress/
[gnailuy-com-git]:  https://github.com/gnailuy/gnailuy.com
[default-html]:     https://github.com/gnailuy/gnailuy.com/blob/master/_layouts/default.html
[gsl-post]:         /mathematics/2011/07/10/gsl-erlang-and-weibull-distribution/
[image-tag]:        https://github.com/robwierzbowski/jekyll-image-tag
[home-page]:        https://github.com/gnailuy/gnailuy.com/blob/master/index.html
[disqus]:           http://disqus.com/
[includes]:         https://github.com/gnailuy/gnailuy.com/tree/master/_includes
[post-html]:        https://github.com/gnailuy/gnailuy.com/blob/master/_layouts/post.html
[page-html]:        https://github.com/gnailuy/gnailuy.com/blob/master/_layouts/page.html
[404-redirect]:     https://github.com/gnailuy/gnailuy.com/blob/master/_layouts/default.html#L52
