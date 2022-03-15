# BUR4U-API installation guide

## Overview

- [Used technologies](#used-technologies)
- [Prerequisites](#prerequisites)
  - [Linux](#linux)
  - [Windows](#windows)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Certificates](#certificate-creation)
  - [ESL](#esl-export-api--windows-only)
  - [SM9](#sm9-export-api--windows-only)
  - [NetBackup](#netbackup-dedicated-user-api--windows-only)
  - [Add new provider](#add-new-provider-proxy--linux-only)
- [Monitoring](#monitoring-setup)
  - [Process](#process-monitoring)
  - [Port](#port-monitoring-proxy--linux-only)
  - [Service](#service-monitoring-api--windows-only)
- [Uninstallation](#uninstallation)

### Used technologies:

- Linux
  - NodeJS: https://nodejs.org
  - Node process manager NPM2: https://pm2.keymetrics.io/
- Windows
  - Windows service wrapper component: https://github.com/winsw/winsw

## Prerequisites

### Linux

- Connectivity with Token Service `atcswa-cr-iapig.mcloud.entsvcs.com` on port `353578`
- Install `node`
  ```
  sudo su
  export https_proxy=http://proxy-emea.svcs.entsvcs.com:8088
  curl -fsSL https://rpm.nodesource.com/setup_current.x | bash -
  yum install -y nodejs
  node -v
  npm -v
  ```
- Install `pm2`
  ```
  sudo npm install -g pm2@latest
  sudo pm2 -v
  ```

### Windows

- Installed NetBackup Master Server / Media Server

## Installation

Recommended installation folder is

- Linux `/opt/bur4u-api`
- Windows `C:\Program Files\DXC\bur4u-api`

Steps are:

1. Create the installation folder
1. Extract file `bur4u-api.v1.1-full.zip` into the installation folder
1. Clean up the folders/files
   - Linux
     - Remove `bin` subfolder
   - API
     - Remove `ui` subfolder
1. Rename default configuration file `conf\bur4u-api.default-config.js` to `conf\bur4u-api.config.js` and edit
   - API
     - Uncomment entry `moduleName: 'api'`
     - Remove PROXY related entries `providers`, `queryInterval`, `tsaEnv` and `ui` (optional)
   - PROXY
     - Uncomment entry `moduleName: 'proxy'`
     - Remove API related entries `nbu*`, `domain`, `user`, `password`, `cache*`, `esl*` and `sm9*` (optional)
1. Install the service
   - Linux
     ```
     sudo pm2 start /opt/bur4u-api/dist/bur4u-api.js --cwd /opt/bur4u-api --time
     sudo pm2 save
     sudo pm2 startup
     ```
   - Windows
     ```
     bin\bur4u-api.exe install
     ```
1. Start the service
   - Linux
     ```
     sudo pm2 stop
     ```
   - Widows
     ```
     sc start bur4u-api
     ```
1. Check the logs in `log` for any errors

## Configuration

### Certificate creation

1. Open https://certificatetools.com/
1. Use any existing certificate as template
1. Change fields `Commmon names`, `Country`, `Locality` and `Subject alternative names`
1. Save the certificates to `cert/cert.cert` and `cert/cert.key` files

### ESL export (API / Windows only)

- Recommended interval is `360` minutes (6 hours)
- Required output path is: `c:\hp\hps\obcheck2esl\upload`

1. Stop the service
   ```
   sc stop bur4u-api
   ```
1. Open configuration file `conf\bur4u-api.config.js`
1. Modify field `eslInterval: 0`, enter interval in minutes, `0` to disable.
1. Modify value `eslPath: '.'`
1. Start the service
   ```
   sc start bur4u-api
   ```

### SM9 export (API / Windows only)

- Recommended interval is `5` minutes
- Recommended history is `60` minutes
- Required output path is: `c:\osit\log`

1. Stop the service
   ```
   sc stop bur4u-api
   ```
1. Open configuration file `conf\bur4u-api.config.js`
1. Modify field `sm9Interval: 0`, enter interval in minutes, `0` to disable.
1. Modify value `sm9Path: '.'`
1. Start the service
   ```
   sc start bur4u-api
   ```

### NetBackup dedicated user (API / Windows only)

1. Stop the service
   ```
   sc stop bur4u-api
   ```
1. Modify the service user (Keep the spaces between `=` and values)
   ```
   sc config bur4u-api obj= "domain\user" password= "pwd" type= own
   ```
1. Start the service
   ```
   sc start bur4u-api
   ```

### Add new provider (PROXY / Linux only)

1. Stop the service
   ```
   sudo pm2 stop bur4u-api
   ```
1. Get the JWT token from the provider
   ```
   sudo node /opt/bur4u-api/src/bur4u-api.js --add [FQDN]
   ```
1. Modify the configuration file `conf\bur4u-api.config.js` and add the displayed entry to the `providers` array
1. Start the service
   ```
   sudo pm2 start bur4u-api
   ```

## Monitoring setup

- Default configuration location
  - Linux `/var/opt/OV/bin/instrumentation`
  - Windows `C:\Program Files\HP OpenView\data\bin\instrumentation`
- Custom configuration location
  - Linux `/var/opt/OV/conf/OpC`
  - Windows `C:\osit\etc`
- Monitoring logs location
  - Linux `/var/opt/OV/log/OpC`
  - Windows `C:\osit\log`

### Process monitoring

Configuration file: `ps_mon.cfg`

- Linux
  ```
  [BUR4U-API]
  pm2               critical   1      TT_LINUX        0000-2400 *
  *PUSER root
  node              critical   1      TT_LINUX        0000-2400 *
  *PUSER root
  ```
- Widows
  ```
  [BUR4UAPI]
  "winsw.exe" 		Critical 	1				* 	0000 	2400	T
  "nodejs.exe"		Critical 	1				* 	0000 	2400	T
  ```

### Port monitoring (Proxy / Linux only)

Configuration file: `port_mon.cfg`

```
[BUR4U-API, NONE, NONE]
NBU1    <fqdn>       25278     "10"            "TCP"           "Critical"         ""      ""             ""               ""              ""
```

### Service monitoring (API / Windows only)

Configuration file: `srv_mon.cfg`

```
[BUR4UAPI]
"BUR4U-API"            	major	1	 * 0000 2400  	T	1
```

## Uninstallation

1. Stop the service
   - Linux
     ```
     sudo pm2 stop bur4u-api
     ```
   - Windows
     ```
     sc stop bur4u-api
     ```
1. Uninstall the service
   - Linux
     ```
     sudo pm2 delete bur4u-api
     ```
   - Windows
     ```
     "C:\Program Files\DXC\bur4u-api\bin\bur4u-api" uninstall
     ```
1. Remove folder
   - Linux `/opt/bur4u-api`
   - Windows `C:\Program Files\DXC\bur4u-api`