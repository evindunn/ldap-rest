import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppConfigService } from './app-config.service';
import { LdapModule } from './ldap/ldap.module';
import { LdapService } from "./ldap/ldap.service";

@Module({
  imports: [LdapModule],
  controllers: [AppController],
  providers: [AppConfigService, LdapService],
})
export class AppModule {
}
