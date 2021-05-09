---
layout: post
title: Setting up UnattendedUpgrades on Debian 10
tags:
  - debian
  - unattendedupgrades
---

## Step 1: Install dependencies

Make sure you have `unattended-upgrades` and `apt-listchanges` installed on your system:

```shell
sudo apt update
sudo apt upgrade -y
```

```shell
sudo apt install unattended-upgrades apt-listchanges
```

## Step 2: Setup configuration

Run the following commands to setup `unattended-upgrades`:

```shell
echo unattended-upgrades unattended-upgrades/enable_auto_updates boolean true | sudo debconf-set-selections
```

```shell
sudo dpkg-reconfigure -f noninteractive unattended-upgrades
```

Check that auto update was correctly setup:

```console
$ cat /etc/apt/apt.conf.d/20auto-upgrades
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```
