import { Injectable } from '@nestjs/common';
import util from "util";
import ldap, { SearchEntry } from "ldapjs";
import { LdapConfig } from "../app-config.service";
import EventEmitter from "events";

type LdapControls = ldap.Control | ldap.Control[];
type LdapSearchEmitter = Promise<EventEmitter.EventEmitter>;

class LdapConnection {
    public static LDAP_TIMEOUT = 30;

    private readonly ldapConfig: LdapConfig;
    private ldapClient: ldap.Client;
    private _bind: (bindDN: string, bindPass: string) => Promise<void>;
    private _search: (
        base: string,
        options: ldap.SearchOptions,
        controls?: LdapControls
    ) => LdapSearchEmitter;

    constructor(config: LdapConfig) {
        this.ldapConfig = config;
    }

    private async _connect(): Promise<void> {
        if (!(this.ldapClient && this.ldapClient.connected)) {
            this.ldapClient = ldap.createClient({
                url: this.ldapConfig.uri,
                tlsOptions: { rejectUnauthorized: this.ldapConfig.tlsVerify },
                idleTimeout: LdapConnection.LDAP_TIMEOUT
            });

            this._bind = util.promisify(
                this.ldapClient.bind.bind(this.ldapClient)
            );
            this._search = util.promisify(
                this.ldapClient.search.bind(this.ldapClient)
            );

            await this._bind(this.ldapConfig.bindDN, this.ldapConfig.bindPass);
        }
    }

    async searchUser(username: string): Promise<SearchEntry> {
        await this._connect();

        const filter = `(&(objectClass=User)(${this.ldapConfig.usernameAttr}=${username}))`;
        const resultEmitter: EventEmitter.EventEmitter = (
            await this._search(this.ldapConfig.baseDN, {
                filter,
                scope: "sub",
                attributes: ["dn"]
            })
        );

        return new Promise<SearchEntry>((resolve, reject) => {
            const results = [];

            resultEmitter.on("error", (err) => {
                reject(err);
            });

            resultEmitter.on("searchEntry", (entry: ldap.SearchEntry) => {
                results.push(entry.object);
            });

            resultEmitter.on("end", (result: ldap.LDAPResult) => {
                if (result.status !== 0) {
                    reject(result.status);
                }
                else {
                    resolve(results.length > 0 ? results[0] : null);
                }
            });
        });
    }

    async authUser(dn: string, password: string): Promise<boolean> {
        try {
            await this._connect();
            await this._bind(dn, password);
            return true;
        } catch (e) {
            console.error(`Login error for '${dn}'`);
            return false;
        }
    }
}

@Injectable()
export class LdapService {
    async connect(config: LdapConfig): Promise<LdapConnection> {
        return new LdapConnection(config);
    }
}
