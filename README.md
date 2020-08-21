# SleepyLDAP

## Description

REST interface to LDAP/AD authentication

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Environment
Required:
```
APP_PORT=8080
LDAP_URI=...
LDAP_BIND_DN=bindUser@root.domain
LDAP_BIND_PASSWORD="..."
LDAP_BASE_DN="..."

# Verify LDAPS certificate
LDAP_TLS_VERIFY=true

# sAMAccountName for AD, cn for LDAP
LDAP_USERNAME_ATTRIBUTE=sAMAccountName
```

## POST /
```
{
    "username": "evin",
    "password": "password"
}
```
200 for success, 403 on error
