---
layout: post
title: Routing Settings when Bypassing Internet Censorship via VPN
date: 2011-08-07 16:30:44 +0800
categories: [ linux ]
---

Various techniques are in use by netizens in China to bypass the severe [Internet Censorship][gfw] by the government.
Among them, [Tor][tor], [SSH Tunneling][ssh-tunnel], and [VPN][vpn] are three of the safest and most popular solutions. I run a PPTP VPN service on a VPS in the US.

<!-- more -->

Usually, a VPN configuration is global. Once a VPN connection establishs, all network traffics will go through the VPN device.
But we may want to access the IP addresses in China directly, because they are surely not, and might never be, blocked by the `Great Firewall`.
Direct access is certainly faster than a VPN.

Fortunately, there is an open source project called [Chnroutes][chnroutes] which is designed to solve this problem for us.
This project provides a Python script, which sifts IP addresses in China from the file ['country-ipv4.lst'][ipv4-list] by the [APNIC][apnic],
and generate from these IP addresses two bash scripts, which can be used to set/unset kernel route table before/after a VPN connection is established/disconnected.

Take PPTP VPN for example. First, we can download the Python script [`chnroutes_ovpn_linux`][ovpn-script] to your Linux box, add execution permission and then fire it:

``` bash
chmod +x chnroutes_ovpn_linux
./chnroutes_ovpn_linux
```

This generates two scripts, `vpnup` and `vpndown`, in the current directory. We add execution permission to them:

``` bash
chmod +x vpnup vpndown
```

Next, we rename them and copy them to ppp's configuration directory:

``` bash
cp vpnup /etc/ppp/ip-pre-up
cp vpndown /etc/ppp/ip-down.local
```

After that, we have to disconnect and reconnect from our VPN. And now, all network traffics between you and those Chinese IPs will no longer go into the VPN tunnel.

Chnroutes supports both openVPN and PPTP, and it works on Mac, Linux, and Windows. I am using it on Fedora 14 with PPTP VPN. It works very well.

(本文中文版[链接][chinese])

[gfw]:                  http://en.wikipedia.org/wiki/Internet_censorship_in_the_People%27s_Republic_of_China
[tor]:                  https://www.torproject.org/
[ssh-tunnel]:           http://en.wikipedia.org/wiki/Tunneling_protocol#Secure_Shell_tunneling
[vpn]:                  http://en.wikipedia.org/wiki/Virtual_private_network
[pptp-vpn]:             /linux/2011/07/04/pptp-vpn/
[chnroutes]:            http://code.google.com/p/chnroutes/
[apnic]:                http://www.apnic.net/
[ipv4-list]:            http://ftp.apnic.net/apnic/dbase/data/country-ipv4.lst
[ovpn-script]:          http://code.google.com/p/chnroutes/downloads/detail?name=chnroutes_ovpn_linux
[chinese]:              /linux/2011/08/08/route-by-ip-addresses-when-using-vpn-to-bypass-internet-censorship-chs/
