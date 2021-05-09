---
layout: post
title: Troubleshooting Debian 10 installation on Supermicro X9
tags:
  - debian
  - supermicro
permalink: /blog/:title
---

Interestingly, I encountered some roadblocks when installing Debian 10 on my Supermicro X9DRL-3F. I've been installing linux distros on many motherboards but this installation process has been the roughest I've had (in relative comparison to the past 'Just Works' installations).

This page only attempts to document my experience in case I ever need to perform reinstalls on the same motherboard.

## Resolving "grub-install dummy" fatal error

For me, this only happens when I opt to `Force UEFI` during the partition installation stage.

### Problem

The main issue with this is that `efivarfs` is not mounted, so the `debian-installer` fails when installing GRUB. When you encounter the following error:

```
Unable to install GRUB in dummy
Executing 'grub-install dummy' failed.
This is a fatal error.
```

```
Installing grub on 'dummy'
grub-install does not support --no-floppy
Running chroot /target grub-install  --force "dummy"
Installing for x86_64-efi platform.
grub-install: warning: Cannot read EFI Boot* variables.
grub-install: warning: read_file: could not read from file: Input/output error.
grub-install: warning: vars_get_variable: read_file(...) failed: Input/output error.
```

### Solution

In order to resolve this, simply mount `efivarfs` when the installation step fails by accessing the second console via `LAlt+F2` and running the following commands:

```shell
chroot /target
mount -t efivarfs efivarfs /sys/firmware/efi/efivars
grub-install
update-grub
```

_Optional: If you're preseeding, considering including this in your preseed file instead:_

```shell
d-i preseed/late_command string in-target sh -c "mount -t efivarfs efivarfs /sys/firmware/efi/efivars; grub-install; update-grub;" 
```

Once done, you can now `exit` the second console and return to the first console via `LAlt+F1`. Rerun the installation step for `grub-install` and everything should run smoothly.

## Resolving blank screen with cursor (WIP)

Upon installation completion, the next boot was met with this blank screen with cursor. I don't really know what the issue is, nor do i know for sure what command(s) solved the issue. So here's a list of commands I ran to make everything working again:

```shell
update-grub
```

```shell
sudo apt update
sudo apt upgrade
sudo apt install linux-firmware linux-firmware-nonfree
sudo apt install nvidia-driver  # Because I was using one
```

#### See Also:

[Debian Bug Report \#933523](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=933523)

[StackExchange Thread](https://unix.stackexchange.com/questions/541489/grub-fails-to-install-during-debian-10-installer-re-uefi-supermicro-motherboa)

## Resolving system suspending

Unbeknownst to me, the default system will automatically suspend. I did not encounter this behaviour in VMs, so it came as a surprise to me (although the Ubuntu desktop installations I've done follow this same behaviour). To avoid this, run the following command:

```shell
sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
```

Then restart or run the following command for changes to take effect:

```shell
sudo systemctl restart systemd-logind.service
```

References: [https://wiki.debian.org/Suspend\#Disable\_suspend\_and\_hibernation](https://wiki.debian.org/Suspend#Disable_suspend_and_hibernation)
