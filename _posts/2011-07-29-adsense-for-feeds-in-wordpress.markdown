---
layout: post
title: Adsense for Feeds in Wordpress
date: 2011-07-29 12:46:15
categories: [ internet ]
---

Google's acquisition of [Feedburner][feedburner] makes it easier to add advertisements to your RSS feeds.
In this post, we talk about how to put Adsense in the feeds of Wordpress.

<!-- more -->

(本文中文版[链接][chinese])

### Create Feed Unit

Take the new Adsense interface for example, after login to your account, click on the tab "My Ads". Then you can see "More products" on the left navigation bar.
Click on "Feeds" button under "More products", and then click "+New feed unit" following the popped up hint.
On the next page, you can specify how the ads will appear in your feeds.

Then you need to add a feed to your Adsense account if you haven't burned one from Feedburner. After the combination of Google's Adsense and Feedburner,
we can create our own feeds easily in the Adsense interface. Just click on the link "Burn new feed" and follow the popped up wizard. Then you can get a unique feed URL.
For instance, mine is [http://feeds.feedburner.com/gnailuy][feeds]. If you enjoy reading my posts, its welcome to subscribe to my blog via this link.

### Rewrite Wordpress RSS to Feedburner

Next, we should redirect Wordpress' default RSS feed to the Feedburner URL that we just generated. We have to ensure that our change does not affect our old subscribers.
Again there are a few plugins for this. Doing some hack will work too, but it's a little bit complex. You may find [Using FeedBurner][using-feedburner] on Wordpress Codex
very helpful.

I am using pretty Permalink on my site. So I prefer to archive this goal by adding rewrite rules in the `.htaccess` file. Once we enable Permalink in Wordpress,
there exist some rewrite rules in `.htaccess`. After Googling a lot of articles on the Internet, I added the below rules in front of the existing rewrite rules:

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

And that's it. Google will automatically add advertisements to your feed.

### Special Issue for Mainland Chinese Users

For some well-known reason (life is not easy here), the Mainland Chinese users cannot access the above Feedburner URL.
So the above redirection will cause them not being able to subscribe to your feed. To solve this problem, we can play some tricks to serve the feed from our own site.

First, create a new folder in your site's root directory. Name this folder carefully so that it won't conflict with Wordpress' old feed path. I chose "googlefeed".
Next, create the following php source file named `index.php` in this folder:

``` php
<?php
header("Content-Type: application/xml; charset=utf-8") ;
@readfile("http://feeds.feedburner.com/gnailuy");
?>
```

Then your users will be able to subscribe to your blog following this link: [http://gnailuy.com/googlefeed/][googlefeed].
If you want to redirect all your users to this feed service, you can add rewrite rules as above. There is only one small difference. This line

``` apache
RewriteRule ^feed/?([_0-9a-z-]+)?/?$ http://feeds.feedburner.com/gnailuy [R,NC,L]
```

should be replaced by

``` apache
RewriteRule ^feed/?([_0-9a-z-]+)?/?$ googlefeed [R,NC,L]
```

Then all your RSS users will be redirected to [http://gnailuy.com/googlefeed/][googlefeed].

[feedburner]:       http://feedburner.com/
[chinese]:          /internet/2011/07/29/adsense-for-feeds-in-wordpress-chs
[feeds]:            http://feeds.feedburner.com/gnailuy
[using-feedburner]: http://codex.wordpress.org/Using_FeedBurner
[googlefeed]:       http://gnailuy.com/googlefeed
