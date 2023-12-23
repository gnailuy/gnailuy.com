---
layout: post
title: "Zero copy in Linux"
date: 2023-09-21 21:17:10 +0800
categories: [ linux ]
---

In many applications such as web servers,
it is a common task to read disk file and write to the network interface directly without any modification.
Zero copy frees the CPU from copying data from one memory area to another.
This note is a brief on zero copy in Linux.

<!-- more -->

## Traditional I/O

Traditionally, we use the `read()` and `write()` system calls to read data from disk,
then write it into a network device.
Recall that there is I/O buffering in Linux, so for each `read()` or `write()` call,
the CPU has to copy data from user space to kernel space, or backwards.

<center>
{% image fullWidth traditional_io.png alt="Traditional I/O" %}
</center>

With DMA (Direct Memory Access), CPU can avoid copying from/to hardware buffers.
But it still requires the CPU to spend valuable cycles to copy the data from kernel space to user space,
and from user space to kernel space again.

## Zero copy

In Linux, several zero copy technologies can help here to save the CPU cycles and memory bandwidth spend on data copying.

### `mmap() + write()`

The `mmap()` system call is to create a memory map:
a section of the user buffer in the user space is mapped to the kernel buffer where the file is located.

<center>
{% image fullWidth mmap_and_write.png alt="mmap() + write()" %}
</center>

With `mmap()`, the data buffer in user space and kernel space physically point to the same address.
It saves memory space and it saves one copy from the kernel space to the user space.

One drawback of `mmap()` is that if another process truncate the mapped file,
the current process will get a `SIGBUS` single that can cause core dump error if it is not handled properly.

### `sendfile()`

Since Linux kernel 2.1,
there is a new system call `sendfile()` which can been seen as a combination of `mmap()` and `write()`.
It looks similar but saves one context switch.

<center>
{% image fullWidth sendfile.png alt="sendfile()" %}
</center>

Note that there is a similar system API in Windows is called `TransmitFile()`.

### `sendfile()` with DMA gather copy

New DMA hardware supports the gather copy operation,
with which you can specify a buffer descriptor containing the memory address and data size and let DMA copy data from there.

<center>
{% image fullWidth dma_gather_copy.png alt="DMA gather copy" %}
</center>

With the new hardware support, `sendfile()` can now have no CPU copy in the data transmission.
Note that the input file descriptor has to be a file with `sendfile()`.

### `splice()`

The `splice()` system call looks very similar with `sendfile()`,
but it can transfer data between two file descriptors of any type.
`splice()` also eliminates the last CPU copy in the DMA gather copy.

<center>
{% image fullWidth splice.png alt="splice()" %}
</center>

One of the two parameters of `splice()` must be a pipe device,
so typically, we need two `splice()` calls to bridge two devices (such as the below `file_fd` and `socket_fd`).

``` c
int pfd[2];

pipe(pfd);

ssize_t bytes = splice(file_fd, NULL, pfd[1], NULL, 4096, SPLICE_F_MOVE);
assert(bytes != -1);

bytes = splice(pfd[0], NULL, socket_fd, NULL, bytes, SPLICE_F_MOVE | SPLICE_F_MORE);
assert(bytes != -1);
```

`splice()` does not use the pipe API `pipe_write()/pipe_read()` to really copy data from one place to another in memory,
instead, it "copies" data by assigning the physical memory page pointers, offsets, thus it also requires no CPU copy.

### `send()` with `MSG_ZEROCOPY`

This is a new zero copy implementation for sending data from user buffer to the network socket.
Its usage looks like:

``` c
if (setsockopt(fd, SOL_SOCKET, SO_ZEROCOPY, &one, sizeof(one)))
	error(1, errno, "setsockopt zerocopy");

ret = send(fd, buf, sizeof(buf), MSG_ZEROCOPY);
```

## Reference

1. [Linux I/O and zero copy][linux-io-and-zero-copy]
2. [MSG_ZEROCOPY][msg-zerocopy]


[linux-io-and-zero-copy]:   https://www.sobyte.net/post/2022-03/linux-io-and-zero-copy/
[msg-zerocopy]:             https://www.kernel.org/doc/html/v4.18/networking/msg_zerocopy.html

