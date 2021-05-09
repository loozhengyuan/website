---
layout: post
title: Generating GPG Keys
tags:
  - gpg
---

GPG is a tool that helps you sign and encrypt your data and communications. It can be used to [sign your git commits](https://help.github.com/en/github/authenticating-to-github/signing-commits), [encrypt your data and communications](https://www.gnupg.org/gph/en/manual/x110.html), and many more. Setting up GPG can be a little daunting because misconfigurations can quite dangerous, e.g. exposing your secret keys by mistake, or losing your secret keys, etc.

This page assumes that you are creating your first set of keys or that you are recreating all your keys from scratch. The contents of this page may also be a little opinionated in that it follows certain approaches that are regarded by the community as a best practice, but you are free to find your preferred approach.

## Prerequisites

Check that GnuPG is correctly installed

```
gpg --version
```

If its not installed, which unlikely for any Linux distributions, you can run the following:

```
sudo apt update
sudo apt install gnupg
```

Or for those on Mac OS X (assuming you have Homebrew installed):

```
brew install gpg
```

## Generating your offline master key

The initial step includes generating your offline master key. The [offline master key](https://wiki.debian.org/OfflineMasterKey) approach is generally preferred to reduce the risk of it being exposed or stolen. Due to the powers the master key possess (i.e. creating, signing, revoking your sub keys), it is paramount that you take steps to keep the master key offline and in a safe place. To do so, this process involves **creating the master key in an airgapped machine**.

To generate a set of master keys:

```
gpg --expert --full-gen-key
```

Follow these steps:
* Choose `(8) RSA (set your own capabilities)`
* Toggle `S`, `E`, and make sure that the key is only able to `Certify`
* Choose `4096`
* Choose `0`

At this point in time, it is worth to elaborate a little bit more why the master key is set to never to expire. Generally, setting expiration on the offline master key has no added benefit if it is safely stored locally and only used to create and revoke your sub keys. It is more important to secure the master key well and keeping a safe backup of the revokation key to ensure that a compromised key can be invalidated. This [answer](https://security.stackexchange.com/questions/14718/does-openpgp-key-expiration-add-to-security/79386#79386) on StackExchange provides a little more elaboration on this point.

To show the public key generated:

```
gpg -k
```

And to show private key:

```
gpg -K
```

## Initialising configuration files

GnuPG can be optionally configured using the `gpg.conf` file, which is to be created on `~/.gnupg/`. The motivation behind these set of configurations are a result of adopting best practices relevant to using GnuPG. For more information, you can explore this [site](https://riseup.net/en/security/message-security/openpgp/best-practices) to learn more about the best practices. As for the configuration files, they will follow [this configuration](https://raw.githubusercontent.com/ioerror/duraconf/master/configs/gnupg/gpg.conf) (do note that some of these options have already been deprecated).

Download the configuration file and save it as `gpg.conf`

```
curl https://raw.githubusercontent.com/ioerror/duraconf/master/configs/gnupg/gpg.conf > gpg.conf
```

*NOTE: Do this step on another computer before you move on to the next step, where you will generate the keys on an airgapped computer. Once the file is generated, transfer the file securely to the airgapped computer's `~/.gnupg/` directory.*

Refresh with new configuration

```
gpg-connect-agent reloadagent /bye
```

## Generating Sub Keys

Next, 3 subkeys will be generated, each with their own specific function of `Sign`, `Encrypt`, and `Authenticate`. Repeat the following steps for each of the there keys

Access the gpg interface

```
gpg --expert --edit-key $KEYID
```

Invoke the `addkey` command

```
addkey
```

Follow these steps (for each of `Sign`, `Encrypt`, and `Authenticate` subkeys):
* Choose `(8) RSA (set your own capabilities)`
* Toggle `S`, `E`, `A` options accordingly to achieve 3 keys with separate functions
* Choose `4096`
* Choose `1y`

Verify the 3 keys have been correctly created

```
list
```

Save changes

```
save
```

## Backing up keys

Save the following keys to an encrypted USB flash drive, to be used ONLY on an airgapped computer.

Change directory to the USB drive or backup path

```
KEYID=[YOUR_KEY_ID]
mkdir $KEYID
```

Backup public key

```
gpg --armor --export > $KEYID/public.asc
```

Backup secret key

```
gpg --armor --export-secret-keys > $KEYID/secret.asc
```

Backup 'laptop' key

```
gpg --armor --export-secret-subkeys > $KEYID/laptop.asc
```

Backup ownertrust

```
gpg --armor --export-ownertrust > $KEYID/ownertrust.txt
```

Backup pre-generated revocation certificate

```
cp ~/.gnupg/openpgp-revocs.d/*.rev $KEYID/
```

(Optional) Generate & backup additional revocation certificates

```
gpg --armor --gen-revoke $KEYID > $KEYID/revoke.asc
```

(Optional) If you want, you may want to compress these into a file.

```
tar cvf $KEYID.tar $KEYID/
```

Saves these files securely

## Transfer keys to OpenPGP/Yubikey

This step requires first setting up the key, then transferring the keys to the yubikey. Make sure this step is also done on an airgapped machine

Install `scdaemon`

```
sudo apt update
sudo apt install scdaemon
```

Show card status

```
gpg --card-status
```

Import secret keys if its not currently on the airgapped machine

```
gpg --import secret.asc
gpg --import-ownertrust trust.asc
```

## Uploading public key

As of 2020, the preferred public keyserver is https://keys.openpgp.org/. It runs on the [Hagrid](https://gitlab.com/hagrid-keyserver/hagrid) keyserver software, which is based on [Sequoia-PGP](https://sequoia-pgp.org/).

If you are ready, and you deem that uploading your key to a public keyserver is appropriate for your use case, you may run the following command. Do take note that any information pushed to a public SKS/PGP keyserver is strictly uneditable/unremovable.

```
gpg --export | curl -T - https://keys.openpgp.org
```

*NOTE: The above command is specific for uploading the key to the `keys.openpgp.org` server. This returns a direct link to the verification page where you can request a verification email for the key to be verified. Verifying your email will allow you to [manage](https://keys.openpgp.org/manage) your keys. If you desire, you could also manually [upload](https://keys.openpgp.org/upload) your public keys.*

### Initialisation of OpenPGP Card

Setup card

```
gpg --edit-card
```

Set custom passwords

```
admin
passwd

1
123456
<DESIRED PASSWORD>

3
12345678
<DESIRED ADMIN PIN>

q
```

Fill in other information

```
name
<FULL NAME>

url
hkps://pgp.mit.edu

login
<LOGIN NAME>

list

q
```

### Transfer Signing, Encrypting, and Authentication Keys to card

Access the gpg interface

```
gpg --expert --edit-key $KEYID
```

Transfer `S` key

```
key 1
keytocard
1
```

Transfer `E` key

```
key 1
key 2
keytocard
2
```

Transfer `A` key

```
key 2
key 3
keytocard
3
```

Save changes

```
save
```

## Delete all keys

Once you are done, you make remove the keys and destroy the live image.

Delete secret keys

```
gpg --delete-secret-keys $KEYID
```

Delete public keys

```
gpg --delete-keys $KEYID
```

## Using OpenPGP/Yubikey on a new computer

Verify that no keys exist on the machine

```
gpg -k
gpg -K
```

Import public key from SKS/PGP Keyserver

```
gpg --keyserver hkps://pgp.mit.edu --recv-key $KEYID
```

[Optional] You can also import the key from `public.asc`

```
gpg --import public.asc
```

Copy key stubs to local machine

```
gpg --card-status
```

Set trust level of key

```
gpg --edit-key $KEYID
trust
5
Y
save
```

## Using your GPG keys

### Encrypt and decrypt files

```console
$ echo "hello world" > doc
$ gpg -s -e -r user@email.com doc
$ gpg -d test.gpg
gpg: encrypted with 1024-bit DSA key, ID BB7576AC, created 1999-06-04
      "Full Name <user@email.com>"
hello world
gpg: Signature made Fri Jun  4 12:38:46 1999 CDT
gpg:                using RSA key BB7576AC
gpg: Good signature from "Full Name <user@email.com>" [ultimate]
```

### Create clearsigned documents

```console
$ echo "hello world" > doc
$ gpg --clear-sign doc
$ cat doc.asc
-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA1

hello world
-----BEGIN PGP SIGNATURE-----
Version: GnuPG v0.9.7 (GNU/Linux)
Comment: For info see http://www.gnupg.org

iEYEARECAAYFAjdYCQoACgkQJ9S6ULt1dqz6IwCfQ7wP6i/i8HhbcOSKF4ELyQB1
oCoAoOuqpRqEzr4kOkQqHRLE/b8/Rw2k
=y6kj
-----END PGP SIGNATURE-----
```

### Create detached signatures

```console
$ echo "hello world" > doc
$ gpg --detach-sig doc
$ gpg --verify doc.sig doc
gpg: Signature made Fri Jun  4 12:38:46 1999 CDT
gpg:                using RSA key BB7576AC
gpg: Good signature from "Full Name <user@email.com>" [ultimate]
```

### Sign git commits and tags

To sign your git commits, you first need to set the signing key. This can be any sub key you prefer, but it is important to add an escaped exclamation mark `\!` at the end to tell `gpg` to always sign using this sub key instead of the most recent ony.

```shell
git config --global user.signingKey = BB7576AC\!
```

Once this is set, you may now use the `-S` flag to sign your git commits and tags. Alternatively, you could also set `gpgSign` so that all commits and tags are automatically signed.

```shell
git config --global commit.gpgSign = true
git config --global tag.gpgSign = true
```

*NOTE: You may encounter issues signing your commits if the `GPG_TTY` environment variable is not properly set. To ensure that this `GPG_TTY` is set to an actual tty device, add the following block to your `.bashrc`/`.zshrc` file.*

```shell
# Ensure GPG_TTY is set to a real tty device
GPG_TTY=$(tty)
export GPG_TTY
```

## See Also

* https://ocramius.github.io/blog/yubikey-for-ssh-gpg-git-and-local-login/
* https://www.inovex.de/blog/openpgp-create-a-new-gnupg-key-1/
* https://blog.eleven-labs.com/en/openpgp-almost-perfect-key-pair-part-1/
* https://blog.tinned-software.net/create-gnupg-key-with-sub-keys-to-sign-encrypt-authenticate/
* https://spin.atomicobject.com/2013/11/24/secure-gpg-keys-guide/
