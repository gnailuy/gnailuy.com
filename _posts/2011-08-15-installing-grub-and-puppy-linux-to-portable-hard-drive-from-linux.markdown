---
layout: post
title: Installing GRUB and Puppy Linux to Portable Hard Drive from Linux
date: 2011-08-15 17:41:52
categories: [ linux ]
---

In this post, we talk about how to install the [Puppy Linux][puppylinux] to a portable hard drive from a Linux box, with [GNU GRUB][grub] as the [Boot Loader][bootloader].

<!-- more -->

(本文中文版[链接][chinese])

## Introduction

Puppy Linux is a lightweight but full-featured [Linux distribution][linux-dist] which focuses on ease of use. It can boot into a [RAM disk][ramdisk], that is to say,
the system can run entirely from [RAM][ram]. So Puppy can run extremely fast: *all applications start in the blink of an eye and respond to user input instantly*.
Puppy cat boot from an internal hard disk drive, a live USB, a live CD, an SD card, and so on.
Puppy on a removable device makes it possible to bring Linux and personal settings with us, and to boot quickly from everywhere,
as long as the computer supports USB boot.

In this article, we show how to install Puppy Linux to a USB portable hard disk. All operations will perform under Linux.
Actually, according to its [Official Website][puppylinux-inst], *Puppy is easy to use and does not require a hard disk*.
Our portable hard disk is just a container of the Puppy files and our data. After Puppy starts, the whole system will run in the Memory.
The "installation" is simple.
All we need to do is, 1) download the latest ISO image, 2) unpack or mount it to the file system and 3) copy the unpacked files to your USB hard disk.

After that, we have to make our device bootable by setting up a proper Boot Loader. It's recommended to use the GNU GRUB.
GRUB is a powerful and flexible multiboot boot loader from the [GNU Project][gnu-proj]. Most of Linux distributions use it as their default boot loader.
We will install it on our USB hard disk and configure it to boot Puppy. Below we will explain the details step by step.

### Get Puppy Ready

We can download the latest Puppy Linux from [here][puppy-down]. At present, the latest version is `lupu-525.iso`.
Mount this ISO file on your file system, e.g., `puppy-tmp` under your home directory:

``` bash
mount -o loop lupu-525.iso /home/yuliang/puppy-tmp/
```

Note that in this post, all commands should be issued by the root user.

Next, copy all the files on the ISO image to the target drive:

``` bash
cp -r /home/yuliang/puppy-tmp /media/diskone/lupu-525
```

The labels of your partitions may be different. In my case, I have four primary partitions on my USB disk, namely, diskone,  disktwo, FAT32 and NTFS.
The first two format with the ext3 file system. The above command will put our puppy into diskone.
You can change the directory name `lupu-525` to be any name you like, of course.

Taking advantage of GRUB, a logical partition will work too, and it will also be okay if you choose to format your partition with some other file system such as FAT.

## Installation and Configuration of GRUB

The next step is to install GRUB on the USB disk so that we can boot Puppy anywhere.
As is described on Wikipedia, the [boot process][boot-process] using GRUB can divide into two main stages: stage 1 and stage 2.
Stage 1 stores in the [MBR][mbr] of our hard disk. Its job is to load the next stage.
Before stage 2, stage 1 may have to load stage 1.5 which provides the drivers of the file system.
Stage 2 will then load the default configuration file and any other modules needed.

Assume that the portable drive we use is the second hard drive in our system, namely the `sdb` in Linux.
In GRUB, it will be named `(hd1)` instead (the first disk is named `(hd0)`). The first partition on `(hd1)` will be `(hd1,0)`, and `(hd1,1)` is the second, and so on.
From the above, we can see that Puppy's directory `lupu-525` stores in `(hd1,0)`. We will put GRUB's stage files and configuration files into `(hd1,0)` too.

### Installation

There are two ways to install GRUB onto a disk: 1) Using the `grub-install` script; 2) Using GRUB interactive shell. Below we explain respectively.

#### 1. Using the grub-install Script

To install GRUB on `(hd1,0)` (diskone in my case), type the following command:

``` bash
grub-install --boot-directory=/media/diskone/ /dev/sdb
```

This will install the GRUB files into directory `/media/diskone/boot/grub`, and the configuration file will be there too.

#### 2. Using GRUB Interactive Shell

GRUB provides a bash-like command line interface. This interface can be seen by pressing `c` on the graphical interface at the start of the boot procedure.
Here we will take advantage of an emulator of GRUB's command shell.

First, we can copy the existing GRUB files in our Linux system to the portable disk:

``` bash
cp -r /boot/grub /media/diskone/
```

Then, we install stage 1 to the MBR. Type `grub` after the Linux command prompt. In the GRUB shell popped up, issue this command:

``` text
grub> root (hd1,0)
grub> setup (hd1)
grub> quit
```

This will install the GRUB files into directory `/media/diskone/grub`, including the configuration file.

### Configuration

The default configuration file of GRUB in openSUSE or Debian/Ubuntu is named `menu.lst` in the `grub` directory.
But in Gentoo or Redhat/CentOS/Fedora, it is `grub.conf` instead.

If you install GRUB from Fedora and don't have a `grub.conf`, GRUB will not be able to find the default configuration file,
so the command line interface will be prompted when it started.
I encountered this problem after I reinstall GRUB stage 1 from Fedora without renaming my `menu.lst` generated by Debian's grub program to `grub.conf`.
In practice, it's recommended to have both configuration files. One of them could be a [symbolic link][s-link] of the other.

Here we provide a simple configuration file that could be used to boot Puppy we just installed.
You can use it directly by putting it into your grub directory, or add the kernel list to your own configuration file.

{% highlight text linenos %}
### Simple Configuration File to Boot Puppy
### DEFAULT OPTIONS
default		0
timeout		3
### KERNELS LIST
title Puppy Linux 525
kernel /lupu-525/vmlinuz ramdisk_size=256000 pmedia=usbflash psubdir=lupu-525
initrd /lupu-525/initrd.gz
{% endhighlight %}

You may want to install multiple Puppy Linux on your portable disk, e.g., an English version and a Chinese version.
This is pretty simple with GRUB. Just put Puppy files in different directories, then add proper kernel list into the above configuration file.

[puppylinux]:           http://puppylinux.org/
[puppylinux-inst]:      http://puppylinux.org/main/How%20NOT%20to%20install%20Puppy.htm
[grub]:                 http://www.gnu.org/software/grub/
[bootloader]:           http://en.wikipedia.org/wiki/Booting#Boot_loader
[linux-dist]:           http://en.wikipedia.org/wiki/Linux_distribution
[ramdisk]:              http://en.wikipedia.org/wiki/Ramdisk
[gnu-proj]:             http://www.gnu.org/
[puppy-down]:           http://puppylinux.org/main/Download%20Latest%20Release.htm
[mbr]:                  http://en.wikipedia.org/wiki/Master_boot_record
[boot-process]:         http://en.wikipedia.org/wiki/GNU_GRUB#Boot_process
[s-link]:               http://en.wikipedia.org/wiki/Symbolic_link
[chinese]:              /linux/2011/08/16/installing-grub-and-puppy-linux-to-portable-hard-drive-from-linux-chs/
[ram]:                  http://en.wikipedia.org/wiki/RAM
