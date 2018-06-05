--- 
layout: post
title: Play only the audio in a movie file with Mplayer
date: 2012-09-16 19:54:36
categories: [ linux ]
---

I have a piece of beautiful music in an MP4 video file, so good that I wanted to loop it for this whole afternoon.
With [Mplayer][mplayer], I could single cycle this file with an option `-loop 0`.
Moreover, I wanted to play only the sound without the video, so I searched the 'man page' of mplayer and found this:

<!-- more -->

``` bash
mplayer -loop 0 -novideo filename.mp4
```

And voilà!

PS. I also found [this post][extract-audio] very useful if you want to extract the audio from an mp4 file to an mp3 file.

[mplayer]:          http://www.mplayerhq.hu/
[extract-audio]:    http://blog.edwards-research.com/2010/12/linux-extract-audio-from-mp4-video-audio-to-mp3-audio/
