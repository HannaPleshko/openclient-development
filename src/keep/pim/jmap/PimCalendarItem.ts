
import { JmapParticipant, Logger, PimCommonEventsJmap } from "../../../internal";
import { KeepPimConstants, PimImportance } from "../KeepPimConstants";
import { v4 as uuidv4 } from 'uuid';
import { DateTime, IANAZone, Interval } from "luxon";
import { PimParticipationStatus } from "..";
import { getIANATimeZone } from "../../..";
const moment = require('moment');

/**
 * Represents a calendar item returned from the Keep PIM calendar api. 
 */
export class PimCalendarItem extends PimCommonEventsJmap {

    protected calName: string;

    /** The end date set if the start date has not be set. Used to calculate the duration when the start date it set. */
    protected endString: string | undefined;

    /**
     * Create a calendar item object from Keep API data. 
     * @param calItemObject Calendar object returned by the Keep calendar API.
     * @param calName The calendar in Keep
     * @param format The format of the calenar object. PimItemFormat.DOCUMENT if the API was to retrieve a single calendar item. PimItemFormat.PRIMITIVE if the API was to retrieve a list of calendar items. 
     */
    constructor(calItemObject: any, calName: string) {
        super(calItemObject);
        if (!this.jmapObject['@type']) {
            this.jmapObject['@type'] = this.type;
        }
        this.calName = calName;
        return this;
    }

    /**
     * Return true if this object implements the PimCalendarItem interface
     * @return True for this class
     */
    isPimCalendarItem(): this is PimCalendarItem {
        return true;
    }

    // return jsevent for a calendarItem
    get type(): string {
        return this.jmapObject['@type'] ?? 'jsevent';
    }

    /**
     * Returns the calender name for the calendar that owns this calendar item.
     */
    get calendarName(): string {
        return this.calName;
    }

    /**
     * Set the calendar name for this calendar item. 
     */
    set calendarName(name: string) {
        this.calName = name;
    }

    // JMAP uses a priority field to indicate relative priority.  It is an integer
    // ranging from 0 to 9.  0 means undefined, 1 is the highest and 9 is the lowest.
    // PimImportance can be NONE, HIGH, MEDIUM or LOW.
    // Proposal:  Map priority to importance using:
    //            0 --> NONE
    //            1-3 --> HIGH
    //            4-6 --> MEDIUM
    //            7-9 --> LOW
    // 
    /**
     * Returns the importance of this calendar item.
     */
    get importance(): PimImportance {
        let importance = PimImportance.NONE;
        const priority = this.jmapObject.priority;
        if (priority !== undefined && (typeof (priority) === 'number')) {
            switch (true) {
                case (priority === 0):
                    break;
                case (priority <= 3):
                    importance = PimImportance.HIGH;
                    break;
                case (priority <= 6):
                    importance = PimImportance.MEDIUM;
                    break;
                case (priority <= 9):
                    importance = PimImportance.LOW;
                    break;
                default:
                    Logger.getInstance().warn(`Unexpected item priority ${priority}`);
            }
        }
        return importance;
    }

    /**
     * Set the importance of this calendar item.
     */
    set importance(importance: PimImportance) {
        let priority: number;
        switch (importance) {
            case PimImportance.NONE:
                priority = 0;
                break;
            case PimImportance.HIGH:
                priority = 1;
                break;
            case PimImportance.MEDIUM:
                priority = 5;
                break;
            case PimImportance.LOW:
                priority = 9;
        }
        this.jmapObject.priority = priority;
    }

    /**
     * Returns the location information.  Note that JMAP can have multiple locations.  For this getter,
     * we will return a single string with all location names, separated by ';'
     * TODO:  Change this to return an array, similar to how we do parentFolderId?
     */
    get location(): string | undefined {
        let loc: string | undefined = undefined;
        if (this.jmapObject.locations) {
            const locs = Object.values(this.jmapObject.locations);
            locs.forEach((location: any) => {
                const str = (location.name && location.name.length > 0) ? location.name : location.description;
                if (str) {
                    if (loc !== undefined) {
                        if (str.length > 0) {
                            loc = loc + `; ${str}`;
                        }
                    } else if (str.length > 0) {
                        loc = str;
                    }
                }
            });
        }
        return loc;
    }

