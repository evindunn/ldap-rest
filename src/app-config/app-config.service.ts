import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const ENV_APP_PORT = "APP_PORT";
const ENV_APP_LOG_LEVEL = "APP_LOG_LEVEL";

const ENV_LDAP_URI = "LDAP_URI";
const ENV_LDAP_BIND_DN = "LDAP_BIND_DN";
const ENV_LDAP_BIND_PASS = "LDAP_BIND_PASSWORD";
const ENV_LDAP_BASE_DN = "LDAP_BASE_DN";
const ENV_LDAP_TLS_VERIFY = "LDAP_TLS_VERIFY";
const ENV_LDAP_USERNAME_ATTR = "LDAP_USERNAME_ATTRIBUTE";

const DEFAULT_APP_PORT = "8080";
const DEFAULT_APP_LOG_LVL = "warn";

const DEFAULT_LDAP_TLS_VERIFY = "true";
const DEFAULT_LDAP_USERNAME_ATTR = "cn";


export class LdapConfigOptions {
    uri: () => string;
    bindDN: () => string;
    bindPass: () => string;
    baseDN: () => string;
    usernameAttr: () => string;
    tlsVerify: () => boolean;
}

class AppConfigOptions {
    port: () => number;
    logLevel: () => string;
}

@Injectable()
export class AppConfigService {
    app: AppConfigOptions;
    ldap: LdapConfigOptions;

    constructor(private readonly config: ConfigService) {
        this.app = {
            port: () => parseInt(config.get(ENV_APP_PORT) || DEFAULT_APP_PORT),
            logLevel: () => config.get(ENV_APP_LOG_LEVEL) || DEFAULT_APP_LOG_LVL
        };
        this.ldap = {
            uri: () => config.get(ENV_LDAP_URI),
            bindDN: () => config.get(ENV_LDAP_BIND_DN),
            bindPass: () => config.get(ENV_LDAP_BIND_PASS),
            baseDN: () => config.get(ENV_LDAP_BASE_DN),
            usernameAttr: () => config.get(ENV_LDAP_USERNAME_ATTR) || DEFAULT_LDAP_USERNAME_ATTR,
            tlsVerify: () => (config.get(ENV_LDAP_TLS_VERIFY) || DEFAULT_LDAP_TLS_VERIFY) === 'true'
        };

        if (!this.ldap.uri()) {
            throw new Error(`${ENV_LDAP_URI} must be set!`);
        }

        if (!this.ldap.bindDN()) {
            throw new Error(`${ENV_LDAP_BIND_DN} must be set!`);
        }

        if (!this.ldap.bindPass()) {
            throw new Error(`${ENV_LDAP_BIND_PASS} must be set!`);
        }

        if (!this.ldap.baseDN()) {
            throw new Error(`${ENV_LDAP_BASE_DN} must be set!`);
        }
    }
}
