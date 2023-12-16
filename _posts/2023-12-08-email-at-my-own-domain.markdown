---
layout: post
title: "Email address at my own domain"
date: 2023-12-08 12:00:00 +0800
categories: [ me ]
---

Enabled my own email address `@gnailuy.com` using Cloudflare and Gmail for free.
Here is a brief note.

<!-- more -->

## Step 1

My domain name is hosted in Cloudflare and they support **Email routing**.
I need only one email address so I just added a custom address
and setup a custom routing to forward all emails sent to here to my Gmail inbox.

<center>
{% image fullWidth cloudflare_dashboard.png alt="Cloudflare dashboard" %}
</center>

To this point, I can receive emails with my address but cannot send email from it.
I need an SMTP server to do this and thanks to Gmail they offer free SMTP.

## Step 2

To send or reply mail from my address, I can add my new email address as an alias in Gmail.
Follow the below steps to use Gmail's SMTP.

1. Make sure my 2FA is enabled on my Google account.
2. Go to my [Google Account][google-account] to create an **App Password** for later use.
3. Open [Gmail settings][gmail-settings] and find: `Settings` -> `Accounts and Import` -> `Send mail as`.
4. Add my new email address and check the `Treat as an alias` option.
5. In the next step, use the below information:

| Key | Value |
|:---:|:-----:|
| SMTP Server | smtp.gmail.com:587 |
| Username | My Gmail address |
| Password | The new App Password I just created |

Keep the default TLS option checked.


[google-account]:   https://myaccount.google.com/apppasswords
[gmail-settings]:   https://mail.google.com/mail/u/0/#settings/accounts

