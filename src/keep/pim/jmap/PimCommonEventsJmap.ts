import { KeepPimConstants } from '../KeepPimConstants';
import { v4 as uuidv4 } from 'uuid';
import { isDevelopment, Logger, PimItemJmap } from '../../../internal';
import moment from 'moment';
import { DateTime, DateTimeOptions } from 'luxon';
import { PimRecurrenceRule } from './PimRecurrenceRule';
import { getIANATimeZone } from '../../..';
import { PimParticipationStatus } from '..';

export class JmapParticipant {
    type: string;
    email: string;
    roles: any;
    participationStatus?: PimParticipationStatus; 
    progress?: string;
}

export enum JmapAlertAction {
    ALERT_EMAIL = "email",
    ALERT_DISPLAY = "display"
}

export class JmapAlert {
    trigger: OffsetTrigger | AbsoluteTrigger | UnknownTrigger;
    '@type' = "Alert";
    acknowledged?: Date;
    relatedTo?: string;
    action?: JmapAlertAction
}

export class OffsetTrigger {
    '@type' = "OffsetTrigger";
    offset: string;  // SignedDuration (e.g. 'PT13S')
    relativeTo?: string;
}
export class AbsoluteTrigger {
    '@type' = "AbsoluteTrigger";
    when: Date;
}
export class UnknownTrigger {
    '@type': string;
}
/**
 * This class is a superclass of PimTask and PimCalendarItem to provide
 * shared functionality for the two calendar-related item types.
 */
export abstract class PimCommonEventsJmap extends PimItemJmap {

    /**
     * Common setters and getters
     */

    /**
     * Get the recurrenceId. 
     * 
     * If present, this item represents a single occurrence of a recurring event.  If present the "recurrenceRules" and 
     * "recurrenceOverrides" properties MUST NOT be present.
     */
    get recurrenceId(): string | undefined {
        return this.jmapObject.recurrenceId;
    }

    /**
     * Set the recurrenceId for an instance of a recurring event. 
     * 
     * Attempting to set this value if "recurrenceRules" or "recurrenceOverrides" properties are set will be ignored.
     */
    set recurrenceId(id: string | undefined) {
        if ((this.recurrenceRules ?? []).length === 0 && this.recurrenceOverrides === undefined) {
            this.jmapObject.recurrenceId = id;
        }
        else {
            Logger.getInstance().warn(`Ignoring set recurrenceId ${id} since recurrence rules or overrides are already set`);
        }
    }

    /**
     * Return the recurrence rules for this event.
     */
    get recurrenceRules(): PimRecurrenceRule[] | undefined {
        const rules: any[] = [];
        if (this.jmapObject.recurrenceRules !== undefined && Array.isArray(this.jmapObject.recurrenceRules)) {
            this.jmapObject.recurrenceRules.forEach((rule: any) => {
                rules.push(new PimRecurrenceRule(rule));
            });
        }

        return rules.length > 0 ? rules : undefined;
    }

    /**
     * Set the recurrence rules for this event.
     * 
     * Attempting to set this value when the "recurrenceId" property is already set will be ignored. 
     */
    set recurrenceRules(rules: PimRecurrenceRule[] | undefined) {
        if (this.recurrenceId === undefined) {
            if (rules !== undefined && rules.length > 0) {
                this.jmapObject.recurrenceRules = rules.map(rule => rule.toPimStructure());
            }
            else {
                this.jmapObject.recurrenceRules = undefined;
            }
        } else {
            Logger.getInstance().warn(`Ignoring set recurrence rules since recurrence id ${this.recurrenceId} is already set`);
        }
    }

    /**
     * Returns a set of recurrence rules for date-times on which the object will not occur.
     */
    get excludedRecurrenceRules(): PimRecurrenceRule[] | undefined {
        const rules: any[] = [];
        if (this.jmapObject.excludedRecurrenceRules !== undefined && Array.isArray(this.jmapObject.excludedRecurrenceRules)) {
            this.jmapObject.excludedRecurrenceRules.forEach((rule: any) => {
                rules.push(new PimRecurrenceRule(rule));
            });
        }

        return rules.length > 0 ? rules : undefined;
    }

    /**
     * Set the excludeRecurrenceRules for this event
     */
    set excludedRecurrenceRules(rules: PimRecurrenceRule[] | undefined) {
        if (rules !== undefined) {
            this.jmapObject.excludedRecurrenceRules = rules.map(rule => rule.toPimStructure());
        }
        else {
            this.jmapObject.excludedRecurrenceRules = undefined;
        }
    }


    /**
     * Returns overriding values that should be applied to occurences of a recurring event. 
     * 
     * The returned object properties are dates of a specific occurence and the value is an object containing overriding property values. TODO: Is there more we need to do here (LABS-1902)
     */
    get recurrenceOverrides(): any | undefined {
        return this.jmapObject.recurrenceOverrides;
    }

