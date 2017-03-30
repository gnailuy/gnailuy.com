--- 
layout: post
title: Install CentOS via network without CD-ROM and without USB
date: 2011-12-25 23:03:40 +0800
categories: [ linux ]
---

There was an extremely old PC in our lab and one day I wanted to use it as a node in our Hadoop cluster.
There was a Fedora 8 on it. But I'd like to change it to a new CentOS 5.7. The problem I met, was that this PC was too old,
that neither the CD-ROM nor the USB ports worked well.

<!-- more -->

Seems troublesome. But I still found a way to install my new CentOS on it, without CD-ROM, without USB and without any external bootable device.
I used net-installation!
You might argue that even with net-installation, I still need an CD or USB disk, with the net-install ISO image on it, to boot up at the very begining.
But I was able to take the GRUB on that old Fedora 8 in use, and booted the net-install kernel. Here's how.</p>

First, I downloaded the net-install image in the old OS, and checked its MD5 hash:

``` bash
wget http://mirrors.163.com/centos/5.7/isos/i386/CentOS-5.7-i386-netinstall.iso \
    http://mirrors.163.com/centos/5.7/isos/i386/md5sum.txt
diff <(grep "netinstall" md5sum.txt) <(md5sum CentOS-5.7-i386-netinstall.iso) && echo OK
```

Then I extracted the `isolinux` directory in the ISO file to the `/boot` directory. Here I put `isolinux` in the `boot` directory just for convenience.
Because this is the default root directory of GRUB after we boot in to the GRUB CLI.

``` bash
mkdir tmp
mount -o loop CentOS-5.7-i386-netinstall.iso tmp/
cp -Rv tmp/isolinux/ /boot/
```

After that, I issued a reboot and pressed `c` on the GRUB menu to enter the GRUB CLI. The below commands can boot the kernel in the `isolinux` directory.

``` text
kernel /isolinux/vmlinuz
initrd /isolinux/initrd.img
boot
```

If the `isolinux` directory was in other partitions of your hard drive, you may need to specify the root path of GRUB using the `root` command.

The system booted up to the installation image just like I inserted the net-install disk into the CD-ROM.
On the 'Installation Method' screen, I chose HTTP or FTP and then configured the network.
Next, I chose a mirror site (a self-hosted mirror site will be faster) which host CentOS files. The remain steps were the same with a ordinary installation.

（本文中文版[链接][chinese]）

[chinese]:      /linux/2011/12/26/install-centos-via-network-without-cd-rom-and-without-usb-chs/
