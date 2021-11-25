## API Reference

### Overview

- [Get overview for all providers](#get-overview-for-all-providers)
- [Get clients for specific provider](#get-clients-for-specific-provider)
- [Get list of all clients](#get-list-of-all-clients)
- [Get active jobs and policies for a specific client](#get-active-jobs-and-policies-for-a-specific-client)
- [Get history of jobs for a specific client](#get-history-of-jobs-for-a-specific-client)
- [Get configuration for a specific client](#get-configuration-for-a-specific-client)

### Details

Request should be sent to BUR4U API HTTPS service on port 443

```
  https://[dc]-burapi1.[suffix] or https://[dc]-burapi1.[suffix]:443
```

where `[dc]` and `[suffix]` are specific to each datacenter.

#### Token service authorization

The HTTPS header must contain authorization token obtained from the Token Service API

```headers
  { X-Auth-Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx }
```

If the header is not present, or if the token is not valid, the request will be rejected.
| Status | Message |
| :---------- | :-------- |
| `401` | `Unauthorized`

### Success responses

If the authorization is successful, depending on the API end point, one of following responses will be returned.
| Status | Message |
| :---------- | :-------- |
| `200` | `JSON data`

#### Get overview for all providers

```https
  GET /api/v1/providers
```

##### Returns

| Property    | Type      | Description                                       |
| :---------- | :-------- | :------------------------------------------------ |
| `timeStamp` | `integer` | seconds since epoch                               |
| `providers` | `array`   | one or more [ProviderList](#providerlist) objects |

#### Get clients for specific provider

```https
  GET /api/v1/providers/${provider}
```

| Parameter  | Type     | Description                                 |
| :--------- | :------- | :------------------------------------------ |
| `provider` | `string` | **Required**. Name of the provider to fetch |

##### Returns

| Property    | Type      | Description                         |
| :---------- | :-------- | :---------------------------------- |
| `timeStamp` | `integer` | seconds since epoch                 |
| `clients`   | `object`  | [ProviderClients](#providerclients) |

#### Get list of all clients

```https
  GET /api/v1/clients
```

##### Returns

| Property    | Type      | Description                                             |
| :---------- | :-------- | :------------------------------------------------------ |
| `timeStamp` | `integer` | seconds since epoch                                     |
| `providers` | `array`   | one or more [ProviderClients](#providerclients) objects |

#### Get active jobs and policies for a specific client

```https
  GET /api/v1/clients/${client}
```

| Parameter | Type     | Description                               |
| :-------- | :------- | :---------------------------------------- |
| `client`  | `string` | **Required**. Name of the client to fetch |

##### Returns

| Property    | Type      | Description                                           |
| :---------- | :-------- | :---------------------------------------------------- |
| `timeStamp` | `integer` | seconds since epoch                                   |
| `providers` | `array`   | one or more [ProviderStatus](#providerstatus) objects |

#### Get history of jobs for a specific client

```https
  GET /api/v1/clients/${client}/history
```

| Parameter | Type     | Description                               |
| :-------- | :------- | :---------------------------------------- |
| `client`  | `string` | **Required**. Name of the client to fetch |

##### Returns

| Property    | Type      | Description                                             |
| :---------- | :-------- | :------------------------------------------------------ |
| `timeStamp` | `integer` | seconds since epoch                                     |
| `providers` | `array`   | one or more [ProviderHistory](#providerhistory) objects |

#### Get configuration for a specific client

```https
  GET /api/v1/clients/${client}/configuration
```

| Parameter | Type     | Description                               |
| :-------- | :------- | :---------------------------------------- |
| `client`  | `string` | **Required**. Name of the client to fetch |

##### Returns

| Property    | Type      | Description                                                         |
| :---------- | :-------- | :------------------------------------------------------------------ |
| `timeStamp` | `integer` | seconds since epoch                                                 |
| `providers` | `array`   | one or more [ProviderConfiguration](#providerconfiguration) objects |

### Objects

#### ProviderList

| Property  | Type      | Description                        |
| :-------- | :-------- | :--------------------------------- |
| `name`    | `string`  | name of the provider               |
| `status`  | `string`  | status of the provider             |
| `clients` | `integer` | number of clients for the provider |

##### ProviderClients

| Property    | Type      | Description            |
| :---------- | :-------- | :--------------------- |
| `timeStamp` | `integer` | seconds since epoch    |
| `name`      | `string`  | name of the provider   |
| `status`    | `string`  | status of the provider |
| `data`      | `object`  | [Clients](#clients)    |

##### ProviderStatus

| Property    | Type      | Description                   |
| :---------- | :-------- | :---------------------------- |
| `timeStamp` | `integer` | seconds since epoch           |
| `name`      | `string`  | name of the provider          |
| `status`    | `string`  | status of the provider        |
| `data`      | `object`  | [ClientStatus](#clientstatus) |

##### ProviderHistory

| Property    | Type      | Description                     |
| :---------- | :-------- | :------------------------------ |
| `timeStamp` | `integer` | seconds since epoch             |
| `name`      | `string`  | name of the provider            |
| `status`    | `string`  | status of the provider          |
| `data`      | `object`  | [ClientHistory](#clienthistory) |

##### ProviderConfiguration

| Property    | Type      | Description                                 |
| :---------- | :-------- | :------------------------------------------ |
| `timeStamp` | `integer` | seconds since epoch                         |
| `name`      | `string`  | name of the provider                        |
| `status`    | `string`  | status of the provider                      |
| `data`      | `object`  | [ClientConfiguration](#clientconfiguration) |

##### Clients

| Property    | Type      | Description                           |
| :---------- | :-------- | :------------------------------------ |
| `timeStamp` | `integer` | seconds since epoch                   |
| `clients`   | `array`   | one or more [Client](#client) objects |

##### Client

| Property       | Type     | Description        |
| :------------- | :------- | :----------------- |
| `name`         | `string` | name of the client |
| `architecture` | `string` | architecture       |
| `os`           | `string` | operating system   |

##### ClientStatus

| Property     | Type      | Description                              |
| :----------- | :-------- | :--------------------------------------- |
| `timeStamp`  | `integer` | seconds since epoch                      |
| `settings`   | `object`  | [ClientSettings](#clientsettings) object |
| `activeJobs` | `array`   | one or more [Job](#job) objects          |
| `policies`   | `array`   | one or more [Policy](#policy) objects    |

##### ClientHistory

| Property    | Type      | Description                     |
| :---------- | :-------- | :------------------------------ |
| `timeStamp` | `integer` | seconds since epoch             |
| `jobs`      | `array`   | one or more [Job](#job) objects |

##### ClientConfiguration

| Property        | Type      | Description                            |
| :-------------- | :-------- | :------------------------------------- |
| `timeStamp`     | `integer` | seconds since epoch                    |
| `configuration` | `object`  | [Configuration](#configuration) object |

##### Job

| Property       | Type       | Description           |
| :------------- | :--------- | :-------------------- |
| `jobId`        | `integer`  | backup job ID         |
| `parentJob`    | `integer`  | parent job ID         |
| `status`       | `integer`  | status of the job     |
| `jobType`      | `string`   | type of the job       |
| `subType`      | `string`   | subtype of the job    |
| `state`        | `string`   | state of the job      |
| `policy`       | `string`   | name of the policy    |
| `policyType`   | `string`   | typ of the policy     |
| `schedule`     | `string`   | name of the schedule  |
| `scheduleType` | `string`   | typ of the schedule   |
| `started`      | `dateTime` | start time of the job |
| `elapsed`      | `time`     | duration of the job   |

##### Policy

| Property     | Type     | Description        |
| :----------- | :------- | :----------------- |
| `name`       | `string` | name of the policy |
| `policyType` | `string` | type of the policy |

#### Configuration

| Property      | Type     | Description                                   |
| :------------ | :------- | :-------------------------------------------- |
| `settings`    | `object` | [ClientSettings](#clientsettings) object      |
| `backupTypes` | `array`  | one or more [BackupType](#backuptype) objects |

#### ClientSettings

| Property           | Type     | Description                          |
| :----------------- | :------- | :----------------------------------- |
| `clientMaster`     | `string` | name of the client's Master Server   |
| `platform`         | `string` | OS platform of the client            |
| `protocolLevel`    | `string` | NetBackup protocol level             |
| `product`          | `string` | NetBackup                            |
| `versionName`      | `string` | NetBackup version as string          |
| `versionNumber`    | `number` | NetBackup version as number          |
| `installationPath` | `string` | client's NetBackup installation path |
| `os`               | `string` | client's operating system            |

##### BackupType

| Property   | Type     | Description                                                            |
| :--------- | :------- | :--------------------------------------------------------------------- |
| `name      | `string` | name of the Backup Type files                                          |
| `includes` | `string` | NetBackup entry for included files                                     |
| `daily`    | `array`  | one or more more [DailyConfiguration](#dailyconfiguration) objects     |
| `monthly`  | `array`  | one or more more [MonthlyConfiguration](#monthlyconfiguration) objects |
| `yearly`   | `array`  | one or more more [YearlyConfiguration](#yearlyconfiguration) objects   |

##### DailyConfiguration

| Property          | Type     | Description                                          |
| :---------------- | :------- | :--------------------------------------------------- |
| `state`           | `string` | _Enabled_ or _Disabled_                              |
| `model`           | `string` | _Standard_ (one Full) or _Premium_ (always Full)     |
| `frequency`       | `string` | How ofter a daily backup runs                        |
| `type`            | `string` | Type of the daily backup (_Full_ if _Premium_ model) |
| `encryption`      | `bool`   | Whether the daily backup is encrypted                |
| `timeWindow`      | `string` | _18:00-06:00_ or _21:00-09:00_                       |
| `startTime`       | `string` | start time of the backup window                      |
| `backupRetention` | `string` | Retention of the daily backup                        |
| `copyRetention`   | `string` | Retention of for the copy (_null_ if no duplication) |
| `lastJob`         | `object` | A [ConfigurationJob](#configurationjob) object       |

##### MonthlyConfiguration

| Property          | Type     | Description                                          |
| :---------------- | :------- | :--------------------------------------------------- |
| `state`           | `string` | _Enabled_ or _Disabled_                              |
| `frequency`       | `string` | How ofter a monthly backup runs                      |
| `calendar`        | `string` | NetBackup calendar entry                             |
| `copyWeekend`     | `string` | When the monthly backup starts                       |
| `backupRetention` | `string` | Retention of the monthly backup                      |
| `copyRetention`   | `string` | Retention of for the copy (_null_ if no duplication) |
| `lastJob`         | `object` | A [ConfigurationJob](#configurationjob) object       |

##### YearlyConfiguration

| Property          | Type     | Description                                          |
| :---------------- | :------- | :--------------------------------------------------- |
| `state`           | `string` | _Enabled_ or _Disabled_                              |
| `frequency`       | `string` | How ofter a monthly backup runs                      |
| `calendar`        | `string` | NetBackup calendar entry                             |
| `copyWeekend`     | `string` | When the monthly backup starts                       |
| `backupRetention` | `string` | Retention of the monthly backup                      |
| `copyRetention`   | `string` | Retention of for the copy (_null_ if no duplication) |
| `lastJob`         | `object` | A [ConfigurationJob](#configurationjob) object       |

##### ConfigurationJob

| Property  | Type       | Description           |
| :-------- | :--------- | :-------------------- |
| `jobId`   | `integer`  | backup job ID         |
| `started` | `dateTime` | start time of the job |
| `status`  | `integer`  | status of the job     |
