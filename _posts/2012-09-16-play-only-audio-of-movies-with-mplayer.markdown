--- 
layout: post
title: Play only audio of movies with mplayer
date: 2012-09-16 19:54:36
categories: [ linux ]
---

I had a piece of very good music in an MP4 video file, so good that I'd like to loop it for a whole afternoon.
With [mplayer][mplayer], I could single cycle this file with option `-loop 0`.
Moreover, I wanted to play only the audio but not the video, so I searched the 'man page' of mplayer and found this:

<!-- more -->

``` bash
mplayer -loop 0 -novideo filename.mp4
```

And voilà!

PS. I also found [this post][extract-audio] very useful if you want to extract the audio from an mp4 file to mp3 file.

[mplayer]:          http://www.mplayerhq.hu/
[extract-audio]:    http://blog.edwards-research.com/2010/12/linux-extract-audio-from-mp4-video-audio-to-mp3-audio/
