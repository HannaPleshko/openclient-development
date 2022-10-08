import { OpenClientKeepComponent } from '../OpenClientKeepComponent';
import { Logger } from './logger';
import moment from 'moment-timezone';
import { DateTime, IANAZone } from 'luxon';

/**
 * Base 64 encode a string. 
 * @param data The data to encode. 
 * @returns The data as a base 64 encoded string.
 */
export function base64Encode(data: string): string {

    return Buffer.from(data).toString('base64')
}

/**
 * Decode a Base 64 encoded string. 
 * @param data The base 64 encoded string.
 * @returns The decoded string.
 */
export function base64Decode(data: string): string {

    return Buffer.from(data, "base64").toString("utf-8");
}

/**
 * Returns if a string contains HTML tags. 
 * @param data The string to check for HTML.
 * @returns True if the string contains HTML tags. False if it is plain text. 
 */
export function hasHTML(data: string): boolean {
    const regex = "<(\"[^\"]*\"|'[^']*'|[^'\">])*>";
    return data.search(regex) === -1 ? false : true; 
}

/**
 * Return the keep url, prepending the schema and authority if the toConvert url does not contain it. 
 * @param toConvert Initial url to convert to keep url.
 * @returns The url with the keep schema and authority if toConvert is not absolute.
 */
export function getKeepUrl(toConvert: string): string {
    let returnUrl = toConvert;
    if (returnUrl.indexOf("://") < 0) {
        returnUrl = OpenClientKeepComponent.getKeepBaseUrl();
        if (!returnUrl.endsWith('/')) {
            returnUrl += '/';
        }

        if (toConvert.startsWith('/')) {
            if (toConvert.length > 1) {
                returnUrl += toConvert.substring(1);
            }
        } else {
            returnUrl += toConvert;
        }
    }
    return returnUrl;
}

/**
 * Determines if a string is an email address.
 * @param input The string to test if it is an email address.
 * @returns True if the string is an email address; otherwise false. 
 */
export function isEmail(input: string): boolean {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(input).toLowerCase());
}

/**
 * Extracts the time zone name for the Keep API timezone. The Keep timezone is in the form: 
 * "Z=5$DO=1$DL=3 2 1 11 1 1$ZX=148$ZN=America/New_York"
 * @param tz The timezone string returned on the Keep API.
 * @returns The time zone name to use for EWS. 
 */
export function nameFromTimeZone(tz: string): string | undefined {
    const parts = tz.split("$");
    const name = parts.filter(item => { return item.startsWith("ZN=") });
    if (name.length > 0) {
        return name[0].substring(3);
    }

    return undefined;
}

/**
 * Return the value of a object's key if it is not a blank string. 
 * @param key The key of the item's value to return
 * @param theObject A object
 * @returns For a key with a string value returns the value if it is not an empty string or undefined; otherwise undefined. For keys with non-string values, it will return the value. 
 */
export function parseValue(key: string, theObject: any): any | undefined {
    let value = theObject[key];
    if (typeof(value) === 'string' && value.length === 0) {
        value = undefined;
    }
    return value;
}

/**
 * Convert an object that represents a list of items to an array of strings. The object can be a string is in the format "[ item1, item2, item3 ]" or "item1" or already an array . 
 * @param data The object respresenting the list of string items. 
 * @returns The array of strings. An empty array will be returned if the data is not formatted correctly. 
 */
export function convertToListObject(data: any): string[] {
    if (typeof data === 'string') {
        if (data.charAt(0) === '[' && data.charAt(data.length - 1) === ']') {
            const list = data.substring(1, data.length - 1);
            const parts = list.split(',');
            const categories: string[] = [];
            parts.forEach(category => { categories.push(category.trim()) });
            return categories;
        }
        else if (data.trim().length > 0) {
            return [data.trim()];
        }
    } else if (data instanceof Array) {
        return data; 
    }

    return [];
}

