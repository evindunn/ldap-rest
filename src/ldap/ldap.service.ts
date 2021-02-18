import { Inject, Injectable } from "@nestjs/common";
import { AppConfigService } from "../app-config/app-config.service";
import { LDAP_CLIENT_PROVIDER_ID } from "./ldap-client.provider";
import ldap, {
    Client as LDAPClient,
    SearchEntry as LDAPSearchEntry,
    SearchOptions as LDAPSearchOptions,
    LDAPResult
} from "ldapjs";
import EventEmitter from "events";
import util from "util";

type LdapControls = ldap.Control | ldap.Control[];
type LdapSearchEmitter = Promise<EventEmitter.EventEmitter>;
type LDAPBindMethod = (bindDN: string, bindPass: string) => Promise<void>;
type LDAPSearchMethod = (
    base: string,
    options: LDAPSearchOptions,
    controls?: LdapControls
) => LdapSearchEmitter;

@Injectable()
export class LDAPService {
    constructor(
        @Inject(LDAP_CLIENT_PROVIDER_ID) private readonly ldapClient: LDAPClient,
        private readonly appConfig: AppConfigService) { }

    async authUser(dn: string, password: string): Promise<boolean> {
        try {
            await this.connect();
            await this.bind(dn, password);
            return true;
        } catch (e) {
            return false;
        }
    }

    async findUser(username: string): Promise<LDAPSearchEntry> {
        await this.connect();

        const filter = `(&(objectClass=User)(${this.appConfig.ldap.usernameAttr()}=${username}))`;
        const resultEmitter: EventEmitter.EventEmitter = (
            await this.search(this.appConfig.ldap.baseDN(), {
                filter,
                scope: "sub",
                attributes: ["dn"]
            })
        );

        return new Promise<LDAPSearchEntry>((resolve, reject) => {
            const results = [];

            resultEmitter.on("error", (err) => {
                reject(err);
            });

            resultEmitter.on("searchEntry", (entry: LDAPSearchEntry) => {
                results.push(entry.object);
            });

            resultEmitter.on("end", (result: LDAPResult) => {
                if (result.status !== 0) {
                    reject(result.status);
                }
                else {
                    resolve(results.length > 0 ? results[0] : null);
                }
            });
        });
    }

    private async connect(): Promise<void> {
        await this.bind(
            this.appConfig.ldap.bindDN(),
            this.appConfig.ldap.bindPass()
        );
    }

    private bind: LDAPBindMethod = util.promisify(
        this.ldapClient.bind.bind(this.ldapClient)
    );

    private search: LDAPSearchMethod = util.promisify(
        this.ldapClient.search.bind(this.ldapClient)
    );
}
