
/** Recurrence frequency. Defined in jsCalendar RFC under [recurrenceRules](https://datatracker.ietf.org/doc/html/draft-ietf-calext-jscalendar#section-4.3.2) */
export enum PimRecurrenceFrequency {
    /** Event occurs every year */
    YEARLY = "yearly",
    /** Event occurs every month */
    MONTHLY = "monthly",
    /** Event occurs every week */
    WEEKLY = "weekly",
    /** Event occurs every day */
    DAILY = "daily",
    /** Event occurs every hour */
    HOURLY = "hourly",
    /** Event occurs every minute */
    MINUTELY = "minutely",
    /** Event occurs every second */
    SECONDLY = "secondly"
}

/** 
 * The behaviour to use when the expansion of the recurrence produces invalid dates.  
 * 
 * This property only has an effect if the frequency is YEARLY or MONTHLY.  */
export enum PimRecurrenceSkip {
    /** Ignore the invalid dates */
    OMIT = "omit",
    /** A date with an invalid month is changed to the previous (valid) month.  A date with an invalid day-of-month is changed to the previous (valid) day-of-month. */
    BACKWARD = "backward",
    /** A date with an invalid month is changed to the next (valid) month.  A date with an invalid day-of-month is changed to the next (valid) day-of-month. */
    FORWARD = "forward"
}

/**
 * Day of the week
 */
export enum PimRecurrenceDayOfWeek {
    MONDAY = "mo",
    TUESDAY = "tu",
    WEDNESDAY = "we",
    THURSDAY = "th",
    FRIDAY = "fr",
    SATURDAY = "sa",
    SUNDAY = "su"
}

/**
 * Day of the week on which to repeat.
 */
export interface PimRecurrenceNDay {
    /** A day of the week on which to repeat */
    day: PimRecurrenceDayOfWeek;
    /** If present, rather than representing every occurrence of the weekday defined in the "day" property, it represents only a specific instance within the recurrence period.  
     * The value can be positive or negative, but MUST NOT be zero.  A negative integer means nth-last of period. 
     */
    nthOfPeriod?: number;
}

/**
 * Rule that decribes how an event recurs. 
 */
export class PimRecurrenceRule {

    /** jsCalendar RFC compliant RecurrenceRule */
    private jmapObject: any;  

    /**
     * Create a recurrence rule from a JMAP RecurrenceRule object.
     * @param recurrenceObject A RecurrenceRule object from a JMAP event.
     */
    constructor(recurrenceObject: any) {
        if (recurrenceObject["@type"] === undefined) {
            // Type is required
            this.jmapObject = { ...recurrenceObject, ...{"@type": "RecurrenceRule"}};
        }
        else {
            this.jmapObject = recurrenceObject;
        }
    }

    /**
     * The time span covered by each iteration of this recurrence rule
     */
    get frequency(): PimRecurrenceFrequency {
        return this.jmapObject.frequency;
    }

    /**
     * Set the time span covered by each iteration of this recurrence rule.
     */
    set frequency(frequency: PimRecurrenceFrequency) {
        this.jmapObject.frequency = frequency; 
    }

    /**
     * The interval of iteration periods at which the recurrence repeats.
     */
    get interval(): number {
        return this.jmapObject.interval ?? 1; 
    }

    /**
     * Set the interval of iteration periods at which the recurrence repeats.
     * 
     * The value MUST be an integer >= 1.
     */
    set interval(interval: number) {
        this.jmapObject.interval = Math.max(1, Math.abs(interval)); 
    }

    /**
     * The calendar system in which this recurrence rule operates.
     * 
     * The value is either a CLDR-registered calendar system name [CLDR](http://cldr.unicode.org/), or a [vendor-specific value](https://datatracker.ietf.org/doc/html/draft-ietf-calext-jscalendar#section-3.3).  
     */
    get rscale(): string {
        return this.jmapObject.rscale ?? "gregorian"; 
    }

