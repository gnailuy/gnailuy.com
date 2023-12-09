---
layout: post
title: "Filter paths and merge into another Git repository"
date: 2023-06-06 21:31:24 +0800
categories: [ linux ]
---

An example to filter out a subset of blobs/trees in a Git project, retain the history, and merge it into another Git project.

<!-- more -->

## The task

I got this task to merge some directories and files from Project A into a subdirectory in Project B, and keep the related commit history in Project A.

To state this more clear let's assume I need to move `subdir1` and `file1` of the below Project A into Project B.

### Project A

``` plain
/
  /subdir1
  /subdir2
  /file1
  /file2
```

### Project B

``` plain
/
  /otherdirs
  /otherfiles
```

The result I want in project B is:

``` plain
/
  /project_a
    /subdir1
    /file1
  /otherdirs
  /otherfiles
```

And all the commit history related to `subdir1` and `file1` should be kept.

## Steps

### Prerequisites

Install `git-filter-repo` from [here][git-filtere-repo].

### Prepare the paths to merge in Project A

First, get a new clone of Project A.
This is a destructive operation that will rewrite the history of the repository completely.
So make sure you have a backup of the origin Project A.

Filtere out the trees and blobs we want to keep into a subdirectory `project_a`.

``` bash
git checkout main
git filter-repo --path subdir1 \
                --path file1
                --to-subdirectory-filter project_a
```

This will rewrite this repository to contain only `subdir1` and `file1` under the directory `project_a`.
If we want all files in Project A.
We can just move all files into the directory `project_a` like this.

``` bash
git checkout main
git filter-repo --to-subdirectory-filter project_a
```

### Merge the subtree to Project B

``` bash
# Add the filtered repository as a remote and fetch the objects.
git remote add -f project_a ../project_a/

# Merge the project A repository but do not commit.
git merge --allow-unrelated-histories -s ours --no-commit project_a/main

# Add the subtree project_a to the index.
git read-tree --prefix=project_a/ -u project_a/main:project_a

# Commit the merge.
git commit -m "merge files from Project A"
```

[git-filter-repo]:  https://github.com/newren/git-filter-repo