    /**
     * Set overriding values that should be applied to occurences of a recurring event.
     * 
     * The object properties are dates of a specific occurence and the value is an object containing overriding property values. TODO: Is there more we need to do here (LABS-1902)
     * 
     * Attempting to set this value when the "recurrenceId" property is already set will be ignored. 
     */
    set recurrenceOverrides(overrides: any | undefined) {
        if (this.recurrenceId === undefined) {
            this.jmapObject.recurrenceOverrides = overrides;
        } else {
            Logger.getInstance().warn(`Ignoring set recurrence rules since recurrence id ${this.recurrenceId} is already set`);
        }
    }

    /**
    * Returns the start date for the item. 
    * 
    * If this is a recurring item, this is the start of the first occurrence. recurrenceRules will return the rules for calculating other occurrences of this item.
    */
    get start(): string | undefined {
        if (this.jmapObject.start) {
            let st = DateTime.fromISO(this.jmapObject.start);

            if (this.startTimeZone) {
                st = st.setZone(this.startTimeZone, { keepLocalTime: true });
            }

            // Don't include the timezone if it is local. This means no startTimeZone set. 
            return st.toISO({ includeOffset: st.zone.type === 'local' ? false : true });
        }

        return undefined;
    }

    /**
     * Set start date for the item.
     * 
     * If this is a recurring item, this is the start of the first occurrence.
     */
    set start(start: string | undefined) {
        if (start) {
            // If the startTimeZone is not set, use the time zone in the string if specified.
            // Otherwise use the time zone set by startTimeZone.
            const opts: DateTimeOptions = this.startTimeZone === undefined ? {setZone: true} : {zone: this.startTimeZone};
            const st = DateTime.fromISO(start, opts);

            // Zone type local indicates that the start string did not contain a time zone
            if (this.startTimeZone === undefined && st.zone.type !== 'local') {
                this.startTimeZone = getIANATimeZone(st.zoneName);
            }
            this.jmapObject.start = st.toISO({ includeOffset: false });
        }
        else {
            this.jmapObject.start = start;
        }

    }

    /**
     * Returns the time zone for the start date/time.
     */
    get startTimeZone(): string | undefined {
      // Remove when LABS-2078, 2515 are fixed
      if (this.jmapObject.timeZone && this.jmapObject.timeZone.startsWith('Z=')) {
        this.jmapObject.timeZone = 'America/New_York';
      }
        return this.jmapObject.timeZone;
    }

    /**
     * Set the start date time zone. 
     * @param zoneName The start time zone name
     * @throws An error if the start time zone is not valid 
     */
    set startTimeZone(zoneName: string | undefined) {
        let zone = zoneName;
        if (zoneName !== undefined && zoneName.length !== 0) {
            zone = getIANATimeZone(zoneName); // Convert UTC to a valid zone if needed
        }

        this.jmapObject.timeZone = zone;
    }

    /**
     * Returns the minutes for the start of this item that an alarm should be shown.
     * 
     * An alert looks like:
     * 
     * "Alert": {
     *  "type": "Alert",
     *  "trigger": "OffsetTrigger",
     *  "offset": 15
     * }
     * 
     * or
     * 
     * "Alert": {
     *  "type": "Alert",
     *  "trigger": "AbsoluteTrigger",
     *  "when": "timestamp string"
     * }
     */
    get alarm(): number | undefined {
        // Currently only supporting OffsetTrigger
        // TODO:  Do we need to support AbsoluteTrigger?
        if (this.jmapObject && this.jmapObject.alerts) {
            const jAlerts: JmapAlert[] = Object.values(this.jmapObject.alerts);
            if (jAlerts) {
                const offsetAlert: JmapAlert | undefined = jAlerts.find(alert => alert.trigger && alert.trigger['@type'] === 'OffsetTrigger');
                if (offsetAlert !== undefined) {
                    const offset = (offsetAlert.trigger as OffsetTrigger).offset ?? 0;
                    const rounded = Math.round(moment.duration(offset).asMinutes() ?? 0);
                    return rounded === 0 ? Math.abs(rounded) : rounded;
                } else {
                    Logger.getInstance().warn('Processing an alert with a trigger that is not an OffsetTrigger');
                }
            }
        }

        return undefined;
    }

    /**
     * Set the minutes relative to the start of this item that an alarm should be shown.
     * @param alarm The number of minutes relative to the start of this item to trigger the alarm.  Note: For before, the number should be negative
     */
    set alarm(alarm: number | undefined) {
        // We currently support 1 alarm
        if (alarm === undefined) {
            // remove the alarm
            delete this.jmapObject.alerts;
        } else {
            this.jmapObject.alerts = {};
            const alert = new JmapAlert();
            const trigger = new OffsetTrigger();
            trigger.offset = moment.duration(alarm, 'm').toISOString();
            alert.trigger = trigger;
            this.jmapObject.alerts[uuidv4()] = alert;
        }
    }

    /**
     * Helper functions
     */