    /**
     * For now, this will update the name of the first location, or remove it if undefined is passed in
     * TODO:  Should we force the caller to idnetify which location they are changing?
     */
    set location(location: string | undefined) {
        if (this.jmapObject.locations === undefined) {
            this.jmapObject.locations = {};
        }
        const keys = Object.keys(this.jmapObject.locations);
        if (keys.length > 0) {
            if (location === undefined || location.length === 0) {
                delete this.jmapObject.locations[keys[0]];
            } else {
                this.jmapObject.locations[keys[0]]['name'] = location;
            }
        } else if (location) {
            // No existing locations.  Add one if location has a value
            this.jmapObject.locations[uuidv4()] = { '@type': 'Location', 'name': location }
        }
    }

    // Return the duration for the calendar event
    get duration(): string | undefined {
        return this.jmapObject.duration;
    }

    // Store the duration for the calendar event
    // Note: Changing this will cause the retrieved end dates to change
    set duration(duration: string | undefined) {
        this.jmapObject.duration = duration;
        // If there was a temporary endDate set prior to calling this, then remove it since duration takes precedence.
        if (this.jmapObject.endDate) {
            delete this.jmapObject.endDate;
        }
    }

    // Override start to calculate duration if a end was set.
    set start(start: string | undefined) {

        super.start = start;

        if (this.endString) {
            // Set the end now so duration is calulated
            this.end = this.endString;
            this.endString = undefined;
        }
    }

    // Since set is overridden, must also override get
    get start(): string | undefined {
        return super.start;
    }

    /**
     * Returns the end date for a single event.
     * 
     * If recurrenceRules is set this is the end date for the first occurence.
     */
    get end(): string | undefined {
        // Must compute end date using start date and duration
        if (this.start) {
            let dt = DateTime.fromISO(this.start, { setZone: true }); 

            // Add duration to the start date.
            const millis = moment.duration(this.duration ?? 'PT0S').asMilliseconds();
            dt = dt.plus(millis);

            // If set, set the end time zone for the returned date
            if (this.endTimeZone) {
                const endZone = IANAZone.create(this.endTimeZone); 
                dt = dt.setZone(this.endTimeZone, { keepLocalTime: dt.zone.equals(endZone) ? true : false }); // only adjust end time if time zone different than start
            }

             // Don't include the timezone if it is local. This means no endTimeZone set. 
            return dt.toISO({ includeOffset: dt.zone.type === 'local' ? false : true });

        }
        else if (this.endString) {
            return this.endString;
        }

        return undefined;
    }

    /**
     * Set the end date for a single event.
     * 
     * If recurrenceRules is set this is the end date for the first occurence.
     */
    set end(end: string | undefined) {
        if (end) {
            if (this.start) {
                const st = DateTime.fromISO(this.start, { setZone: true }); // Start will return the correct timezone
                const et = DateTime.fromISO(end, { zone: this.endTimeZone, setZone: this.endTimeZone === undefined ? true : false });

                if (this.endTimeZone === undefined && et.zone.type !== 'local') {
                    this.endTimeZone = getIANATimeZone(et.zoneName);
                }

                // Calculate the interval between the start and end then convert it to an ISO duration string. 
                const interval = Interval.fromDateTimes(st, et);
                this.duration = interval.toDuration(["years", "months", "weeks", "days", "hours", "minutes", "seconds"]).toISO(); 
            }
            else {
                this.endString = end; // Save until start set and duration can be calculated
            }
        }
        else {
            this.duration = undefined;
            this.endString = undefined; 
        }
    }

