import { OpenClientKeepComponent } from '../internal';
import { OpenClientLogger } from './openClientLogger';

/**
 * Used for logging messages.  By default, an instance of this class will only log
 * to the debug console.  If the consuming app has set the logger static variable on
 * the OpenClientKeepComponent class, we will log to that instead. 
 */
export class Logger implements OpenClientLogger {

    /**
     * Get a singleton instance of the logger.  We will use the logger set on the
     * OpenClientKeepComponent class or provide a console-only logger if none is set.
     * @returns The singleton logger.
     */
    public static getInstance(): OpenClientLogger {

        let logger: OpenClientLogger;

        if (OpenClientKeepComponent !== undefined) {
            if (!OpenClientKeepComponent.commonLogger) {
                OpenClientKeepComponent.commonLogger = new Logger();
             }
             logger = OpenClientKeepComponent.commonLogger;
        } else { // Probably running unit tests
            if (!Logger.internalLogger) {
                Logger.internalLogger = new Logger();
            }
            logger = Logger.internalLogger;
        }
         
        return logger;	
    }

    private static internalLogger: Logger;

    /**
     * Log a message used for debugging. 
     * @param message The message to log
     */
    public debug(message: string): void {
        this.log("debug", message);
    }

    /**
     * Log a message when verbose logging is enabled. 
     * @param message The message to log
     */
    public verbose(message: string): void {
        this.log("verbose", message);
    }

    /**
     * Log a message that shows an http request/response. 
     * @param message The message to log
     */
    public http(message: string): void {
        this.log("http", message);
    }

    /**
     * Log an informational message. 
     * @param message The message to log
     */
    public info(message: string): void {
        this.log("info", message);
    }

    /**
     * Log a warning message. 
     * @param message The message to log
     */
    public warn(message: string): void {
        this.log("warn", message);
    }

    /**
     * Log an error message. 
     * @param message The message to log
     */
    public error(message: string): void {
        this.log("error", message);
    }

    /**
     * Log a message. 
     * @param level The logging level. For possible values see https://github.com/winstonjs/winston#logging-levels
     * @param message The message to log
     */
    private log(level: string, message: string): void {
        console.log(level + ": " + message);
    }
}

