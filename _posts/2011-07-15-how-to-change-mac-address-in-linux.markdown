---
layout: post
title: How to change MAC address in Linux
date: 2011-07-15 17:19:37
categories: [ linux ]
---

It's easy to change the MAC address in Linux.
We can use the command `ifconfig` to switch to a new MAC address temporarily
or change it permanently by editing the network configuration file.

<!-- more -->

### Temporary change of MAC address

Switch to root or use `sudo`, then:

``` bash
ifconfig eth0 down
ifconfig eth0 hw ether XX:XX:XX:XX:XX:XX
ifconfig eth0 up
```

where "eth0" is the name of your work device, and XX:XX:XX:XX:XX:XX is a new MAC address (same below).
The above commands will take effect immediately. But if we reboot the system, these changes will be lost.

### Permanent change of MAC address

To change the MAC address permanently, we have to edit the network configuration file.
In Red Hat/CentOS/Fedora, it is `/etc/sysconfig/network-scripts/ifcfg-eth0`:

``` bash
vi /etc/sysconfig/network-scripts/ifcfg-eth0
```

Comment out the line start with HWADDR, and then add a MACADDR line like this:

``` text
#HWADDR=XX:XX:XX:XX:XX:XX
MACADDR=YY:YY:YY:YY:YY:YY
```

To make the change take effect immediately, you should restart the network interface:

``` bash
/etc/init.d/network restart
```

In debian/ubuntu, the network interface configuration is in the file `/etc/network/interface`.
And the syntax is also different from those in a Redhat-like system.
But it is still easy to change the MAC address:

``` bash
vi /etc/network/interface
```

Add this line at the end of this file:

``` text
pre-up ifconfig eth0 hw ether XX:XX:XX:XX:XX:XX
```

Then restart the network subsystem:

``` bash
/etc/init.d/networking restart
```

