---
layout: post
title: "Linux I/O buffering and DMA"
date: 2023-07-18 22:38:37 +0800
categories: [ linux ]
---

A brief note on how I/O in Linux is buffered and how DMA frees the CPU from one phase of data copying.

<!-- more -->

## I/O buffering

In Linux, standard I/O is buffered in both user space and kernel space.
Here is a good summary from the book **The Linux Programming Interface**.

<center>
{% image fullWidth io_buffering_summary.png alt="Summary of I/O buffering" %}
</center>

Reads and writes with the `stdio` library are firstly buffered in the `stdio` buffer.
Eventually the system calls `read()`  and `write()` are called to let the kernel handle the I/O requests.
There is also a `Kernel buffer cache` between the system calls and read disk operations.

There are `Page cache` and `Buffer cache` in Linux and they are fused together now.
`Page cache` is mainly for file I/O which, like it's name suggests,
is based on virtual memory pages.
`Buffer cache` comes before the virtual memory technology and is based on the disk I/O unit `block`.

## Direct memory access (DMA)

User application relies on the kernel to read from or write to the disk,
and data is buffered in different layers.
A typical `read()` call with only CPU looks like this:

<center>
{% image fullWidth read_without_dma.png alt="A read() call without the DMA" %}
</center>

It is a waste of CPU time to let it busy on copying data around,
and that's why we have a hardware DMA.

<center>
{% image fullWidth read_with_dma.png alt="A read() call with the DMA" %}
</center>

DMA frees the CPU from handling data moving from hardware buffer to kernel buffer,
but CPU is still needed to move data from kernel space to the application memory.

