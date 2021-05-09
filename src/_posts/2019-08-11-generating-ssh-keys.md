---
layout: post
title: Generating SSH keys
tags:
  - ssh
permalink: /blog/:title
---

## Prerequisites

Make sure that you have SSH installed. To check, simply run the following command:

```sh
ssh -V
```

## Creating SSH Keys

Without going into much detail about the different algorithms, you should look to create keys in either `RSA` or `Ed25519` algorithm. 

#### Ed25519

```sh
ssh-keygen -t ed25519 -a 100
```

#### RSA

```sh
ssh-keygen -t rsa -b 4096 -a 100
```
