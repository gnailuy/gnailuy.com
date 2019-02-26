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

