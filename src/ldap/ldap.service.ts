import { Injectable } from '@nestjs/common';
import util from "util";
import ldap, { SearchEntry } from "ldapjs";
import { LdapConfig } from "../app-config.service";
import EventEmitter from "events";

class LdapConnection {
    private readonly ldapClient: ldap.Client;
    private readonly ldapConfig: LdapConfig;
    private readonly _bind;
    private readonly _search;

    constructor(config: LdapConfig) {
        this.ldapConfig = config;
        this.ldapClient = ldap.createClient({
            url: this.ldapConfig.uri,
            tlsOptions: { rejectUnauthorized: config.tlsVerify }
        });
        this._bind = util.promisify(this.ldapClient.bind.bind(this.ldapClient))
        this._search = util.promisify(this.ldapClient.search.bind(this.ldapClient));
    }

    async connect(): Promise<void> {
        return this._bind(this.ldapConfig.bindDN, this.ldapConfig.bindPass);
    }

    async searchUser(username: string): Promise<SearchEntry[]> {
        const filter = `(&(objectClass=User)(${this.ldapConfig.usernameAttr}=${username}))`;
        const resultEmitter: EventEmitter.EventEmitter = (
            await this._search(this.ldapConfig.baseDN, {
                filter,
                scope: "sub",
                attributes: ["dn"]
            })
        );

        return new Promise<SearchEntry[]>((resolve, reject) => {
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
}

@Injectable()
export class LdapService {
    async connect(config: LdapConfig): Promise<LdapConnection> {
        const ldapConn = new LdapConnection(config);
        await ldapConn.connect();
        return ldapConn;
    }
}
