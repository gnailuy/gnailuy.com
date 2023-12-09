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

## Prepare SSL certificates

* Install Certbot and the Cloudflare plugin
* Prepare Cloudflare API token for Certbot and put it in file `cloudflare_api_token.ini`

``` bash
sudo certbot certonly --dns-cloudflare --dns-cloudflare-credentials ./cloudflare_api_token.ini -d "*.gnailuy.com"
sudo cp /etc/letsencrypt/live/gnailuy.com/* /home/yuliang/letsencrypt/live/gnailuy.com/
```

## Serve the site with nginx

``` bash
docker run -d --restart unless-stopped --name gnaiux --network githook -v /home/yuliang/gnailuy.com/_nginx/conf:/etc/nginx:ro -v /home/yuliang/letsencrypt:/etc/letsencrypt:ro -v /home/yuliang/webroot:/usr/share/nginx/html:ro -v /home/yuliang/logs:/var/log/nginx -p 80:80 -p 443:443 nginx
```

Note that I use the same network with the [`githook`](https://github.com/gnailuy/githook) on my host so that Nginx can find the webhook server with it's name `githook_server`.

## Let's Encrypt renewal hook

File name: `/etc/letsencrypt/renewal-hooks/post/gnailuy.com.sh`

``` bash
#!/bin/bash

LOGPATH=/home/yuliang/logs/certbot.log

echo "[$(date)] Copying certs for gnailuy.com" >> $LOGPATH
cp /etc/letsencrypt/live/gnailuy.com/* /home/yuliang/letsencrypt/live/gnailuy.com/
echo "[$(date)] Restarting Nginx for gnailuy.com" >> $LOGPATH
/snap/bin/docker restart gnaiux
echo "[$(date)] Updated certs in /home/yuliang/letsencrypt/live/gnailuy.com/" >> $LOGPATH
```

Each time `certbot renew` updates the certificates, this hook will run.