    /**
     * Gets all the participants of a meeting or task.
     * @param jmapObject The JMAP object from which to extract the participants.
     * @returns All participants of a Jmap object.
     */
    protected getParticipants(): JmapParticipant[] {
        let participants: JmapParticipant[] = [];
        if (this.jmapObject.participants) {
            participants = Object.values(this.jmapObject.participants);
        }
        return participants;
    }

    /**
     * Get a list of the participant objects of a task or event with the specified email.
     * @param jmapObject The JMAP object from which to extract the participaants.
     * @param email The email id of the participant.
     * @returns An array of participants with the matching email.
     */
    protected getParticipantsWithEmail(email: string): JmapParticipant[] {
        return this.getParticipants().filter(participant => participant.email && participant.email === email);
    }

    /**
     * Get a list of the participants of a task or event with the specified role.
     * @param jmapObject The JMAP object from which to extract the participaants.
     * @param role The participant role to choose.
     * @returns An array of participants with the matching role.
     */
     protected getParticipantsWithRole(role: string): JmapParticipant[] {
        return this.getParticipants().filter(participant => participant.roles && participant.roles[role]);
    }

    /**
     * Remove a participant from a task or event.
     * @param jmapObject The JMAP object from which to remove a participant.
     * @param email The email address of the participant to remove.  If undefined, then remove all 
     *              participants with the specified role.
     * @param role A specific role to remove.  If undefined, then all participants matching email
     *             will be removed.
     * NOTE:  If both email and role are undefined, all participants will be removed.
     */
    protected removeParticipants(email?: string, role?: string): void {
        if (this.jmapObject.participants) {
            for (const pKey of Object.keys(this.jmapObject.participants)) {
                const participant = this.jmapObject.participants[pKey];
                const participantRoles = participant.roles ?? {};
                if ((email === undefined || email === participant.email)
                    && (role === undefined || participantRoles[role])) {
                    delete this.jmapObject.participants[pKey];
                }
            }
        }
    }

    /**
     * Remove a participant role from a task or event.  If roles is empty, remove the participant.
     * @param email The email address of the participant to remove the role.  
     * @param role A specific role to remove.  
     */
    protected removeParticipantRole(email: string, role: string): void {
        if (this.jmapObject.participants) {
            for (const pKey of Object.keys(this.jmapObject.participants)) {
                const participant = this.jmapObject.participants[pKey];
                const participantRoles = participant.roles ?? {};
                if (email === participant.email && participantRoles[role]) {
                    delete participantRoles[role];
                    if (Object.keys(participantRoles).length > 0) {
                        participant.roles = participantRoles;
                    } else {
                        delete this.jmapObject.participants[pKey];
                    }
                }
            }
        }
    }

    /**
     * This function will update an existing participant or add on if it doesn't already exist.
     * @param email Email address of the participant to update or add.
     * @param role The role to assign to the participant.
     */
    protected addOrUpdateParticipant(email: string, role: string): void {
        const participantId = this.getParticipantId(email);
        if (participantId) {
            let roles = this.jmapObject.participants[participantId].roles;
            if (roles === undefined) {
                roles = {};
            }
            roles[role] = true;
            this.jmapObject.participants[participantId].roles = roles;
        } else {
            if (this.jmapObject.participants === undefined) {
                this.jmapObject.participants = {};
            }
            const newRoles: any = {};
            newRoles[role] = true;
            const participant: JmapParticipant = {
                type: KeepPimConstants.TYPE_PARTICIPANT,
                email: email,
                roles: newRoles
            };

            this.jmapObject.participants[uuidv4()] = participant;
        }
    }

    /**
     * Fetch the JMAP participant ID of the participant with the passed in email address.
     * @param email The email address of the participant to find.
     * @returns The UID of the participant or undefined if not found.
     */
    public getParticipantId(email: string): string | undefined {
        if (this.jmapObject.participants) {
            for (const pKey of Object.keys(this.jmapObject.participants)) {
                const participant = this.jmapObject.participants[pKey];
                if (email === participant.email) {
                    return pKey;
                }

                // We'll ignore the domain if we didnt' find a match and are in debug mode
                if (isDevelopment()) {
                    let emailCompare = email;
                    let pEmailCompare = participant.email;
                    let idx = emailCompare.indexOf('@');
                    if (idx >= 0) {
                        emailCompare = emailCompare.substring(0, idx);
                    }

                    idx = pEmailCompare.indexOf('@');
                    if (idx >= 0) {
                        pEmailCompare = pEmailCompare.substring(0, idx);
                    }

                    if (pEmailCompare === emailCompare) {
                        return pKey;
                    }
                }
            }
        }
        return undefined;
    }

    /**
     * This function determines if a JMAP participant is required.  We interpret this as any participant that either has 
     * the 'attendee', 'owner' or 'chair' role.
     * @param participant The participant record to check.
     * @returns True if the participant is a required participant.
     */
    protected isParticipantRequired(participant: JmapParticipant): boolean {
        if (participant.roles && (participant.roles[KeepPimConstants.ROLE_ATTENDEE] === true ||
            participant.roles[KeepPimConstants.ROLE_CHAIR] === true)) {
            return true;
        }
        return false;
    }

}