/**
 * This defines the interface the keep component uses to log diagnostic data.  The
 * functions represent levels of logging datail that can be logged.  The consuming
 * application may pass in an object that conforms to this interface in order to capture
 * diagnostic data from the keep component.
 * 
 * The severity or level of logging is indicated by the name of the functions.
 * 
 * Each function takes a string as its only parameter.  This is the message that is
 * logged.
 */
export interface OpenClientLogger {
    /**
     * Log a message used for debugging. 
     * @param message The message to log
     */
    debug(message: string): void;

    /**
     * Log a message when verbose logging is enabled. This generates the most output and should be enabled only when necessary.
     * @param message The message to log
     */
    verbose(message: string): void;

    /**
     * Log a message that shows an http request/response. 
     * @param message The message to log
     */
    http(message: string): void;

    /**
     * Log an informational message. 
     * @param message The message to log
     */
    info(message: string): void;

    /**
     * Log a warning message. 
     * @param message The message to log
     */
    warn(message: string): void;

    /**
     * Log an error message. 
     * @param message The message to log
     */
    error(message: string): void;
}