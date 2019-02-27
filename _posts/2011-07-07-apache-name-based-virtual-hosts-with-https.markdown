---
layout: post
title: "Apache 的 Name-based Virtual Hosts 添加 HTTPS 支持"
date: 2011-07-07 08:47:28 +0800
categories: [ linux ]
---

本文介绍 Apache 使用 Name-based Virtual Hosts 建立多个站点时，如何为各个站点添加 HTTPS 支持，
以及如何制作或申请免费的 SSL 证书，还有在 Wordpress 中如何启用 HTTPS 来保护需要加密的页面。

<!-- more -->

## 概览

* SSL 与 HTTPS 简介
* Apache Name-based Virtual Hosts 对的 SSL 支持
* 申请免费的个人 SSL 证书
* Wordpress 中启用 HTTPS

## 正文

### SSL 与 HTTPS 简介

SSL 是 Secure Sockets Layer 的简称，最早由著名的网景公司开发，是一种传输层加密协议。
SSL 使用公钥密码技术中的数字证书技术来加密互联网上的通信，如果想深入了解具体的加密技术，可以参考 Wikipedia 上关于 [Public-key Cryptography][public-key] 的词条。
SSL 工作于传输层，传输层以上的高层协议诸如 HTTP、FTP 与 Telnet 等可以在其基础上实现加密通信，我们常见的 HTTPS 就是 SSL 技术与 HTTP 结合的一种应用。

HTTP 协议是不安全的，攻击者通过监听或者中间人攻击等手段，可以窃取用户的帐户密码等信息。
而 HTTPS 则可以通过在 HTTP 协议之前使用 [SSL/TLS][ssl-tls] 加密，来保护通信的安全。
HTTPS 不是一个单独的协议名称，它可以看作是建立在 SSL/TLS 加密之上的 HTTP 协议。
如果想要了解 HTTPS 使用的 Certificate Authority(CA)，可以参考 Wikipedia 的 [Certificate Authority][c-a] 这个词条。

由于 HTTPS 建立在 SSL 之上，因此在进行 HTTP 请求之前，客户端需要先与服务器完成 SSL 握手，然后才利用 SSL 握手这一步达成的加密方案进行对 HTTP 会话的加密。

### Apache Name-based Virtual Hosts 对 SSL 的支持

使用 Apache 实现虚拟主机(Virtual Hosts)，可以基于 IP(IP-based)，也可以基于域名 (Name-based)。
基于域名的虚拟主机可以将几个不同站点建立在同一个 IP 之上，是一种非常便宜实用的虚拟主机方案。
本站和我几个朋友的站点，就是建立在基于域名的虚拟主机之上。过去，基于域名的虚拟主机一度不能支持其上所有站点 HTTPS。

#### 存在的问题及解决方法

上文说过，使用 HTTPS 访问 Web 时，客户端与服务器要先完成 SSL 握手，然后才进行 HTTP 通信。
在 [SNI(Server Name Indication)][sni] 技术之前，由于 SSL 协议的设计限制，SSL 在知晓服务器的域名之前就要完成数字证书的选择和获取，
因此 HTTPS 不能用于 Name-based Virtual Hosts。
SNI(Server Name Indication) 是 SSL/TLS 协议的一种扩展特性，它通过将域名作为加密握手过程中协商内容的一部分，
允许服务器在通信早期就知道客户端请求的域名，来选择使用合适的数字证书。

Apache 中实现 SSL 安全 Web，需要使用模块 `mod_ssl`，这个模块提供了到 openssl 的接口。
由于 openssl 在 0.9.8f 以后才支持 SNI 这个 TLS Extensions (编译 openssl 时要加入 `enable-tlsext`)，因此 Apache 编译时需要指定与 0.9.8f 或更高版本的 openssl，
才能启用 SNI 特性，实现各个 Virtual Host 站点使用不同数字证书的 HTTPS。

其实在 `mod_ssl` 不支持 SNI 的情况下，也有两种方式可以实现 Virtual Hosts 的 HTTPS。
一种是使用 [`mod_gnutls`][mod-gnutls]，这个模块与 `mod_ssl` 提供类似的指令来实现 HTTPS，它使用的不是 openssl；
另一种是使用 Wildcard SSL Certificate，这种证书可以匹配一个域名的所有二级域名，
例如申请 '\*.gnailuy.com' 的证书，就可以在 'www.gnailuy.com'、'blog.gnailuy.com' 等所有二级域名下的站点上使用，
但我没有找到免费的 Wildcard SSL Certificate，而且这种证书只匹配所有二级域名，
无法解决域名不同的问题，以后我的朋友们可能会使用他们自己的域名，因此我们没有采用这种证书。