    /**
     * Set the calendar system in which this recurrence rule operates.  
     * 
     * The value MUST be either a CLDR-registered calendar system name [CLDR](http://cldr.unicode.org/), or a [vendor-specific value](https://datatracker.ietf.org/doc/html/draft-ietf-calext-jscalendar#section-3.3).
     */
    set rscale(rscale: string) {
        this.jmapObject.rscale = rscale; 
    }

    /**
     * The behaviour to use when the expansion of the recurrence produces invalid dates.  
     * 
     * This property only has an effect if the frequency is YEARLY or MONTHLY.
     */
    get skip(): PimRecurrenceSkip {
        return this.jmapObject.skip ?? PimRecurrenceSkip.OMIT; 
    }

    /**
     * Set th behaviour to use when the expansion of the recurrence produces invalid dates.  
     * 
     * This property only has an effect if the frequency is YEARLY or MONTHLY.
     */
    set skip(skip: PimRecurrenceSkip) {
        this.jmapObject.skip = skip; 
    }

    /**
     * The day on which the week is considered to start.
     */
    get firstDayOfWeek(): PimRecurrenceDayOfWeek {
        return this.jmapObject.firstDayOfWeek ?? PimRecurrenceDayOfWeek.MONDAY; 
    }

    /**
     * Set the day on which the week is considered to start.
     */
    set firstDayOfWeek(dayOfWeek: PimRecurrenceDayOfWeek) {
        this.jmapObject.firstDayOfWeek = dayOfWeek; 
    }

    /**
     * Days of the week on which to repeat.
     */
    get byDay(): PimRecurrenceNDay[] | undefined {
        return this.jmapObject.byDay; 
    }

    /**
     * Set days of the week on which to repeat.
     */
    set byDay(byDay: PimRecurrenceNDay[] | undefined) {
        if (byDay !== undefined) {
            byDay.forEach((day: any) => day["@type"] = "NDay"); // Add the manditory type for jsCalendar
        }
        this.jmapObject.byDay = byDay;
    }

     /**
     * Days of the month on which to repeat.  Valid values are between 1 and the maximum number of days any month may have in the calendar
     * given by the "rscale" property, and the negative values of these numbers.  
     */
    get byMonthDay(): number[] | undefined {
        return this.jmapObject.byMonthDay; 
    }

    /**
     * Set days of the month on which to repeat.  Valid values are between 1 and the maximum number of days any month may have in the calendar
     * given by the "rscale" property, and the negative values of these numbers.  
     * 
     * For example, in the Gregorian calendar valid values are 1 to 31 and -31 to -1.  Negative values offset from the end of the month.  
     * 
     * The array MUST have at least one entry if included.
     */
    set byMonthDay(monthDays: number[] | undefined) {
        this.jmapObject.byMonthDay = monthDays?.length === 0 ? undefined : monthDays; 
    }

    /**
     * The months in which to repeat.  Each entry is a string representation of a number, starting from "1" for the first month in the calendar 
     * (e.g., "1" means January with the Gregorian calendar), with an optional "L" suffix (see [RFC7529]) for leap months (this MUST be uppercase, e.g., "3L").  
     */
    get byMonth(): string[] | undefined {
        return this.jmapObject.byMonth; 
    }

    /**
     * The months in which to repeat. 
     * 
     * See get byMonth for a description of the values. The array MUST have at least one entry.
     */
    set byMonth(months: string[] | undefined) {
        this.jmapObject.byMonth = months?.length === 0 ? undefined : months; 
    }

    /**
     * The days of the year on which to repeat.  Valid values are between 1 and the maximum number of days any year may have in the calendar given by the "rscale" property, 
     * and the negative values of these numbers.  
     * 
     * For example, in the Gregorian calendar valid values are 1 to 366 and -366 to -1.  Negative values offset from the end of  the year.
     */
    get byYearDay(): number[] | undefined {
        return this.jmapObject.byYearDay; 
    }

    /**
     * The days of the year on which to repeat. 
     * 
     * See get byMonth for a description of the values. The array MUST have at least one entry.
     */
    set byYearDay(yearDays: number[] | undefined) {
        this.jmapObject.byYearDay = yearDays?.length === 0 ? undefined : yearDays; 
    }

