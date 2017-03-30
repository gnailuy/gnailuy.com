--- 
layout: post
title: "Wordpress 添加 Google Adsense 代码"
date: 2011-07-27 18:22:23 +0800
categories: [ internet ]
---

今天 Google 批准了我的 Adsense 计划申请，所以下午我花了点时间看了些相关的文章，想找个比较好的方法把 Adsense 代码添加到这个小站上。
我找到不少插件都可以向 Wordpress 添加广告代码，其中口碑比较好的应该是 [Adsense Deluxe][adsense-deluxe] 和 [Post Layout][post-layout] 这两个。
不过我只需要添加一点点的广告代码，这些插件显得有些大材小用了。而且我已经安装了不少插件，为了避免降低网站访问速度，也为了避免插件冲突，
我就采用直接修改 Wordpress 代码的方法，本文为就这件事做个小结。

<!-- more -->

(This post is also available in English: [Link][english])

## 获取Adsense代码

Google 现在已经启用了新的 Adsense 界面，在其中生成广告代码非常容易。只需要到 "My ads" 选项卡下，点击 "+New ad unit" 这个按钮，然后按照提示填写表单，
点击 "Save and get code" 生成代码就完成了。同样也可以生成 Search、Feeds 或者 Games 等其他产品相关的代码，保存这些代码待用。

## 在网站上投放广告

理论上你可以在你网站上任何位置放置广告，但是考虑到用户的阅读体验，还是谨慎选择广告的位置和投放方式比较好。
好的广告不光能为商家和你带来收益，还可以丰富你网站上的内容，扩展用户阅读。我就比较讨厌那些比较恼人的影响阅读的广告，所以我只在侧边栏最下面和每篇文章最后，
两个比较不起眼的地方，放置了两个广告位。

### 1.侧边栏广告：

侧边栏上放置广告很简单，只需要一个 Text Widget 就够了。在后台面板 "Appearance" 下的 "Widgets" 中找到一个 Text Widget，拖放到旁边的 Sidebar 位置，
在 Title 栏可以填写一个标题或者留空，然后在下面粘贴上你的 Adsense 代码就行了。我把标题直接填作 "Ads by Google"，显得清楚些。

### 2. 文章内广告：

在 "Appearance" 栏下找到 "Editor"，编辑当前主题的代码。在右侧选择文件 `single.php`，找到如下代码：

``` html
<div class="entry">
    <?php the_content(); ?>
</div>
```

可以将下面的代码放置在上面代码块的上方，这样广告就会出现在文章上方；或者将下面代码放在上述代码块下方，广告就会出现在文章底部。

``` html
<div style="float:right;padding-bottom:7px;padding-top:17px;">
    Your Adsense Code Here
</div>
```

在生成 Adsense 代码的时候，要选择好一个合适的大小，来放置在上述位置。也可以在其他合适的地方放广告代码。
另外，你也可以编辑上述 div 代码块，调整上下间距或者实现广告文字环绕等效果。

### 3. 自定义搜索：

Google 提供的自定义搜索，无论从质量或者速度上都是最佳的。我在侧边栏和 404 页面上设置了 Google 的自定义搜索。

侧边栏上添加自定义搜索，可以向上面一样将搜索代码添加到一个 Text Widget 中。我直接利用了 Wordpress 主题自带的 Search Widget。
在 "Appearance->Editor" 中找到并打开文件 `searchform.php`，用 HTML 注释标记 <!-- 和 --> 注释掉其中所有内容，然后把 Google 自定义搜索的代码粘贴到这个文件最后，
这样原来的 Search Widget 就变成 Google 的自定义搜索了。

要在 404 页面上添加 Google 搜索，编辑文件 `404.php`，注释掉下面代码：

``` php
<?php include (TEMPLATEPATH . "/searchform.php"); ?>
```

然后把 Google 自定义搜索的代码放在这里就完成了。这里没有使用上面修改过的 `searchform.php` 是因为我为 404 页面专门生成了不一样的搜索代码。

[adsense-deluxe]:       http://www.acmetech.com/blog/2005/07/26/adsense-deluxe-wordpress-plugin/
[post-layout]:          http://www.satollo.net/plugins/post-layout
[english]:              /internet/2011/07/28/add-google-adsense-code-to-wordpress/
