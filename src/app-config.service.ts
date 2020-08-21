import { Injectable } from '@nestjs/common';

export interface LdapConfig {
    uri: string
    bindDN: string
    bindPass: string
    baseDN: string
    usernameAttr: string
    tlsVerify: boolean
}

export interface AppConfig {
    app: {
        port: number
    },
    ldap: LdapConfig
}

@Injectable()
export class AppConfigService {
    private static appConfig: AppConfig = null;

    getConfig(): AppConfig {
        if (AppConfigService.appConfig === null) {
            this.reload();
        }
        return AppConfigService.appConfig;
    }

    reload(): void {
        AppConfigService.appConfig = {
            app: {
                port: parseInt(process.env.APP_PORT) || 8080
            },
            ldap: {
                uri: process.env.LDAP_URI,
                bindDN: process.env.LDAP_BIND_DN,
                bindPass: process.env.LDAP_BIND_PASSWORD,
                baseDN: process.env.LDAP_BASE_DN,
                usernameAttr: process.env.LDAP_USERNAME_ATTRIBUTE,
                tlsVerify: (
                    process.env.LDAP_TLS_VERIFY ?
                    process.env.LDAP_TLS_VERIFY === "true" :
                    true
                )
            }
        }
    }
}