    /**
     * Weeks of the year in which to repeat.  Valid values are between 1 and the maximum number of weeks any year may have in the calendar given by the "rscale" property, 
     * and the negative values of these numbers.  For example, in the Gregorian calendar valid values are 1 to 53 and -53 to -1. 
     */
    get byWeekNo(): number[] | undefined {
        return this.jmapObject.byWeekNo;
    }

    /**
     * Weeks of the year in which to repeat.
     * 
     * See get byWeekNo for a description of the values. The array MUST have at least one entry.
     */
    set byWeekNo(weekNos: number[] | undefined) {
        this.jmapObject.byWeekNo = weekNos?.length === 0 ? undefined : weekNos; 
    }

    /**
     * The hours of the day in which to repeat.  Valid values are 0 to 23.
     */
    get byHour(): number[] | undefined {
        return this.jmapObject.byHour;
    }

    /**
     * The hours of the day in which to repeat.  
     * 
     * Valid values are 0 to 23. The array MUST have at least one entry.
     */
    set byHour(hours: number[] | undefined) {
        this.jmapObject.byHour = hours?.length === 0 ? undefined : hours; 
    }

    /**
     * The minutes of the hour in which to repeat.  Valid values are 0 to 59. 
     */
     get byMinute(): number[] | undefined {
        return this.jmapObject.byMinute;
    }

    /**
     * The minutes of the hour in which to repeat.
     * 
     * Valid values are 0 to 59. The array MUST have at least one entry.
     */
    set byMinute(minutes: number[] | undefined) {
        this.jmapObject.byMinute = minutes?.length === 0 ? undefined : minutes; 
    }

    /**
     * The seconds of the minute in which to repeat.  Valid values are 0 to 60. 
     */
     get bySecond(): number[] | undefined {
        return this.jmapObject.bySecond;
    }

    /**
     * The seconds of the minute in which to repeat.
     * 
     * Valid values are 0 to 60. The array MUST have at least one entry.
     */
    set bySecond(seconds: number[] | undefined) {
        this.jmapObject.bySecond = seconds?.length === 0 ? undefined : seconds; 
    }

    /**
     * The occurrences within the recurrence interval to include in the final results.  Negative values offset from the end of the list of occurrences.
     */
     get bySetPosition(): number[] | undefined {
        return this.jmapObject.bySetPosition;
    }

   /**
     * The occurrences within the recurrence interval to include in the final results.  
     * 
     * Negative values offset from the end of the list of occurrences. The array MUST have at least one entry.
     */
    set bySetPosition(positions: number[] | undefined) {
        this.jmapObject.bySetPosition = positions?.length === 0 ? undefined : positions; 
    }

    /**
     * The number of occurrences at which to range-bound the recurrence.
     */
    get count(): number | undefined {
        return this.jmapObject.count;
    }

    /**
     * The number of occurrences at which to range-bound the recurrence.
     * 
     * This MUST NOT be set if an "until" value is set.
     */
    set count(count: number | undefined) {
        this.jmapObject.count = count; 
        this.jmapObject.until = undefined; 
    }

    /**
     * The date-time string at which to finish recurring.  The last occurrence is on or before this date-time.  
     * 
     * Note: If the string does not contain a timezone, it should be interpreted in the time zone specified by the owning event object's "timeZone" property.
     */
    get until(): string | undefined {
        return this.jmapObject.until; 
    }

     /**
     * Set the date-time string at which to finish recurring.  The last occurrence is on or before this date-time.  
     * 
     * This MUST NOT be set if a "count" value is set.  
     * 
     * Note: If the string does not contain a timezone, it will be interpreted in the time zone specified by the owning event object's "timeZone" property.
     */
    set until(until: string | undefined) {
        this.jmapObject.until = until; 
        this.jmapObject.count = undefined; 
    }

    /**
     * Returns a structure that can be used in the PimCalendar or PimTask for recurrenceRules. 
     * @returns An object matching the RecurrencRule JMAP spec. 
     */
     public toPimStructure(): object {
        return this.jmapObject;
    }
}