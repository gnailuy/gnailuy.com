--- 
layout: post
title: Add Google Adsense code to Wordpress
date: 2011-07-27 18:21:09
categories: [ internet ]
---

Google approved my Adsense application today. I read a lot of articles to find an easier way to add Adsense code to my blog this afternoon.
There are quite a few plugins doing this. It seems like the [Adsense Deluxe][adsense-deluxe] and the [Post Layout][post-layout] have the best reputation.
But I prefer to have no more plugins. There are already a lot of plugins installed on my site, so I'm afraid that too many plugins may slow down my site or cause conflicts.
I choose to edit the source code of Wordpress directly and it turns out to be not that hard. Here is a small summary.

<!-- more -->

(本文中文版[链接][chinese])

## Get Adsense Code

It's easy to get your code in the new Adsense interface. Just go to your Adsense page, choose the tab "My ads", click on the "+New ad unit" button,
fill the form following the instructions, and then click the button "Save and get code".
You can generate different kinds of Ads code as well as Search, Feeds or Game code for different areas on your web page. Then, copy the code for future use.

## Put Ads on Your Site

You can put advertisements anywhere on your site if you like. But it would be better if you consider carefully about the reading experience for your readers.
Good advertisements not only benefits the advertiser but also enrich the content of your site. I don't like annoying advertisements to affect my readers.
So I just put a 200x200 square on the bottom of the Sidebar and a 468x15 link box at the end of every single post.

### 1.Side bar ads:

To put the advertisement on your sidebar, a Text Widget is enough. Click "Appearance" then "Widgets" in your dashboard. Drag and drop a Text Widget into the "Sidebar" area.
Then enter a title for this widget if you like. I used "Ads by Google". After that, paste your Adsense code into the text area below, and that's it.

### 2. Post ads:

Click "Appearance" then "Editor" to edit the source code of your current theme. Choose the file `single.php` on the right.
Then the source code will appear in the online editor area. Find this:

``` html
<div class="entry">
    <?php the_content(); ?>
</div>
```

You can put your Adsense code before or after your post by adding the following code above or below the above code segment.

``` html
<div style="float:right;padding-bottom:7px;padding-top:17px;">
    Your Adsense Code Here
</div>
```

Remember to choose a proper size when generating your Adsense code.
And also, you may change the div style according to your needs as well as the position of the advertisement.

### 3. Customer Search:

Google provides customer search for webmasters. And both the quality and the speed are no doubt the best.
I generated a Customer Search for the Sidebar and the 404 Page.

To add the Customer Search on the Sidebar, you can add a Text Widget with your Customer Search code.
I use the original Search Widget by editing `searchform.php` of my theme. Open `searchform.php` in "Appearance->Editor".
Then comment out all the code in it using the HTML comment tag `<!--` and `-->`.
Paste your Google Search code at the end of this file, then your Search Widget will turn to Google's.

To add Google Search to the 404 Page, edit file `404.php`, comment out the following code:

``` php
<?php include (TEMPLATEPATH . "/searchform.php"); ?>
```

Then put your Customer Search code there. Here I didn't use the modified `searchform.php` because I generated a different code for the 404 Page.

[adsense-deluxe]:       http://www.acmetech.com/blog/2005/07/26/adsense-deluxe-wordpress-plugin/
[post-layout]:          http://www.satollo.net/plugins/post-layout
[chinese]:              /internet/2011/07/28/add-google-adsense-code-to-wordpress-chs/
