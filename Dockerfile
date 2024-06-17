FROM ruby:2.6.1-alpine3.9

WORKDIR /app/

# RUN sed -i 's/http:\/\/dl-cdn.alpinelinux.org/https:\/\/mirrors.ustc.edu.cn/g' /etc/apk/repositories && \
RUN apk add --no-cache ruby-dev build-base imagemagick python3 && \
    pip3 install importlib-metadata && \
    gem install ffi -v 1.16.3 && \
    gem install jekyll -v 3.9.5 && \
    gem install pygments.rb -v 2.0.0 && \
    gem install redcarpet mini_magick && \
    apk del --no-cache ruby-dev build-base
ENV TZ=Asia/Shanghai

ENTRYPOINT ["jekyll"]

