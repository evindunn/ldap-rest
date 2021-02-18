import { Module } from "@nestjs/common";
import { LDAPService } from "./ldap.service";
import { AppConfigModule } from "../app-config/app-config.module";
import { AppConfigService } from "../app-config/app-config.service";
import {
    LDAP_CLIENT_PROVIDER_ID,
    ldapClientFactory,
} from "./ldap-client.provider";


@Module({
    imports: [AppConfigModule],
    providers: [
        {
            provide: LDAP_CLIENT_PROVIDER_ID,
            useFactory: ldapClientFactory,
            inject: [AppConfigService]
        },
        LDAPService
    ],
    exports: [LDAPService]
})
export class LdapModule { }