目前我使用的 CentOS 5.6 已经是最高版本了，而且也 `yum update` 更新到了最新，但是其中自带的 openssl 却是 0.9.8e。
因此 yum 安装的 Apache 并不支持 SNI，也就不能实现不同站点使用不同证书。

譬如我在 [StartSSL.COM][startssl] 申请了 ['gnailuy.com'][myblog] 和 ['www.gnailuy.com'][wwwblog] 的证书，
使用 HTTPS 访问这两个站点时，只要浏览器中信任了 StartCom Ltd. 他们公司发行的证书（我只用 Firefox 访问过，默认已经信任这家公司），就不会收到关于证书的警告。
但是由于我们暂时还是使用的 `yum` 安装的 Apache，不支持 SNI，因此虽然我在配置文件中为
['louxiu.gnailuy.com'][louxiu] 等几个站点指定的是我们自己手工生成的证书（Untrusted），但他们仍然使用的是 gnailuy.com 的证书（虚拟主机中的第一项配置）。
这表现在用 HTTPS 访问这个站点时，证书不被信任的提示是 `ssl_error_bad_cert_domain`
（客户端拿到的证书认证的是 'gnailuy.com' 和 'www.gnailuy.com'，而不是 'louxiu.gnailuy.com'，因此提示域名不符），
而不是 `sec_error_untrusted_issuer` （如果正确拿到了我们自己手工生成的证书，因为证书是不被信任的，应该会有这个提示）。

#### CentOS 中配置各个虚拟主机的 HTTPS

由于现在（2011-07-07）最新版的 CentOS 中使用的 openssl 版本仍然太低，因此只能通过自己编译 openssl，并利用新版的 openssl 来编译 Apache，
才能在 Virtual Hosts 中使用不同的 SSL 证书。
我在一台测试机器上编译并配置好了一个新的 Apache 和 openssl，可以支持 SNI，但由于没有进行充分测试，还没有在这台 VPS 上使用自己编译的 Apache。
不过 SSL 证书的问题已经解决了，在这里介绍一下。

##### CentOS 中编译支持 SNI 的 Apache 和 openssl

编译这部分内容参考的是 [Milo&scaron; Žikić][milos] 在他博客里的[这篇文章][ssl-sni]。

首先，先卸载旧的 apache 和 openssl 头文件：

``` bash
yum remove {httpd,openssl}-devel
```

然后到[这里][openssl]下载最新版的 openssl（标记 LATEST 的）并解压，按照经典的三部曲编译安装之：

``` bash
wget http://www.openssl.org/source/openssl-1.0.0d.tar.gz
tar xzvf openssl-1.0.0d.tar.gz
cd openssl-1.0.0d
./configure
make
make install
```

上面的安装将 openssl 安装到了 `/usr/local/ssl` 中，其中 `/usr/local/ssl/bin/openssl`
是 openssl 的可执行文件，可以将它拷贝到 /usr/bin/openssl 来替换旧版的 openssl，当然替换之前我按惯例做了备份。

接下来到[这里][apache]在离你最近的镜像里下载最新的 Apache，按照你的需要编译安装到 `/usr/local/apache2` 中：

``` bash
wget http://labs.renren.com/apache-mirror//httpd/httpd-2.2.19.tar.gz
tar xzvf httpd-2.2.19.tar.gz
cd httpd-2.2.19
```

我按照 [Milo&scaron; Žikić][milos] 提供的参数完成了编译并成功运行了 Apache，但是在没有完全理解所有参数含义之前，我觉得还是不在这台 VPS 上启用新的 Apache 比较好一点。
编译中就使用了 `/usr/local/ssl` 中新安装的 openssl 的代码，这些 openssl 的代码用于编译 `mod_ssl` 模块：

``` bash
./configure --enable-so --enable-ssl --with-ssl=/usr/local/ssl \
    --enable-auth-anon \
    --enable-auth-dbm \
    --enable-auth-digest \
    --enable-cache \
    --enable-cern-meta \
    --enable-charset-lite \
    --enable-dav \
    --enable-dav-fs \
    --enable-deflate \
    --enable-disk-cache \
    --enable-expires \
    --enable-ext-filter \
    --enable-file-cache \
    --enable-headers \
    --enable-info \
    --enable-logio \
    --enable-mem-cache \
    --enable-mime-magic \
    --enable-isapi \
    --enable-proxy \
    --enable-proxy-connect \
    --enable-proxy-ftp \
    --enable-proxy-http \
    --enable-rewrite \
    --enable-speling \
    --enable-unique-id \
    --enable-usertrack \
    --enable-vhost-alias
make
make install
```

