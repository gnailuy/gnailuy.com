---
layout: post
title: "Create a new Git repository from subdirectories of an existing one"
date: 2021-06-03 16:57:31 +0800
categories: [ linux ]
---

We've been developing a project in a subfolder of the repository of it's only consumer project for a while.
And recently this project has been proven to have wider usage in other projects, so we decided to move it into a standalone repository of it's own. And I got this task.

<!-- more -->

The folder structure looks like this:

``` text
.
├── the_subproject
├── some_files_I_want_to_include
└── other_directories_or_files_in_the_project
```

I need to create a new repository including everything in `the_subproject` folder, and some files in the outer project (such as `.gitignore`, `.editorconfig`, etc.).

Git has a built-in subcommand [`filter-branch`][filter-branch], but it seems it's not recommended and the documentation gives this project [`filter-repo`][filter-repo] instead.

`filter-repo` is not installed with Git by default, but the installation is easy anyway. It's main project is a single Python script, so all we need is to download [this file][filter-repo-script], and put it into the Git execution path (`git --exec-path`).

On Windows 10, because my default Python 3 is named `python` instead of `python3`, I also need to edit `git-filter-repo` and change `python3` to `python` in the first line.

After that, just run this command to see the help:

``` bash
git filter-repo -h
```

For my task, I need to clone my project into a new folder, preferably with the new project name. If the repository is not newly cloned, this command will not run unless we add a `--force` parameter.

``` bash
git clone my_project_remote new_project_name
```

Then `cd` to `new_project_name`, run this command:

``` bash
git filter-repo --path some_file_I_want_to_include --path  another_file_I_want_to_include --subdirectory-filter the_subproject
```

After that, I got a new project including my subproject files, and a few other files I want to include, and all the Git history is preserved.

For the `--path` parameter, I can also include files or folders that do not exist in the current project tree. For example, my `the_subproject` was renamed from `old_subproject_folder`, I can use `--path old_subproject_folder` to include this rename history, although `old_subproject_folder` no longer exists in the current project.


[filter-branch]:        https://git-scm.com/docs/git-filter-branch
[filter-repo]:          https://github.com/newren/git-filter-repo/
[filter-repo-script]:   https://github.com/newren/git-filter-repo/blob/main/git-filter-repo

