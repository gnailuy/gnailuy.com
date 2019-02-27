---
layout: post
title: "为 WordPress 的 RSS 添加 Adsense 广告"
date: 2011-07-29 12:46:34 +0800
categories: [ internet ]
---

Google 收购 [Feedburner][feedburner] 以后，向 RSS 中添加 Adsense 更加容易了。本文介绍如何向 Wordpress 的 RSS 输出中添加 Adsense 广告。

<!-- more -->

(This post is also available in English: [Link][english])

### 创建 Feed 单元

这里我们以新版 Adsense 界面为例。登录到你的 Adsense 以后，点击标签 "My ads"，在左侧导航栏中可以看到有 "More products" 这一项。
下面选择 "Feeds" 这个链接，右侧界面会弹出 Google 的提示，按照提示点击 "+New feed unit" 按钮。接下来就可以在转到的页面上选择广告的样式、频率等信息了。

如果你还没有在 Feedburner 烧制过自己的 Feed，接下来就可以在 Adsense 账户里添加一个。自从 Google 将 Feedburner 整合到 Adsense，
我们在 Adsense 界面就可以直接烧制自己的 Feed 了。只需点击链接 "Burn new feed"，按照弹出的提示向导一步一步完成即可。最后我们可以得到一个唯一的 Feed 地址，
例如我的 Feed 地址是 [http://feeds.feedburner.com/gnailuy][feeds]，如果你觉得我的文章还不错，欢迎点击这个地址订阅我的本站内容哈，o(∩∩)o...

### 默认 Feed 地址修改到 Feedburner

接下来我们要把默认的 RSS Feed 重定向到刚刚生成的 Feedburner URL 上去。这里必须保证我们的修改不会影响到站点的老用户。
同样地，这个功能可以由许多插件来实现，不怕麻烦的话也可以直接修改 Wordpress 的源代码。Wordpress Codex 上的[这篇文章][using-feedburner]中提供了很详细的信息。

我在我的网站上启用了永久链接，也因此我倾向于使用 .htaccess 文件中的重写规则来实现这个功能。
启用永久链接后，Wordpress 本身就会自动在 .htaccess 文件中生成一些用于永久链接重定向的重写规则。查看了网上很多资料以后，我在已有规则的前面添加了下面的规则：

``` apache
# BEGIN RSS Rewrite
<IfModule mod_rewrite.c>
RewriteEngine on
RewriteCond %{HTTP_USER_AGENT} !FeedBurner    [NC]
RewriteCond %{HTTP_USER_AGENT} !FeedValidator [NC]
RewriteRule ^feed/?([_0-9a-z-]+)?/?$ http://feeds.feedburner.com/gnailuy [R,NC,L]
</IfModule>
# END RSS Rewrite
```

然后就完成了，Google 会自动在我们的 Feed 中加入刚刚制订的广告。

### 大陆地区特殊问题

由于某些显而易见的原因，我们大陆用户无法直接访问 Feedburner 的链接。所以上述重定向会导致大陆用户无法直接订阅网站文章。
为了解决这个问题，我们可以利用一些小技巧，在我们自己的服务器上复制 Feedburner 的服务。

首先，在网站根目录下创建一个新目录。这个目录的名字必须和 Wordpress 原来的 Feed 链接不冲突，这里我使用了 "googlefeed"。
接下来，在这个目录下创建一个 PHP 文件 `index.php`，内容为：

``` php
<?php
header("Content-Type: application/xml; charset=utf-8") ;
@readfile("http://feeds.feedburner.com/gnailuy");
?>
```

这样用户就可以使用类似这样 [http://gnailuy.com/googlefeed][googlefeed] 的链接来订阅我们的网站了。
如果你希望所有用户都使用这个订阅源，可以像上面一样使用重写规则，只有一点点不同，就是需要将这一行：

``` apache
RewriteRule ^feed/?([_0-9a-z-]+)?/?$ http://feeds.feedburner.com/gnailuy [R,NC,L]
```

替换为：

``` apache
RewriteRule ^feed/?([_0-9a-z-]+)?/?$ googlefeed [R,NC,L]
```

这样所有的 RSS 用户都会被自动重定向到 [http://gnailuy.com/googlefeed][googlefeed] 了。
我没有使用这个规则进行强制重定向，而是直接使用的 Feedburner 的地址，所以网站左下角的订阅链接还是需要到长城之外来访问的。
不过如果您爬长城实在困难，也欢迎使用 [googlefeed][googlefeed] 这个地址订阅我的文章。最后，推荐使用 Google Reader 哦亲～

[feedburner]:       http://feedburner.com/
[english]:          /internet/2011/07/29/adsense-for-feeds-in-wordpress
[feeds]:            http://feeds.feedburner.com/gnailuy
[using-feedburner]: http://codex.wordpress.org/Using_FeedBurner
[googlefeed]:       http://gnailuy.com/googlefeed
