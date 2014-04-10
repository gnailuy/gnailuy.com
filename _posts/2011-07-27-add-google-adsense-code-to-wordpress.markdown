--- 
layout: post
title: Add Google Adsense code to Wordpress
date: 2011-07-27 18:21:09
categories: [ Internet ]
---

Google approved my Adsense application today. I read a lot of articles to find the easiest way to add Adsense code to my blog this afternoon.
There are quite a few plugins doing this. Seems like [Adsense Deluxe][adsense-deluxe] and [Post Layout][post-layout] have the best reputation.
But I prefered no more plugins. There were already many plugins installed on my site, so I was worried that too many plugins may slow down my site or cause conflicts.
I chose to edit the source code of Wordpress directly and it turns out to be not that hard. Here is a small summary.

<!-- more -->

(本文中文版[链接][chinese])

## Get Adsense Code

It's very easy to get your code in Google's new Adsense interface. Just go to your Adsense page, choose tab "My ads", click on the "+New ad unit" button,
fill the form following the instructions, and then click the button "Save and get code".
You can generate different kinds of Ads code as well as Search, Feeds or Game code for different area on your web page. Then, copy the code for future use.

## Put Ads on Your Site

You can put advertisements anywhere on you site if you like. But it would be better if you consider carefully about the reading experience for your readers.
Good advertisements will not only benefit the advertiser but also enrich the content of you site. I don't like annoying advertisements to affect to my readers.
So I just put a 200x200 square on the bottom of the Sidebar and a 468x15 link box at the end of every single post.

### 1.Side bar ads:

To put advertisement on your side bar, a Text Widget is enough. Click "Appearance" then "Widgets" in your dashboard. Drag and drop a Text Widget into the "Sidebar" area.
Then enter a title for this widget if you like. I used "Ads by Google". After that, paste your Adsense code to the text area below, and that's it.

### 2. Post ads:

Click "Appearance" then "Editor" to edit the source code of your current theme. Choose file `single.php` on the right.
Then the source code will appear in the online editor area. Find this:

``` html
<div class="entry">
    <?php the_content(); ?>
</div>
```

Your can put your Adsense code before or after your post by adding the following code above or below the aforementioned code segment.

``` html
<div style="float:right;padding-bottom:7px;padding-top:17px;">
    Your Adsense Code Here
</div>
```

Remember to choose a proper size when generating your Adsense code.
And also, you may change the div style according to your needs as well as the position of the advertisement.

### 3. Customer Search:

Google provides customer search for webmasters. And both quality and speed are no doubt the best. I generated Customer Search for the Sidebar and 404 Page.

To add Customer Search on the Sidebar. You can simply add a Text Widget with your Customer Search code in your dashboard.
I made use of the original Search Widget by editing `searchform.php` of my theme. Open `searchform.php` in "Appearance->Editor".
Then comment out all the code in it using HTML comment tag <!-- and -->. Paste your Google Search code at the end of this file, then your Search Widget will turn to Google's.

To add Google Search to the 404 Page, edit file `404.php`, comment out the follow code:

``` php
<?php include (TEMPLATEPATH . "/searchform.php"); ?>
```

Then put your Customer Search code there. Here I didn't use the modified `searchform.php` because I generated a different code specially for 404 Page.

[adsense-deluxe]:       http://www.acmetech.com/blog/2005/07/26/adsense-deluxe-wordpress-plugin/
[post-layout]:          http://www.satollo.net/plugins/post-layout
[chinese]:              {{ site.url }}/internet/2011/07/28/add-google-adsense-code-to-wordpress-chs/