    /**
     * Returns the time zone for the end date/time.
     */
    get endTimeZone(): string | undefined {
        // In JMAP, the end timezone is specified in a location with a 'rel' equal to 'end'
        if (this.jmapObject.locations && Object.keys(this.jmapObject.locations).length > 0) {
            for (const key in this.jmapObject.locations) {
                if (this.jmapObject.locations[key]['relativeTo'] === 'end') {
                    return this.jmapObject.locations[key]['timeZone'];
                }
            }
        }
        return undefined;
    }

    /**
     * Set the end date time zone. 
     * @param zoneName The end time zone name
     * @throws An error if the end time zone is not valid. 
     */
    set endTimeZone(zoneName: string | undefined) {
        let zone = zoneName;
        if (zoneName !== undefined && zoneName.length !== 0) {
            zone = getIANATimeZone(zoneName); // Convert UTC to a valid zone if needed
        }

        if (this.jmapObject.locations && Object.keys(this.jmapObject.locations).length > 0) {
            for (const key in this.jmapObject.locations) {
                if (this.jmapObject.locations[key]['relativeTo'] === 'end') {
                    this.jmapObject.locations[key]['timeZone'] = zone;
                    return;
                }
            }
        }
        // No end location found.  Create one
        if (this.jmapObject.locations === undefined) {
            this.jmapObject.locations = {};
        }
        this.jmapObject.locations[uuidv4()] = { 'relativeTo': 'end', 'timeZone': zone };
    }

    /**
     * Returns the true if this item represents an appointment (no invitees).
     * Appointment means an item with no participants and not a full day duration
     */
    get isAppointment(): boolean {
        const noParticipants = this.getParticipants().length === 0;
        const hasDuration = moment.duration(this.duration ?? 'PT0S').asMilliseconds() > 0;
        return (noParticipants && hasDuration && !this.isAllDayEvent)
    }

    /**
     * Returns the true if this item represents an all day event. 
     */
    get isAllDayEvent(): boolean {
        const noParticipants = this.getParticipants().length === 0; // Domino does not support all day events with attendees
        return (noParticipants && this.jmapObject.showWithoutTime === true);
    }

    /**
     * Set if this event is an all day event.
     * @param allDay True if this should be made an all day event. False if it should not be an all day event.
     * @throws An error if allDay is true and there are participants set for this event or the event does not have a start date.
     */
    set isAllDayEvent(allDay: boolean) {
        if (allDay && this.getParticipants().length > 0) {
            throw new Error(`Unable to make an event with participants as all day`);
        }

        if (allDay && this.start === undefined) {
            throw new Error(`Unable to make an event without a start date as all day`);
        }

        this.jmapObject.showWithoutTime = allDay;
    }

    /**
     * Returns the true if this item represents a meeting with invitees.
     */
    get isMeeting(): boolean {
        return this.getParticipants().length > 0;
    }

    /**
     * Returns the true if this item represents a reminder.
     */
    get isReminder(): boolean {
        const noParticipants = this.getParticipants().length === 0;
        const noDuration = moment.duration(this.duration ?? 'PT0S').asMilliseconds() === 0;
        return noParticipants && noDuration;
    }

    /**
     * Returns the true if this item represents a due date for a Task.
     */
    get isTask(): boolean {
        return false;
    }

