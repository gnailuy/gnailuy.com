--- 
layout: post
title: "Excluding directories when performing a grep search"
date: 2017-03-30 11:57:29 +0800
categories: [ linux ]
---

When we want to look for some pattern from files in a source code repository,
say a Git repository.
We often want to ignore those hidden directories such as `.git`, `.github`, etc.

<!-- more -->

The following command will do:

``` bash
cd the-repository-directory/
find . \( -path ./.idea -o -path ./.git -o -path ./.github \) -prune -o \
    -type f -exec grep -I your-string-here {} +
```

In this command, the `.idea`, `.git`, and `.github` are common hidden directories
that we usually don't want to look in.