安装完成后，新的 Apache 被安装到了 `/usr/local/apache2` 这个目录中。

##### Apache Name-based Virtual Hosts 中的 SSL 设置

安装完新的 Apache，接下来就可以对它进行配置了。由于新的 Apache 安装在 `/usr/local/apache2` 目录下，因此其配置文件也在这个目录中。

首先是Apache的主配置文件 `conf/httpd.conf`。

由于我们要使用 Virtual Hosts，因此先把全局的 ServerAdmin、ServerName、DocumentRoot 等指令注释掉，
对全局 DocumentRoot配置的 `<Directory>...</Directory>` 指令块也要整个注释掉。其他诸如 ErrorLog 等也可以在 VirtualHost 的指令块中配置，可以按照自己的需要注释掉它们。

然后，可以在主文件中使用 NameVirtualHost 指令在 HTTP 的 80 和 HTTPS 的 443 端口打开 Name-based Virtual Hosts。

接下来是对各个虚拟主机的配置，包括 HTTP 和 HTTPS 的虚拟站点。我的建议是把虚拟主机的配置和 SSL 的配置都放在单独的配置文件里，然后在主配置文件中使用 Include 指令包含进来：

``` apache
......
NameVirtualHost *:80
NameVirtualHost *:443
Include conf.d/ssl.conf
Include conf.d/vhost.d/vhost.conf
Include conf.d/vhost.d/ssl.vhost.conf
```

其中 `conf.d` 和 `conf.d/vhost.d` 目录是在 `/usr/local/apache2` 目录下手动建立的，专门放置配置好的虚拟主机和 SSL 配置文件。

`ssl.conf` 从默认自带的 `/usr/local/apache2/conf/extra/httpd-ssl.conf` 文件修改而来，注释掉了 `<VirtualHost>...</VirtualHost>` 指令块，
因为这些内容我们将在 ssl.vhost.conf 文件中配置。

`vhost.conf` 文件中就是常规 HTTP 上的 Virtual Host 配置，例如其中一个虚拟主机的配置块：

``` apache
<VirtualHost *:80>
ServerAdmin username@server.com
DocumentRoot /path/to/web/DocumentRoot
ServerName gnailuy.com
ServerAlias www.gnailuy.com blog.gnailuy.com
ErrorLog logs/gnailuy.com-error_log
CustomLog logs/gnailuy.com-access_log common
<Directory "/path/to/web/DocumentRoot">
Options Indexes FollowSymLinks
AllowOverride All
Order allow,deny
Allow from all
</Directory>
</VirtualHost>
......
```

其他虚拟主机的 HTTP 配置也是类似的配置块。

`ssl.vhost.conf` 的配置指定在 HTTPS 的 443 端口为哪些主机使用哪些证书和哪些私钥，这些证书和私钥如何获得的问题会在下一节介绍。
这个配置文件中比较重要的几个指令如下：

``` apache
<VirtualHost *:443>
DocumentRoot "/path/to/web/DocumentRoot"
ServerName gnailuy.com:443

SSLEngine on
SSLCertificateFile /path/to/gnailuy.com.crt
SSLCertificateKeyFile /path/to/gnailuy.com.key.unprotected
SSLCertificateChainFile /path/to/sub.class1.server.ca.pem
......
</VirtualHost>
```

DocumentRoot 和 ServerName 与 HTTP 的 Virtual Host 配置类似，本文的重点在于后面四条指令。
SSLEngine 指示打开 SSL 引擎，后面三个指令分别指示 SSL 的证书文件（gnailuy.com.crt）、解密了的私钥 Key 文件（gnailuy.com.key.unprotected）
和中级证书（sub.class1.server.ca.pem）。

其他 Virtual Host 的配置也类似，只是 SSL 系列指令指向不同的证书即可。在不支持 SNI 的机器上这样配置 Apache 也可以运行，
但第一个 Virtual Host 后面指定的证书都不会被使用，所有站点都会使用第一个 Virtual Host 的证书，这样就解释了上面 'louxiu.gnailuy.com' 出现 `ssl_error_bad_cert_domain` 的现象。

在这些指令块中还需要配置其他的内容，我也没有全部明白，这里就不粘贴出来了。
我目前是使用默认的配置文件进行修改，测试机上服务器可以运行，只是还没有研究清楚细节，所以就没布署，而且我觉得 CentOS 中的 openssl 与 SNI 要求的 openssl 只差一个小小的版本号，
如果不久后能更新了最好。

