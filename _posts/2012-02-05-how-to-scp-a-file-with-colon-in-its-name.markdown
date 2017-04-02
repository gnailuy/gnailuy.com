--- 
layout: post
title: How to scp a file with colon in its name
date: 2012-02-05 16:20:29
categories: [ linux ]
---

As we know that `scp` is a command for secure copy, it copies file between remote hosts.
Normally, we follow the below two examples to copy a file from/to localhost to/from a remote machine:

<!-- more -->

``` bash
scp /path/to/filename username@domian-name-or-ip-address:/path/to/destination/directory/
scp username@domain-name-or-ip-address:/path/to/filename /path/to/local/directory/
```

These commands and their deformation usually work fine. But when I tried to scp a file to my VPS this afternoon. I encountered a problem:

``` bash
scp file\:name yuliang@gnailuy.com:
ssh: Could not resolve hostname example: Name or service not known
```

I Googled this problem for quite a while and finally found out that the culprit is the colon in the name of my file.
The solution to this problem turns out to be very simple:

``` bash
scp ./file\:name yuliang@gnailuy.com:
scp /path/to/file\:name yuliang@gnailuy.com:
```
