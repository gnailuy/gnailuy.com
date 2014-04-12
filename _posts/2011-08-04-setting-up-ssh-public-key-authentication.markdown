--- 
layout: post
title: Setting up SSH Public Key Authentication
date: 2011-08-04 17:40:49
categories: [ linux ]
---

Compared to the password authentication, it's more convenient and more secure to login to remote linux box over SSH by public key authentication.
With this technique, we can easily perform an automatic login without entering any password. This is usually very useful when we want to call ssh within a shell script.
In this post we show how to setup SSH public key authentication between two Linux hosts.

<!-- more -->

## Overview

Public key authentication is based on [Public Key Encryption][pubkey-crypto]. This kind of cryptographic system requires a pair of encryption keys,
the "Public Key" and the "Private Key". Messages that are encrypted with the private key can only be decrypted by the public key, and vice versa.

We usually keep our private key on our local machine, and put the public key on our remote hosts.
When we issue a login to the remote host, it sends us back a massage encrypted with the public key.
Then we have to prove that we can decrypt it using our private key before we gain access to the remote host.

## Setup Steps

Here is a simple guide on how to set up public key authentication on Linux.

### Generate Keys

First, we should generate a pair of public/private keys on our local host:

``` bash
ssh-keygen -t rsa
```

Here we use the RSA algorithm. You could also use DSA if you prefer. The keys will be stored as `id_rsa` and `id_rsa.pub` in our `~/.ssh` directory.
And as you might expect, the one with the suffix `.pub` is the public key.

### Install Public Key on Remote Host

Then we can put the public key to our remote hosts. Before we do this, we have to ensure that we have a `~/.ssh` directory on our remote host.
If it doesn't exist, we can simply run the above ssh-keygen command, and it will create it with the correct permissions
(which could be 700 if you choose to create it manually). Then we can transfer our public key generated on our local host to this directory.

In Linux, we are running OpenSSH by default. So we conform the OpenSSH standard and save our public key in file `~/.ssh/authorized_keys2` (see the *AuthorizedKeysFile* in `/etc/ssh/sshd_config`). Check if this file exists. If it does, we should append our new public key to it instead of overwriting it.
But if it doesn't, we can issue the following command on our local host:

``` bash
scp ~/.ssh/id_rsa.pub username@host_address:.ssh/authorized_keys2
```

This will copy the local file `~/.ssh/is_rsa.pub` to `~/.ssh/authorized_keys2` on the remote host.

### Login to the Remote Host

Now we can SSH to our remote host without entering password. If you want this to be archived from the remote host back to our local host,
just change the roles of this two machines and do the above work again.

[pubkey-crypto]:        http://en.wikipedia.org/wiki/Public-key_cryptography
