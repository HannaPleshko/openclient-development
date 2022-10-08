import { Logger } from '../../utils';
import util from 'util';
import { PimItemFormat } from './KeepPimConstants';
import { KeepTransportManager } from '../KeepTransportManager';
import { KeepPimLabelManager } from './KeepPimLabelManager';
import { PimItemFactory } from "./PimItemFactory";
import { UserInfo, UserManager } from "../core/UserManager";
import { PimCalendar } from "./PimCalendar";
import { PimCalendarItem } from "../../internal";
import { PimOOO } from "./PimOOO";
import { KeepPim } from "../../services/keep-pim.service";
import fastcopy from 'fast-copy';
import { PimParticipationInfo } from './PimParticipationInfo';

/**
 * Interface to the Keep Calendar functions.
 */
export class KeepPimCalendarManager {
    private static instance: KeepPimCalendarManager;

    public static getInstance(): KeepPimCalendarManager {
        if (!KeepPimCalendarManager.instance) {
            this.instance = new KeepPimCalendarManager();
        }
        return this.instance;
    }

    /**
     * Return the list of calendars. 
     * @param userInfo The information to authenticate the user
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns A list of calendar objects.
     * @throws An error if the retrieve fails. 
     */
    async getCalendars(userInfo: UserInfo, mailboxId?: string): Promise<PimCalendar[]> {
        const calendars: PimCalendar[] = [];

        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            const pimCals: any = await keepPimProvider.getCalendars(uToken, mailboxId);

            for (const name in pimCals) {
                calendars.push(new PimCalendar(name, pimCals[name]));
            }
            return calendars;
        } catch (err) {
            Logger.getInstance().debug(`getCalendars error: ${err}`);
            throw err;
        }
    }

    /**
     * 
     * @param calName The name of the calendar in Keep.
     * @param userInfo The information used to authenticate the user. 
     * @param startDate The start date for the beginning of the range of calendar items to return.
     * @param endDate The end date (inclusive) for the end of the range of calendar items to return. 
     * @param skip The number of items to skip before the first one that is returned. Default is 0. 
     * @param count The number of items to return. Default is 1000.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns A list of calendar items. 
     * @throws An error if the retrieve fails. 
     */
    async getCalendarItems(calName: string, userInfo: UserInfo, startDate?: string, endDate?: string, skip?: number, count?: number, mailboxId?: string): Promise<PimCalendarItem[]> {

        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            let pimItems: any[] = await keepPimProvider.getCalendarEntries(uToken, calName, startDate, endDate, skip, count, mailboxId);
            // FIX ME: Workaround for api that does not return an array when a single entry (https://jira.cwp.pnp-hcl.com/browse/LABS-1051)
            if (!(pimItems instanceof Array)) {
                pimItems = [pimItems];
            }

            const rtn: PimCalendarItem[] = [];

            for (const pimItem of pimItems) {
                const pItem: any = pimItem;

                // If the item is not a calendar event skip it.
                if (pItem["@type"] !== 'jsevent') {
                    continue; 
                }

                const unid = pItem["@unid"] ?? pItem["unid"] ?? pItem["uid"];
                if (!unid) {
                    Logger.getInstance().error("No unid for calendar item: " + util.inspect(pItem, false, 5));
                    continue;
                }
                
                const item = PimItemFactory.newPimCalendarItem(pimItem, calName, PimItemFormat.DOCUMENT);
                rtn.push(item);
            }
            return rtn;
        } catch (err) {
            Logger.getInstance().debug(`getCalendarItems error retrieving items for ${calName}: ${err}`);
            throw (err);
        }
    }

    /**
     * Retrieve a single calendar item.
     * @param itemId The unid of the calendar item to retrieve.
     * @param calName The name of the calendar in Keep where the item exists.
     * @param userInfo The information used to authenticate the user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns The Calednar item or undefined if not found. 
     * @throws An error if the retrieve fails. 
     */
    async getCalendarItem(itemId: string, calName: string, userInfo: UserInfo, mailboxId?: string): Promise<PimCalendarItem | undefined> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            
            const pimItem = await keepPimProvider.getCalendarEntry(uToken, calName, itemId, mailboxId);

            const calItem = PimItemFactory.newPimCalendarItem(pimItem, calName, PimItemFormat.DOCUMENT);
            if (!calItem.unid) {
                throw new Error("No unid for calendar item: " + util.inspect(pimItem, false, 5));
            }
            return calItem;
        } catch (err) {
            Logger.getInstance().debug(`getCalendarItem error retrieving item ${itemId} from server: ${err}`);
            throw (err);
        }
    }

    /**
     * Create a calendar item.
     * @param item A Keep PIM Calendar item to create.
     * @param userInfo The information used to authenticate the user.
     * @param sendInvitations Parameter to add to tell Keep to send invitations to any invitees for a meeting
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns The unid of the calendar item created.
     * @throws An error if the create fails.
     */
    async createCalendarItem(item: PimCalendarItem, userInfo: UserInfo, sendInvitations?: boolean, mailboxId?: string): Promise<string> {

        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            // Invalidate label cache before creating the calendar item.
            KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            
            const itemStruct: any =  fastcopy(item.toPimStructure());
            delete itemStruct.uid;

            const response: any = await keepPimProvider.createCalendarItem(uToken, item.calendarName, itemStruct, sendInvitations, mailboxId);
            const unid: string = response["@unid"] ?? response["unid"];
            if (unid === undefined) {
                throw new Error(`UNID not returned after creating calendar item: ${util.inspect(item, false, 5)}`);
            }
            return unid; 

        } catch (err) {
            Logger.getInstance().error(`createCalendarItem error creating item: ${util.inspect(item, false, 5)}\n${err}`);
            throw err; 
        }

    }

    /**
     * Update a calendar item.
     * @param item A Keep PIM Calendar item to update.
     * @param userInfo The information used to authenticate the user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns The updated calendar item.
     * @throws An error if the update fails.
     */
    async updateCalendarItem(item: PimCalendarItem, userInfo: UserInfo, mailboxId?: string): Promise<PimCalendarItem> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            
            const response: any = await keepPimProvider.updateCalendarItem(uToken, item.calendarName, item.unid, item.toPimStructure(), mailboxId);
            if (response["@unid"] === undefined && response["unid"] === undefined) {
                Logger.getInstance().error(`Updated PIM calendar does not contain unid: ${util.inspect(response, false, 5)}`);
                throw new Error("Updated calendar does not contain a unid");
            }
            return PimItemFactory.newPimCalendarItem(response, item.calendarName, PimItemFormat.DOCUMENT); 

        } catch (err) {
            Logger.getInstance().error(`updateCalendarItem error updating item: ${util.inspect(item, false, 5)}\n${err}`);
            throw err; 
        }

    }

    /**
     * Modify part of a calendar item.
     * @param updates The fields in the calendar item to update.
     * @param userInfo The information used to authenticate the user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns The updated calendar item.
     * @throws An error if the update fails.
     */
    async modifyCalendarItem(calid: string, calentryid: string, updates: any, userInfo: UserInfo, mailboxId?: string): Promise<any | undefined> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            return await keepPimProvider.modifyCalendarItem(uToken, calid, calentryid, updates, mailboxId);

        } catch (err) {
            Logger.getInstance().error(`modifyCalendarItem error updating item: ${util.inspect(updates, false, 5)}\n${err}`);
            throw err; 
        }

    }
    
    /**
     * Returns the out-of-office settings for a user. 
     * @param userid The userid who's settings should be returned.
     * @param userInfo The information used to authenticate the user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns The out of office settings.
     * @throws An error if unable to get out of office settings from Keep. 
     */
    async getOOO(userid: string, userInfo: UserInfo, mailboxId?: string): Promise<PimOOO | undefined> {
        let settings: PimOOO | undefined = undefined;

        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            const pimObject: any = await keepPimProvider.getOOO(uToken, userid, mailboxId);

            if (pimObject) {
                settings = new PimOOO(pimObject);
            }
            return settings;
        } catch (err) {
            Logger.getInstance().debug(`getOOO error for ${userid}: ${err}`);
            throw err; 
        }
    }

    /**
     * Updates the out-of-office settings for the current user. 
     * @param settings The OOO settings 
     * @param userInfo The information used to authenticate the user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns An PimOOO object with the updates applied. 
     * @throws An error if unable to update out of office settings in Keep. 
     */
    async updateOOO(settings: PimOOO, userInfo: UserInfo, mailboxId?: string): Promise<PimOOO> {

        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            const pimObject: any = await keepPimProvider.updateOOO(uToken, settings.toPimStructure(), mailboxId);
            
            return new PimOOO(pimObject);

        } catch (err) {
            Logger.getInstance().debug(`updateOOO error: ${err}`);
            throw err; 
        }
    }

    /**
     * Delete a calendar item. 
     * @param calName The name of the calendar that contains the item
     * @param itemId The unid of the item to delete
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @param userInfo The information used to authenticate the user.
     */
    async deleteCalendarItem(calName: string, itemId: string, userInfo: UserInfo, hardDelete = false, mailboxId?: string): Promise<any> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            // Invalidate label cache before deleting the calendar item.
            KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            if (hardDelete) {
                return await keepPimProvider.deleteItemFromTrash(uToken, itemId, mailboxId);
            } else {
                return await keepPimProvider.deleteCalendarItem(uToken, calName, itemId, mailboxId);            
            }
        } catch (err) {
            Logger.getInstance().error(`deleteCalendarItem error deleting item: ${itemId}:\n${err}`);
            throw err; 
        }
    }

    /**
     * Get a calendar item responses from the invitees. 
     * @param calName The name of the calendar that contains the item
     * @param itemId The unid of the item to delete
     * @param userInfo The information used to authenticate the user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     */
     async getCalendarResponses(calName: string, itemId: string, userInfo: UserInfo, mailboxId?: string): Promise<any> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            return await keepPimProvider.getCalendarResponse(uToken, calName, itemId, mailboxId);            
        } catch (err) {
            Logger.getInstance().error(`getCalendarResponses error retrieving responses for item: ${itemId} in calendar ${calName}:\n${err}`);
            throw err; 
        }
    }

    /**
     * Post a response to a calendar item invitation.
     * @param calName The name of the calendar that contains the item
     * @param itemId The unid of the item to delete
     * @param participationInfo status and supporting information for the status.
     * @param userInfo The information used to authenticate the user.
     * @param preventDelete Indicates the itemId item should not be deleted on the next deleteRequest to it.  Added due to EWS clients deleting domino calendar items converted from invitations
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
    */
     async createCalendarResponse(calName: string, itemId: string, participationInfo: PimParticipationInfo, userInfo: UserInfo, preventDelete = false, mailboxId?: string): Promise<any> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();            
            
            // Now we can create the response
            return await keepPimProvider.createCalendarResponse(uToken, calName, itemId, participationInfo, preventDelete, mailboxId);            
        } catch (err) {
            Logger.getInstance().error(`createCalendarResponse error creating the response for item: ${itemId} in calendar ${calName} with response ${util.inspect(participationInfo, false, 5)}:\n${err}`);
            throw err; 
        }
    }
}