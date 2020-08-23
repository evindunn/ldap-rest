import { Body, Controller, Post, Res } from "@nestjs/common";
import { AppConfigService } from "./app-config.service";
import { LdapService } from "./ldap/ldap.service";
import Express from "express";

@Controller()
export class AppController {
    constructor(
        private readonly appConfig: AppConfigService,
        private readonly ldap: LdapService
    ) {}

    @Post()
    async checkUser(
        @Body("username") username: string,
        @Body("password") password: string,
        @Res() res: Express.Response): Promise<void> {

        this.appConfig.reload();
        const appConfig = this.appConfig.getConfig();

        try {
            const ldapConn = await this.ldap.connect(appConfig.ldap);
            const user = await ldapConn.searchUser(username);

            if (user === null) {
                res.sendStatus(403);
            }
            else {
                const success = await ldapConn.authUser(user.dn, password);
                success ? res.sendStatus(200) : res.sendStatus(403);
            }
        }
        catch (e) {
            console.error(e.message);
            console.log(appConfig.ldap);
            res.status(500);
            res.json({ message: e.message.trim() });
        }
    }
}