    /**
     * Returns if this is a draft item. 
     * TODO:  How do we tell if a JMAP item is a draft?
     */
    get isDraft(): boolean {
        return this.getAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_IS_DRAFT) ?? false;
    }

    set isDraft(draft: boolean) {
        this.setAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_IS_DRAFT, draft);
    }

    /**
     * Returns the organizer/author of the item.
     */
    get organizer(): string {
        const owners = this.getParticipantsWithRole('owner');
        if (owners.length > 0) {
            return owners[0].email;
        }
        return '';
    }

    set organizer(organizer: string) {
        // First remove all current owners
        this.removeParticipants(undefined, 'owner');
        // Now add or update the organizer's role
        this.addOrUpdateParticipant(organizer, KeepPimConstants.ROLE_OWNER);
    }

    /**
     * Returns the required attendees for a meeting item.
     */
    get requiredAttendees(): string[] {
        // Participiants with role attendee, chair or owner
        const required: string[] = [];

        if (this.jmapObject.participants) {
            Object.keys(this.jmapObject.participants).forEach((key: string) => {
                const participant = this.jmapObject.participants[key];
                if (this.isParticipantRequired(participant)) {
                    required.push(participant.email);
                }
            });
        }
        return required;
    }

    /**
     * When setting required attendees, we do the following:
     * - If a participant for the user already exists, set the attendee role to true and remove optional and/or informational roles
     * - If there is no existing participant for the user, add one and set the attendee role to true
     * - If there are any existing required attendees that are not included in the new list, remove them
     * - Do not remove owners
     */
    set requiredAttendees(attendees: string[]) {
        if (this.isAllDayEvent && attendees.length > 0) {
            throw new Error('Setting required attendees on an all day event is not permitted.');
        }

        let newAttendees: string[] = [...attendees];
        const toRemove: string[] = [];
        if (this.jmapObject.participants) {
            Object.keys(this.jmapObject.participants).forEach((key: string) => {
                const participant = this.jmapObject.participants[key];
                if (attendees.includes(participant.email)) {
                    if (!this.isParticipantRequired(participant)) {
                        // Set as required
                        participant.roles[KeepPimConstants.ROLE_ATTENDEE] = true;
                        // Remove optional and/or informational
                        delete participant.roles[KeepPimConstants.ROLE_OPTIONAL];
                        delete participant.roles[KeepPimConstants.ROLE_INFORMATIONAL];
                    }
                    // Remove from new attendees
                    newAttendees = newAttendees.filter((email: string) => email !== participant.email);
                } else {
                    // Remove attendee role
                    delete participant.roles[KeepPimConstants.ROLE_ATTENDEE];
                    // Also remove chair role since they are no longer required
                    delete participant.roles[KeepPimConstants.ROLE_CHAIR];
                    if (Object.keys(participant.roles).length === 0) {
                        // Has no other roles.  Add to list of participants to remove.
                        toRemove.push(participant.email);
                    }
                }
            });
        } else {
            this.jmapObject.participants = {};
        }

        toRemove.forEach(email => {
            this.removeParticipants(email);
        })

        // Add the remaining attendees as required.
        newAttendees.forEach(attendee => {
            const userRoles: any = {};
            userRoles[KeepPimConstants.ROLE_ATTENDEE] = true;
            const participant: JmapParticipant = {
                type: KeepPimConstants.TYPE_PARTICIPANT,
                email: attendee,
                roles: userRoles
            };

            this.jmapObject.participants[uuidv4()] = participant;
        });
    }

    /**
     * Returns the optional attendees for a meeting item.  If both optional and attendee roles are set, assume attendee.
     */
    get optionalAttendees(): string[] {
        // Participiants with optional role
        return this.getParticipantsWithRole(KeepPimConstants.ROLE_OPTIONAL).map(participant => participant.email);
    }

    /**
     * When setting optional attendees, we do the following:
     * - If the participant already exists, set the optional role and remove attendee and/or informational.
     * - If there is no existing participant for the user, add one with optional set to true.
     * - If an existing participant is marked as optional, but not in the new list, remove optional.
     */
    set optionalAttendees(attendees: string[]) {
        if (this.isAllDayEvent && attendees.length > 0) {
            throw new Error('Setting optional attendees on an all day event is not permitted.');
        }

        let newAttendees: string[] = [...attendees];
        const toRemove: string[] = [];
        if (this.jmapObject.participants) {
            Object.keys(this.jmapObject.participants).forEach((key: string) => {
                const participant = this.jmapObject.participants[key];
                if (attendees.includes(participant.email)) {
                    // Set as optional
                    participant.roles[KeepPimConstants.ROLE_OPTIONAL] = true;
                    // Remove attendee, chair and/or informational
                    delete participant.roles[KeepPimConstants.ROLE_ATTENDEE];
                    delete participant.roles[KeepPimConstants.ROLE_INFORMATIONAL];
                    delete participant.roles[KeepPimConstants.ROLE_CHAIR];
                    // Remove from new attendees
                    newAttendees = newAttendees.filter((email: string) => email !== participant.email);
                } else {
                    // Remove optional role
                    delete participant.roles[KeepPimConstants.ROLE_OPTIONAL];
                    if (Object.keys(participant.roles).length === 0) {
                        // Has no other roles.  Add to list of participants to remove.
                        toRemove.push(participant.email);
                    }
                }
            });
        } else {
            this.jmapObject.participants = {};
        }

        toRemove.forEach(email => {
            this.removeParticipants(email);
        })

        // Add the remaining attendees as optional.
        newAttendees.forEach(attendee => {
            const userRoles: any = {};
            userRoles[KeepPimConstants.ROLE_OPTIONAL] = true;
            const participant: JmapParticipant = {
                type: KeepPimConstants.TYPE_PARTICIPANT,
                email: attendee,
                roles: userRoles
            };

            this.jmapObject.participants[uuidv4()] = participant;
        });
    }

    /**
     * Returns the FYI users for a meeting item.
     */
    get fyiAttendees(): string[] {
        // Participiants with informational role
        return this.getParticipantsWithRole(KeepPimConstants.ROLE_INFORMATIONAL).map(participant => participant.email);
    }

    set fyiAttendees(attendees: string[]) {
        if (this.isAllDayEvent && attendees.length > 0) {
            throw new Error('Setting fyi attendees on an all day event is not permitted.');
        }

        let newAttendees: string[] = [...attendees];
        const toRemove: string[] = [];
        if (this.jmapObject.participants) {
            Object.keys(this.jmapObject.participants).forEach((key: string) => {
                const participant = this.jmapObject.participants[key];
                if (attendees.includes(participant.email)) {
                    // Set as informational
                    participant.roles[KeepPimConstants.ROLE_INFORMATIONAL] = true;
                    // Remove attendee, chair and/or optional
                    delete participant.roles[KeepPimConstants.ROLE_ATTENDEE];
                    delete participant.roles[KeepPimConstants.ROLE_OPTIONAL];
                    delete participant.roles[KeepPimConstants.ROLE_CHAIR];
                    // Remove from new attendees
                    newAttendees = newAttendees.filter((email: string) => email !== participant.email);
                } else {
                    // Remove informational role
                    delete participant.roles[KeepPimConstants.ROLE_INFORMATIONAL];
                    if (Object.keys(participant.roles).length === 0) {
                        // Has no other roles.  Add to list of participants to remove.
                        toRemove.push(participant.email);
                    }
                }
            });
        } else {
            this.jmapObject.participants = {};
        }

        toRemove.forEach(email => {
            this.removeParticipants(email);
        })
        // Add the remaining attendees as informational.
        newAttendees.forEach(attendee => {
            const userRoles: any = {};
            userRoles[KeepPimConstants.ROLE_INFORMATIONAL] = true;
            const participant: JmapParticipant = {
                type: KeepPimConstants.TYPE_PARTICIPANT,
                email: attendee,
                roles: userRoles
            };

            this.jmapObject.participants[uuidv4()] = participant;
        });
    }

    getParticipationStatus(participantEmail: string): PimParticipationStatus {
        const participants: JmapParticipant[] = this.getParticipantsWithEmail(participantEmail);
        if (participants && participants.length > 0) {
            for ( const participant of participants) {
                if (participant.participationStatus) {
                    return participant.participationStatus;
                }
            }
        }
        return PimParticipationStatus.NEEDS_ACTION;
    }
}