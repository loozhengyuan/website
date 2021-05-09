---
layout: post
title: Setting up Google SSO with Azure AD as IdP
tags:
  - idp
  - sso
  - google-cloud-identity
  - azure-ad
---

I recently discovered a rare gem: [Google Cloud Identity](https://cloud.google.com/identity/). This service allows one to provision Google accounts like ones we have in Azure AD. Since we also had problems of users creating their own Google account and we did not want to pay the full G-Suite pricing just to manage/provision users, this service is exceptional for what it is worth.

With that, the goal was to setup Single Sign-On on the Google accounts, and have them point to Azure AD as the third-party identity provider (IdP).

## WIP

https://docs.microsoft.com/en-gb/azure/active-directory/saas-apps/google-apps-tutorial

## Troubleshooting

### Some users are not redirected back to Azure SSO

According to [Google](https://support.google.com/a/answer/60224?hl=en):

> If you specify a URL in the **Change password URL** option, _all_ users, **other than super administrators**, who try to change their password at **https://**_**myaccount**_**.google.com/** will be directed to the URL you specify. This setting applies even if you do not enable SSO. Also, network masks do _not_ apply.

This is a safeguard measure by Google, hence all users with `Super Administrator` role will be redirected to the conventional username/password login.

### Users are redirected to a specific page

Ideally, it will be appropriate for the user to be redirected back to where it came from. According to [Microsoft's configuration page](https://docs.microsoft.com/en-gb/azure/active-directory/saas-apps/google-apps-tutorial), the patterns for the _required_ `Sign on URL` field include:

> Patterns:   
> https://www.google.com/a/ServiceLogin?continue=https://mail.google.com  
> https://www.google.com/a/ServiceLogin?continue=https://console.cloud.google.com

As such, you'll realise that you were redirected to whatever URL you've written in there. Luckily, the fix for this is simply excluding `continue` query parameter:

```
https://www.google.com/a/ServiceLogin
```

### Users are required to enter their username again on Microsoft login page

Unfortunately, I **don't know a fix for this**. The closest I have got is to alter the Sign in Page URL on Google's configuration page:

```
https://login.microsoftonline.com/<tenant_id>/saml2?login_hint=<email>
```

Using the `login_hint` query parameter helps Microsoft prefill the username. However, I don't know what is the correct variable to use such that Google will substitute it for different users. Moreover, I'm not sure if this is a recommended practice since all other query parameters seems to be encoded or some sort. So, implement at your own risk.

## Resources:

[https://support.google.com/cloudidentity/answer/7319251?hl=en&ref\_topic=7385935](https://support.google.com/cloudidentity/answer/7319251?hl=en&ref_topic=7385935)
