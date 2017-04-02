--- 
layout: post
title: "Troubleshooting: wordpress can't login"
date: 2011-07-26 15:45:23
categories: [ internet ]
---

I keep cookies in my browsers all the time, so it had been long since the last time I perform a "Log In" action to my wordpress site.
But today, when I tried to login to my dashboard on anther computer, a problem arose.

<!-- more -->

After I clicked on the "Log In" bottom, the browser just redirected me to the home page or reloaded the login page. And I am still logged out.
I am very sure that I entered the right username and password, because when I tried a pair of incorrect ones, wordpress worked correctly by telling me a login error.

I googled this problem. It seems that I am not the first one who has encountered this error.
I tried to follow the methods on the Internet such as deleting cookies, modifying some php files, removing .htaccess file, etc., but non of them worked.
I tried to recall the recent modifications of my site. But I did minor changes frequently these days and I cannot remember when was the last time I logged in correctly.
Worse still, I used to have a logged in session on my working computer. But I lost it when I tried to find out if this is due to a browser error.
So I can no longer access to my dashboard.

Finally, I disabled all the plugins by renaming the "plugins" directory in `wp-content` to "plugins.bak" from ssh
(or you can do the same thing via ftp if you don't have ssh access).
Then the login function worked. After logged in, I opened the "Plugins" page in order to deactivate all the plugins in wordpress core settings.
Then I renamed the "plugins" directory back and refresh the "Plugins" page. Now all the plugins were deactivated and the login function worked correctly.
After that, I activated the plugins one by one and tested the login function at the same time.
At last, I found out that it was due to a plugin called Wordpress-HTTPS. Since I didn't use this plugin much, it was uninstalled and now everything works fine.
