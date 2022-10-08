import { KeepPimConstants } from './KeepPimConstants';

/**
 * Represents a calender returned from the Keep PIM calendars api. 
 */
export class PimCalendar {
    private props: any = {};

    /**
     * Create a Calendar object. 
     * @param calName The calendar name used on Keep APIs.
     * @param calObject The ACL object for the calendar.
     */
    constructor(calName: string, calObject: any) {
        this.props.name = calName;
        this.props.displayName = (calName === KeepPimConstants.DEFAULT_CALENDAR_NAME) ? "Calendar" : calName; // TODO: Translate "Calendar"
        this.props.acl = calObject;

    }

    /**
     * Get a human readable name for the calendar that is suitable for displaying in a UI. 
     * @returns The human readable name. 
     */
    get displayName(): string {
        return this.props.displayName;
    }

    set displayName(name: string) {
        this.props.displayName = name;
    }

    /**
     * Returns the name of the calendar used on the Keep API. 
     */
    get calendarName(): string {
        return this.props.name;
    }

    /**
     * Set the name of the calendar used on the Keep API.
     */
    set calendarName(calendarName: string) {
        this.props.name = calendarName;
    }

    /**
     * An object containing the access control list for the calendar.  
     * @returns The access control list. The key is the user name and the value is the access level (MANAGER or AUTHOR). 
     */
    get acl(): object {
        return this.props.acl;
    }

    /**
     * Set the access list object for the calendar.
     * 
     * The object keys are domino names of the user and the value is either "MANAGER" or "AUTHOR".
     */
    set acl(acl: object) {
        this.props.acl = acl;
    }

    /**
     * Returns the list of managers for the calendar.
     * @returns An array of domino names that are assigned manager role. 
     */
    get managers(): string[] {
        const managers: string[] = [];
        for (const user in this.props.acl) {
            if (this.props.acl[user] === "MANAGER") {
                managers.push(user);
            }
        }
        return managers;
    }

    /**
     * Set the managers in the ACL. This will replace all exsiting managers.
     */
    set managers(managers: string[]) {

        for (const user in this.props.acl) {
            if (this.props.acl[user] === 'MANAGER') {
                delete this.props.acl[user];
            }
        }

        managers.forEach(user => {
            this.props.acl[user] = 'MANAGER';
        });

    }

    /**
     * Returns the list of authors for the calendar.
     * @returns An array of domino names that are assigned author role. 
     */
    get authors(): string[] {
        const authors: string[] = [];
        for (const user in this.props.acl) {
            if (this.props.acl[user] === "AUTHOR") {
                authors.push(user);
            }
        }
        return authors;
    }

    /**
     * Set the authors in the ACL. This will replace all exsiting authors.
     */
    set authors(authors: string[]) {

        for (const user in this.props.acl) {
            if (this.props.acl[user] === 'AUTHOR') {
                delete this.props.acl[user];
            }
        }

        authors.forEach(user => {
            this.props.acl[user] = 'AUTHOR';
        });

    }
}
