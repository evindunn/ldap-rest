import { AppConfigService } from "../app-config/app-config.service";
import { Client as LDAPClient, createClient } from "ldapjs";

const CONNECTION_TIMEOUT = 10;

export const LDAP_CLIENT_PROVIDER_ID = "LDAP_CLIENT";

export function ldapClientFactory(appConfig: AppConfigService): LDAPClient {
    return createClient({
        url: appConfig.ldap.uri(),
        tlsOptions: { rejectUnauthorized: appConfig.ldap.tlsVerify() },
        idleTimeout: CONNECTION_TIMEOUT
    });
}
