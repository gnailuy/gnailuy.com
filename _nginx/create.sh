#!/bin/bash

docker run -d --name gnainx -v /home/yuliang/gnailuy.com/_nginx/nginx.conf:/etc/nginx.conf -v /home/yuliang/webroot:/usr/local/nginx/html:ro -p 80:80 nginx

