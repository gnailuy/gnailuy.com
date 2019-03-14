gnailuy.com
===========

Jekyll powered [gnailuy.com](http://gnailuy.com/)

## Prepare Jekyll on Docker image

``` bash
docker build -t gnailuy/jekyll .
```

## Build the site

``` bash
docker run --rm -v $PWD:/app -it gnailuy/jekyll build
```

## Serve the site locally

``` bash
docker run --rm -v $PWD:/app -p 4000:4000 -it gnailuy/jekyll serve --host 0.0.0.0
```

## Serve the site with nginx

``` bash
docker run -d --name gnaiux -v /home/yuliang/gnailuy.com/_nginx/conf/:/etc/nginx:ro -v /home/yuliang/webroot:/usr/share/nginx/html:ro -v /home/yuliang/logs:/var/log/nginx -p 80:80 nginx
```

