--- 
layout: post
title: Spoofing MAC address in Archlinux
date: 2011-10-19 07:51:40 +0800
categories: [ linux ]
---

The first issue I met, after I logged in to my newly installed Arch Linux, is that I had to change the MAC address to gain access to our campus network.
I have a short essay [here][linux-mac] about how to change the MAC address in Linux.
In that article, I introduced how to change the MAC address temporarily using [ifconfig][ifconfig],
and how to permanently editing the network configure file in Red Hat/CentOS/Fedora or Debian/ubuntu.
But I found no `ifconfig` available in my new Arch Linux (I must had missed some essential package that provides `ifconfig` during the installation.).
So I had to find another method, and fortunately, there is an "Arch Way".

<!-- more -->

(本文中文版[链接][chinese])

According to the [Arch Wiki][archwiki], we can use [`macchanger`][macchanger] or [`ip`][ip] to make a temporary change of MAC address:

``` bash
macchanger --mac=XX:XX:XX:XX:XX:XX
```

or

``` bash
ip link set dev eth0 down
ip link set dev eth0 address XX:XX:XX:XX:XX:XX
ip link set dev eth0 up
```

where `eth0` is the name of my wired network device. I didn't have `macchanger` installed on my system, so I used the second method above.
After we can access the Internet. You may want to install a `macchanger` using `pacman`.
It can even give a random MAC address to a device with the `r` parameter, very interesting.

Using the above two methods, the new MAC address will return to its initial default value after reboot.
In order to spoof MAC address on boot, Arch Wiki gives an Arch Way. We can create this file `/etc/rc.d/functions.d/macspoof` with the following content in it:

``` bash
spoof_mac() {
    ip link set dev eth0 address XX:XX:XX:XX:XX:XX
}
add_hook sysinit_end spoof_mac
```

This file add a hook at the end of system initial process with a function which use the `ip` command to change the MAC address on system boot.

[linux-mac]:        /linux/2011/07/16/how-to-change-mac-address-in-linux/
[ifconfig]:         http://en.wikipedia.org/wiki/Ifconfig
[chinese]:          /linux/2011/10/19/spoofing-mac-address-in-archlinux-chs/
[archwiki]:         https://wiki.archlinux.org/index.php/MAC_Address_Spoofing
[macchanger]:       http://www.alobbs.com/macchanger
[ip]:               http://linux.die.net/man/8/ip
