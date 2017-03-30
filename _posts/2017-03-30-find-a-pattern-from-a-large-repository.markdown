--- 
layout: post
title: "Grep a string pattern from a large source code repository"
date: 2017-03-30 11:57:29 +0800
categories: [ linux ]
---

Ever in a situation when you want to find files containing some string pattern,
from a large source code repository with tons of text files, binarys,
and also hidden directories?

<!-- more -->

Try the following command:

``` bash
cd the-repository-directory/
find . \( -path ./.idea -o -path ./.git -o -path ./.github \) -prune -o \
    -type f -exec grep -I your-string-here {} +
```

where .idea, .git, and .github are common hidden directories that you
usually don't want to look into.

