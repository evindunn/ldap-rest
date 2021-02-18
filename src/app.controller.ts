import {
    Body,
    Controller,
    ForbiddenException,
    Post,
    HttpStatus, HttpCode, Logger,
} from "@nestjs/common";
import { LDAPService } from "./ldap/ldap.service";

@Controller()
export class AppController {
    private logger = new Logger(AppController.name);

    constructor(private readonly ldap: LDAPService) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    async checkUser(
        @Body("username") username: string,
        @Body("password") password: string): Promise<void> {

        const user = await this.ldap.findUser(username);

        if (user === null) {
            this.logger.debug(`User '${username}' not found`);
            throw new ForbiddenException();
        }
        else {
            const success = await this.ldap.authUser(user.dn, password);
            if (!success) {
                this.logger.debug(`Auth failed for user '${username}'`);
                throw new ForbiddenException();
            }
            this.logger.debug(`Successful login for user '${username}'`)
        }
    }
}
