import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LdapModule } from './ldap/ldap.module';
import { AppConfigModule } from './app-config/app-config.module';

@Module({
  imports: [
      AppConfigModule,
      LdapModule,
      AppConfigModule
  ],
  controllers: [AppController]
})
export class AppModule { }
