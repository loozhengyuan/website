---
layout: post
title: Installing ZFS on Linux
tags:
  - zfs
  - linux
---

## Installation

WIP

#### See Also

[https://docs.oracle.com/cd/E23824_01/html/821-1448/gavwn.html#scrolltoc](https://docs.oracle.com/cd/E23824_01/html/821-1448/gavwn.html#scrolltoc)

## Post-Installation Configuration

### Ensure `zfs-import-scan.service` is enabled

It is not ascertained why but this service could sometimes be left un-enabled. This meant that ZFS cannot mount your zpools at boot time. To ensure that ZFS can mount your pools and datasets, ensure that the following commands are ran.

```sh
sudo systemctl start zfs-import-scan.service
sudo systemctl enable zfs-import-scan.service
```

## Best Practices

### List disks

```sh
ls -lh /dev/disk/by-id/
```

### Creating a new zpool

```sh
zpool create \
    -m /mnt/tank \
    -o ashift=12 \
    tank \
    mirror \
        ata-ST3000DM001-9YN166_S1F0KDGY \
        ata-ST3000DM001-9YN166_S1F0JKRR \
    mirror \
        ata-ST3000DM001-9YN166_S1F0KBP8 \
        ata-ST3000DM001-9YN166_S1F0JTM1
```

_NOTE: If you encounter EFI drive labels error, use the `-f` flag to bypass it_

### Get status of zpool

```sh
zpool status tank
```

```sh
zpool get all tank
```

```sh
zfs get all tank
```

### Change options of zpool

```sh
zfs set \
    atime=off \
    compression=lz4 \
    tank
```

### Create zfs dataset

```sh
zfs create \
    -o atime=off \
    -o compression=lz4 \

    # Custom recordsize
    -o recordsize=4K \

    # Encrypted dataset
    -o encryption=on \
    -o keyformat=passphrase \
    -o keylocation=prompt \

    # ACLs
    -o aclinherit=passthrough \
    -o acltype=posixacl \
    -o xattr=sa \
    tank/dataset
```

### Create zvols

WIP

### Add SLOG

```sh
zpool add \
    tank \
    log mirror \
        ata-ST3000DM001-9YN166_S1F0KDGY \
        ata-ST3000DM001-9YN166_S1F0JKRR
```

### Add L2ARC

```sh
zpool add \
    tank \
    cache \
        ata-ST3000DM001-9YN166_S1F0KDGY
```

### To scrub pool

```sh
zpool scrub tank
```

### To import in future

```sh
zpool import -d /dev/disk/by-id tank
```

### ZFS Event Daemon

WIP

### ZFS SMART

```sh
sudo apt install smartmontools
```

WIP

#### See Also

[http://open-zfs.org/wiki/Performance_tuning](http://open-zfs.org/wiki/Performance_tuning)
[https://www.svennd.be/tuning-of-zfs-module/](https://www.svennd.be/tuning-of-zfs-module/)
[https://jrs-s.net/category/open-source/zfs/](https://jrs-s.net/category/open-source/zfs/)

## References

[https://github.com/zfsonlinux/zfs/wiki](https://github.com/zfsonlinux/zfs/wiki)
