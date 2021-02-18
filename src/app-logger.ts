import {
    createLogger,
    Logger as WinstonLogger,
    transports as WinstonTransports,
    format as winstonFormat,
} from "winston";
import { LoggerService } from "@nestjs/common";
import { AppConfigService } from "./app-config/app-config.service";

export class AppLogger implements LoggerService {
    static readonly LOG_LEVELS = {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
    };
    private static readonly DATE_FMT = 'YYYY-MM-DD hh:mm:ss'

    private winston: WinstonLogger;

    constructor(appConfig: AppConfigService) {
        const logLevel = appConfig.app.logLevel();
        const validLogLevels = Object.keys(AppLogger.LOG_LEVELS);

        if (!validLogLevels.includes(logLevel)) {
            throw new Error(`Valid log levels are ${ validLogLevels.join(", ") }`);
        }

        this.winston = createLogger({
            level: logLevel,
            levels: AppLogger.LOG_LEVELS,
            format: winstonFormat.combine(
                winstonFormat.timestamp({ format: AppLogger.DATE_FMT }),
                winstonFormat.printf(AppLogger.logFormatter),
            ),
            transports: [new WinstonTransports.Console()],
        });
    }

    log(message: any, context?: string) {
        this.winston.info({ message: message, label: context });
    }

    error(message: string, trace: string) {
        this.winston.error(message + '\n' + trace);
    }

    warn(message: any, context?: string) {
        this.winston.warn({ message: message, label: context });
    }

    debug(message: any, context?: string) {
        this.winston.debug({ message: message, label: context });
    }

    verbose(message: any, context?: string) {
        this.winston.debug({ message: message, label: context });

    }

    private static logFormatter({ level, message, label, timestamp }) {
        let fmt = `[${timestamp}][${level.toUpperCase()}]`;

        if (label) {
            fmt += `[${label}]`;
        }

        return `${fmt} ${message}`;
    };
}
