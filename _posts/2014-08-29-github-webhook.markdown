--- 
layout: post
title: "用 Github Webhook 自动更新 Jekyll"
date: 2014-08-29 13:49:29
categories: [ jekyll ]
---

昨天买了个 DigitalOcean (这是我的 [Refcode][refcode])，用优惠码 `ALLSSD10` 换了 $10，然后迅速创建了一个 $5/mo 的节点，连夜把博客迁移过来了。
前阵子换了 Jekyll 以后，我就一直把博客的源代码放在 [Github][gnailuy-com-git] 上，而站点本身还是放在了之前 WordPress 的 Web Root，用原来的 Apache 来做服务。
由于之前我只在笔记本上搭建了 Jekyll 环境，所以有新文章和新修改时候，我需要在本地 `jekyll build`，打包上传 `_site` 目录，然后替换到线上更新站点，
使 Github 沦落成了一个保存代码的地方。

<!-- more -->

昨晚换上新机器之后，我终于克服拖延，在熬夜上线的间隙时间把 [Github Webhook][webhook] 配好了。
所以现在我只需要写好这篇文章，`commit` 之后 `git push` 一下，服务器上的 Webhook API 就会收到 Github 的通知，并自动在服务器上拉取最新的代码，
自动 `jekyll build` 并且上线这篇新文章了。

又迁移了新系统，也学习了些新东西，再写个文章纪念一下。

因为最近一直再学习 Docker，所以我在 DigitalOcean 上创建 Droplets 的时候，选择了 `Docker on Ubuntu` 这个镜像，直接创建了一个 Docker 环境。
而且新的站点我直接用了 nginx 的[官方 Docker 镜像][official-nginx]作为 Web Server，十分方便。

拉取下来 nginx 的 Docker 镜像之后，创建 Container 的命令如下：

``` bash
sudo docker run --name gnainx -d -p 80:80 -v /path/to/my/nginx.conf:/etc/nginx.conf \
     -v /home/yuliang/webroot:/usr/local/nginx/html:ro nginx
```

其中 `/path/to/my/nginx.conf` 指定了本地我自己订制的 nginx 配置文件，覆盖了 Docker Image 里的默认配置；
而 `/home/yuliang/webroot` 目录则是宿主机上真实的 Web 根目录。

Web Server 配置好之后，还需要有一个 Jekyll 环境来编译网站代码。
因为想尽可能方便的更新宿主机上 Web Root 目录的内容，所以我直接在宿主机 Ubuntu 上建起了 Jekyll 环境，大约记起来安装了下面这些包：

```bash
sudo apt-get install ruby ruby-dev build-essential nodejs imagemagick
sudo gem install jekyll mini_magick
```

接下来，如果有文章更新，只需要从 Github 上 pull 下来我的站点代码，然后 `jekyll build`，并且用新生成的内容替换老的 Web Root 就可以了。
我又希望这个过程希望自动化，于是就用到了 Github 提供的 Webhook 功能。

Webhook 大致是这么一个运作原理，当仓库中有新事件发生时(比如这里我关心 push 这个事件，代表我对站点提交了修改)，
Github 会发送一个 POST 请求到用户指定的 API 地址。API 服务器收到通知后，根据 POST 内容做出响应(比如这里就是拉取代码，更新网站这些动作)。

Webhook 的[官方文档][webhook]里推荐了 [Sinatra][sinatrarb]，用来搭建简单的 Webhook API 非常方便。
我照着官方给出的例子写了一个非常简单的 Webhook，当 [gnailuy.com][gnailuy-com-git] 发生 push 到 master 分支的事件时，就更新网站，
代码放在了这个 [githook][githook] 仓库中。

其中主要内容是处理 [`/push`][post-request] 这个路径 POST 请求的代码。
收到 POST 请求后，程序首先进行安全验证，然后解开 JSON 数据，判断 `ref` 确实是 `refs/heads/master` 的话，
就调用 [`update.sh`][update-script] 脚本执行具体的更新。

在 [21 行][line-21] 中对比 payload 校验和的地方有个 `GITHUB_TOKEN`，这个值我是通过新建了一个文件 `/etc/environment.githook`，
在其中使用 `export GITHUB_TOKEN=xxx` 指定的。
Sinatra 服务的[启动脚本][githook-script]这一行中 source 了这个文件。
这个 Token 就是在 Github 项目的 Settings 页面中创建 Webhook 时可以填写的 Secret 值。
此外，在这个文件中还指定了执行 `update.sh` 脚本的用户名，Webhook 服务会 [`sudo`][line-13] 到这个用户来执行脚本，
这里需要确保该用户可以被服务运行所在的用户免密码 `sudo`。

最后，上述代码对应的 Payload URL 当然就是 `http://direct.gnailuy.com:20182/push` 了。
创建这个 Webhook 后，Github 就会在 push 时通知这个 API。

好了文章写完了，可以 `git push` 了。

[refcode]:          https://www.digitalocean.com/?refcode=e10b8abc5987
[gnailuy-com-git]:  https://github.com/gnailuy/gnailuy.com
[webhook]:          https://developer.github.com/webhooks/
[sinatrarb]:        http://www.sinatrarb.com/
[official-nginx]:   https://registry.hub.docker.com/_/nginx/
[githook]:          https://github.com/gnailuy/githook
[githook-script]:   https://github.com/gnailuy/githook/blob/master/githook-service#L13
[post-request]:     https://github.com/gnailuy/githook/blob/master/server.rb#L7
[update-script]:    https://github.com/gnailuy/githook/blob/master/update.sh
[line-21]:          https://github.com/gnailuy/githook/blob/master/server.rb#L21
[line-13]:          https://github.com/gnailuy/githook/blob/master/server.rb#L13