### 申请免费的个人 SSL 证书

上面配置中用到的文件中，SSLCertificateFile 是 SSL 证书，SSLCertificateKeyFile 是私钥，这两个可以自己生成，也可以向证书颁发机构购买。
区别是自己生成的证书不会默认就被大多数浏览器信任，用户访问时会提示 Untrusted Connection 的错误。
而可信的证书颁发机构提供的证书则可以被大多数浏览器默认信任，SSL 机制中，客户端会信任它信任的证书颁发机构颁发的证书，因此也就不会出现 Untrusted Connection 的提示了。
如果是向证书颁发机构购买的证书，则还需要下载他们的对应的 Intermediate Server CA Certificate，也就是上面指定的 SSLCertificateChainFile，这个文件通俗点说，
就是告诉客户谁是我的证书提供商，如果是自己做的证书，那么自然没有这个文件也无需这项配置了。

对于个人用户，如果是内部使用或者测试，自己生成的数字证书就可以了。通常企业用户会向一些大的证书颁发机构申请数字证书，当然也会花费不菲。
但是也有诸如 [StartSSL.COM][startssl] 这种可以提供免费证书的颁发机构。缺点是 StartSSL.COM 的免费证书（Class 1）不支持 Wildcard，只能绑定一个二级域名，
要使用 Wildcard 需要购买他们的 Class 2 收费证书。

自己制作证书的过程网络上非常多，例如 openssl 官网上的 [这篇 HowTo][sslhowto]，其他资料 Google 里多的是，就不再赘述。

到 StartSSL 申请证书，也非常容易，记得最好使用 Firefox 浏览器，据说可以避免很多麻烦：

1. 在 StartSSL 的 [Products 页面][start-prod]选择第一项 StartSSL Free；
2. 在进入的 Authenticate or Sign-up? 这个页面先 Sign-up，注册时所有的信息都要填写；
3. 上述信息填写完毕后 StartSSL 会向你的邮箱里发送一个 verification code，进入你的邮箱找到这个验证码；
4. 输入验证码后，StartSSL 就会开始审核你的资格，不出意外的话审核非常快，我注册完三分钟就通过了；
5. 审核通过后你又会在邮箱中收到一封邮件，里面有个链接，点击进入你的账户；
6. StartSSL 只支持使用数字证书登录他们的网站，因此点击这个链接进入账户后，会为你生成一个数字证书，浏览器会提示你将这个数字证书安装到 Firefox 中，用来在 StartSSL 网站认证你的身份，最好为这个证书做一个备份，你懂的；
7. 登录账户后，进入你的 Control Panel，这里有三个选项卡：工具箱 Tool Box、证书向导 Certifications Wizard 和验证向导 Validations Wizard；
8. 首先进入 Validations Wizard，选择 Domain Name Validation 验证你的域名，在填写域名的对话框里只填写根域名，例如 'http://gnailuy.com/' 就填写 gnailuy，后面的下拉菜单选择 com；
9. 下一步 StartSSL 会让你选择一个此域名 whois 信息中的邮箱，他们会向这个邮箱发送一封邮件，验证你对这个域名的拥有权；
10. 到邮箱收取邮件，复制里面的 verification code，用这个 code 证明你拥有这个域名；
11. 然后进入 Certifications Wizard，选择 Web Server SSL/TLS Certification 为你的 Web 申请证书，申请证书的前提是你拥有私钥，这个私钥可以让 StartSSL 为你生成（第 12 步），也可以自己使用 openssl 生成（第 14 步）；
12. 私钥文件可以使用一个密码来保护它，如果想让 StartSSL 替你生成私钥，就在 Key Password 中填入你的密码，点击 Continue 继续，然后复制生成的私钥，保存到纯文本文件中，最好命名成例如 `gnailuy.com.key` 这样的名字方便辨识，其实这几个文件的文件名是什么都不重要，只要是纯文本就行了；
13. 需要注意的是，这样生成的私钥是加密的，如果直接在 Apache 中使用，每次启动 Apache 时都会让你输入上一步输入的密码，很麻烦，实践上可以使用解密的私钥文件，要获得解密的私钥文件，可以使用 Tool Box 左侧的 Decrypt Private Key，也可以直接用 openssl 程序解密：`openssl rsa -in gnailuy.com.key -out -gnailuy.com.key.unprotected`，上一节配置文件中的 unprotected 私钥就是这么来的；
14. 如果你自己[使用openssl生成私钥][sslhowto]，并使用这个私钥生成 certificate request(CSR) 文件，可以点击 Skip 跳过生成私钥这一步，并将你的 CSR 文件粘贴到接下来的文本框中继续；
15. 有了私钥，就可以继续申请证书了，StartSSL 的免费证书只能添加一个二级域名，例如我添加了 www，这个证书就对 'http://gnailuy.com/ 和 'http://www.gnailuy.com/' 有效；
16. 提交了证书申请的请求后，他们提示需要等待几个小时，其实我当时没多久就在 Tool Box 左侧的 Retrieve Certificate 中发现了我的证书，保存这个证书为纯文本文件 `gnailuy.com.crt`；
17. 上一节中配置的 crt 证书文件和 key 私钥文件都已经有了，如果 Apache 只配置这两个文件，Firefox 访问时还会提示 Untrusted Connection，这是因为没有指定 SSLCertificateChainFile，这个文件可以在 Tool Box 左侧的 StartCom CA Certificates 中找到，我使用的是免费的 Class1，当然下载的是 [Class 1 Intermediate Server CA][start-c1ca] 这个文件。

