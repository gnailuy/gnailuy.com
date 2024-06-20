FROM ruby:2.6.1-alpine3.9

WORKDIR /app/

COPY Gemfile Gemfile.lock ./

# RUN sed -i 's/http:\/\/dl-cdn.alpinelinux.org/https:\/\/mirrors.ustc.edu.cn/g' /etc/apk/repositories && \
RUN apk add --no-cache ruby-dev build-base imagemagick python3 && \
    pip3 install importlib-metadata && \
    bundle install && \
    apk del --no-cache ruby-dev build-base
ENV TZ=Asia/Shanghai

ENTRYPOINT ["jekyll"]

