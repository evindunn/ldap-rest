import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import helmet from "helmet";
import { AppConfigService } from "./app-config/app-config.service";
import { AppLogger } from "./app-logger";

async function bootstrap() {

    const app = await NestFactory.create(AppModule, { logger: false });
    const appConfig = app.get(AppConfigService);
    const port = appConfig.app.port();
    const logger = new AppLogger(appConfig);

    app.useLogger(logger);
    app.use(helmet());

    logger.log(`Server listening on port ${port}...`, 'Server');
    await app.listen(port);
}

bootstrap().catch((e) => {
    console.error(e);
    process.exit(1);
});
