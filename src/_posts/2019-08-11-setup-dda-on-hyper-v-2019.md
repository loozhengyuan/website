---
layout: post
title: Setting up Direct Device Assignment on Hyper-V
tags:
  - dda
  - hyper-v
permalink: /blog/:title
---

## Prerequisites

1. Microsoft Hyper-V Server 2019
2. Compatible PCIe device

## Step 1: Preparing the VM

First, assign the `$VMName` variable to be used throughout this guide.

```powershell
$VMName = "Name of VM Here"
```

As part of using DDA, there are some settings that needs to be enabled/tweaked. If any of the following settings are not ideal, it is important not to proceed with this guide.

**Required Configurations**

```powershell
Set-VM -Name $VMName -AutomaticStopAction TurnOff
```

**Optional Configurations**

```powershell
Set-VM -GuestControlledCacheTypes $true -VMName $VMName
Set-VM -LowMemoryMappedIoSpace 3Gb -VMName $VMName
Set-VM -HighMemoryMappedIoSpace 33280Mb -VMName $VMName
```

## Step 2: Preparing the Host

List all devices

```powershell
Get-PnpDevice -PresentOnly | Sort-Object -Property FriendlyName
```

Identify device; Change _Gigabit_ to narrow down your search as much as possible

```powershell
$pnpquery = (Get-PnpDevice -PresentOnly).Where{ $_.FriendlyName -like '*Gigabit*' }; $pnpquery
```

Set the variable $instanceId

```powershell
$instanceId = $pnpquery[0] | Get-PnpDeviceProperty DEVPKEY_Device_InstanceId | ForEach { $_.Data }; $instanceId
```

Disabling the device

```powershell
Disable-PnpDevice -InstanceId $instanceId
```

Set the variable

```powershell
$locationPath = $pnpquery[0] | Get-PnpDeviceProperty DEVPKEY_Device_LocationPaths | ForEach { $_.Data }; $locationPath
```

Dismount the device from the host

```powershell
Dismount-VMHostAssignableDevice -LocationPath $locationPath
```

(Optional) If your ACPI location path is also supplied, you can use this instead

```powershell
Dismount-VMHostAssignableDevice -LocationPath $locationPath[0]
```

_Tip: If the `Dismount-VMHostAssignableDevice` cmdlet throws an error, you may use the `-Force` flag to bypass the error and dismount accordingly._

## Step 3: Assigning it to VM

Add device to VM

```powershell
Add-VmAssignableDevice -LocationPath $locationPath -VmName $VMName
```

Verify that the device has been passed through

```powershell
Get-VmAssignableDevice -VmName $VMName
```

## Optional: Removing and remounting back to host

First, assign the `$VMName` variable

```powershell
$VMName = "Name of VM Here"
```

Identify the device to be removed

```powershell
Get-VmAssignableDevice -VmName $VMName
```

Remove device from VM

```powershell
Remove-VmAssignableDevice -LocationPath $locationPath -VmName $VMName
```

Remount it back to host

```powershell
Mount-VMHostAssignableDevice -LocationPath $locationPath
```
