#!/bin/bash

docker run -d --name gnaiux -v /home/yuliang/gnailuy.com/_nginx/nginx.conf:/etc/nginx.conf:ro -v /home/yuliang/webroot:/usr/share/nginx/html:ro -p 80:80 nginx