上述申请和配置完成后，就可以使用 HTTPS 访问这个站点了，当然之前别忘了在防火墙上放行 HTTPS 使用的 443 端口：

``` bash
iptables -A INPUT -p tcp -m tcp --dport 443 -j ACCEPT
```

### Wordpress 中启用 HTTPS

如果强制全站启用 HTTPS，可以保证足够的安全，但同时也会造成访问速度下降。因此这里采用的方案是只强制需要较强安全性的页面使用 HTTPS，其他页面默认都是 HTTP。

#### Login 页面和后台 Admin 界面

Wordpress 中 Login 页面与后台 Admin 页面的安全要求不言而喻，Wordpress 本身对这些页面也有比较方便的机制启用 HTTPS。
Wordpress 官方的[这篇文档][wp-ssl]中介绍了如何通过定义 FORCE\_SSL\_LOGIN 和 FORCE\_SSL\_ADMIN 这两个变量强制启用 HTTPS，只需要编辑 `wp_config.php` 文件，在

``` php
...
/* That's all, stop editing! Happy blogging. */
...
require_once(ABSPATH . 'wp-settings.php');
```

这段代码之前，添加一句

``` php
define('FORCE_SSL_LOGIN', true);
```

就可以强制在登录页面使用 HTTPS，或者添加一句

``` php
define('FORCE_SSL_ADMIN', true);
```

就可以强制在登录页面和后台管理页面使用 HTTPS。这里我添加的是后者，Login 和全部 Admin 页面都使用 HTTPS。

#### Posts 和 Pages

一般情况下，加密到上面的程度就可以大大提高安全级别了，但是如果有特殊要求，需要强制某些文章或页面使用 HTTPS，一个一个修改源代码的方式就比较繁琐了。
不过 Wordpress 的一个强大之处就在于众多的插件，有关 SSL 的插件非常多，我试用了几个，找到一个我认为比较好的，叫做 [Wordpress HTTPS][wp-https]。

这个插件安装以后，可以在文章的 Publish 按钮上面增加一个叫做 Force SSL 的 Check Box，发表文章或者页面之前勾上这个 Check Box 的话，就会强制这篇文章使用 HTTPS 了。

[public-key]:   http://en.wikipedia.org/wiki/Public-key_cryptography
[ssl-tls]:      http://en.wikipedia.org/wiki/Transport_Layer_Security
[c-a]:          http://en.wikipedia.org/wiki/Certificate_authority 
[sni]:          http://en.wikipedia.org/wiki/Server_Name_Indication
[mod-gnutls]:   http://www.outoforder.cc/projects/apache/mod_gnutls/
[startssl]:     http://www.startssl.com/
[myblog]:       https://gnailuy.com/
[wwwblog]:      https://www.gnailuy.com/
[louxiu]:       https://louxiu.gnailuy.com/
[milos]:        http://www.blogger.com/profile/10466148175449405984
[ssl-sni]:      http://miloszikic.blogspot.com/2010/11/apache-and-namebased-ssl-vhosts-with.html
[openssl]:      http://www.openssl.org/source/ 
[apache]:       http://httpd.apache.org/download.cgi
[sslhowto]:     http://www.openssl.org/docs/HOWTO/certificates.txt
[start-prod]:   https://www.startssl.com/?app=39
[start-c1ca]:   https://www.startssl.com/certs/sub.class1.server.ca.pem
[wp-ssl]:       http://codex.wordpress.org/Administration_Over_SSL
[wp-https]:     http://wordpress.org/extend/plugins/wordpress-https/
