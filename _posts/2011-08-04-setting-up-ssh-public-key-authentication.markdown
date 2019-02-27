---
layout: post
title: Setting up SSH Public Key Authentication
date: 2011-08-04 17:40:49 +0800
categories: [ linux ]
---

Compared to the password authentication, it's more convenient and more secure to log into a remote Linux box over SSH by the public key authentication.
With this technique, we can perform an automatic login without entering any password. It is very useful when we call ssh from a shell script.
In this post, we show how to setup SSH public key authentication between two Linux hosts.

<!-- more -->

## Overview

The public key authentication bases on the [Public Key Encryption][pubkey-crypto]. This kind of cryptographic system requires a pair of encryption keys,
the `Public Key` and the `Private Key`. Messages encrypted with the private key can only be decrypted by the public key and vice versa.

We usually keep our private key on our local machine and put the public key on our remote hosts.
When we issue a login to the remote host, it sends us back a message encrypted with the public key.
Then we have to prove that we can decrypt it using our private key before we gain access to the remote host.

## Setup Steps

Here is a simple guide on how to set up public key authentication on Linux.

### Generate Keys

First, we should generate a pair of public/private keys on our localhost:

``` bash
ssh-keygen -t rsa
```

Here we use the RSA algorithm. You could also use DSA if you prefer. The keys will store as `id_rsa` and `id_rsa.pub` in our `~/.ssh` directory.
And as you might expect, the one with the suffix `.pub` is the public key.

### Install Public Key on Remote Host

Then we can put the public key to our remote hosts. Before we do this, we have to ensure that we have a `~/.ssh` directory on our remote host.
If it doesn't exist, we can simply run the above ssh-keygen command, and it will create it with the correct permissions
(which should be 700 if you choose to create it manually). Then we can transfer our public key generated on our local host to this directory.

In Linux, we are running OpenSSH by default. So we follow the OpenSSH standard and save our public key in file `~/.ssh/authorized_keys2` (see the *AuthorizedKeysFile* in `/etc/ssh/sshd_config`). CHECK IF THIS FILE EXISTS FIRST.
If it does, we should append our new public key to it instead of overwriting it.
If it doesn't, we can issue the following command from our localhost:

``` bash
scp ~/.ssh/id_rsa.pub username@host_address:.ssh/authorized_keys2
```

It will copy the local file `~/.ssh/is_rsa.pub` to `~/.ssh/authorized_keys2` to the remote host.

### Log into the Remote Host

Now we can SSH to our remote host without entering a password.
If you want to log back into the localhost from the remote one,
just change the roles of this two machines and do the same work again.

[pubkey-crypto]:        http://en.wikipedia.org/wiki/Public-key_cryptography