/**
 * Returns a date for yesterday. 
 */
export function yesterday(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
}

/**
 * Parse a date/time string returned from Keep API. They may contain one date/time or multiple if it is a recurring item. For example:
 * - Non-recurring: "STARTDATETIME": "2020-06-26T09:00:00.000-04:00"
 * - Recurring: "STARTDATETIME": "06/30/2020 12:01:00 PM,07/07/2020 12:01:00 PM,07/14/2020 12:01:00 PM,07/21/2020 12:01:00 PM"
 * @param dateTime The string containing one or more dates/times. 
 * @returns An array of Date objects for each date/time in the string. 
 */
export function getDates(dateTime: string | string[]): Date[] {
    const rtn: Date[] = [];
        let dates: string[] | undefined;
        if (typeof (dateTime) === 'string') {
            dates = dateTime.split(",");
        } else if (Array.isArray(dateTime)) {
            dates = dateTime;
        } else {
            return rtn;
        }
        dates.forEach(item => {
            const d = new Date(item);
            if (!isNaN(d.getTime())) {
                rtn.push(d);
            }else{
                Logger.getInstance().debug(`Error occurred parsing date: ${item}`);
            }	
        });
    return rtn;
}

/**
 * Given a date return the date string in ISO format with the timezone removed
 * @param inputDate The date to convert to the iso string without the timezone
 * @returns An iso representation of the date without the timezone
 */
export function getTrimmedISODate(inputDate: Date | string): string {
    const targetDate: Date = (typeof(inputDate) === 'string') ? new Date(inputDate) : inputDate;
    return targetDate.toISOString().split('.')[0]+"Z";
}


/**
 * Determine if a jsCalendar LocalDateTime string contains time zone information. 
 * @param dateTime The date/time string
 * @returns True if the date/time string contains time zone information; otherwise false
 */
export function hasTimeZone(dateTime: string): boolean {
    const regex = /^(?:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?)(Z|[\+-]\d{2}:\d{2})?$/gm;
    const match = regex.exec(dateTime);
    return (match !== null && match.length === 2 && match[1] !== undefined);
}

/**
 * Add time zone information to a jsCalendar LocalDateTime string that does not include time zone
 * @param dateTime The date/time string
 * @param zone The time zone to add to the date/time string. This time zone will only be use if the date/time string does not contain a time zone. 
 * @returns A jsCalendar LocalDateTime string that includes time zone information.
 */
export function addTimeZone(dateTime: string, zone: string): string {
    if (!hasTimeZone(dateTime)) {
        const st = DateTime.fromISO(dateTime, {zone});
        return st.toISO({ includeOffset: st.zone.type === 'local' ? false : true });
    }

    return dateTime; // String already contains time zone
}

/**
 * Get an IANA compliant time zone from a DateTime zoneName.
 * @param zoneName The zone name from a DateTime Zone.
 * @returns The IANA compliant time zone name.
 */
export function getIANATimeZone(zoneName: string): string {
    let zone = zoneName; 
    if (zoneName.startsWith('UTC')) {
        // If the zoneName is UTC and it contains the offset (e.g. UTC-5), then convert it to a GMT IANA time zone name (e.g. GMT+5)
        // See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
        if (zoneName.length > 3) {
            let iana = zoneName.replace('UTC', 'GMT');
            iana = iana.indexOf('+') !== -1 ? iana.replace('+', '-') : iana.replace('-', '+');
            zone = `Etc/${iana}`; 
        }
        else {
            zone = 'Etc/UTC'
        }
    }

    if (!IANAZone.isValidZone(zone)) {
        throw new Error(`${zone} is not a valid IANA time zone`);
    }
    
    return zone;
    
}

/**
 *  Return whether this app is in development mode. 
 * 
 *  The loopback application that includes the openclient-keepcomponent must set the NODE_ENV environment variable to "development" for this to return true. 
 * 
 *  @returns if the node app is in development mode
 */
export function isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
}
