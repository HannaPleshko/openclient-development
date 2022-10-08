import { UserManager, UserInfo } from '../core';
import { KeepPim } from '../../services';
import { KeepTransportManager } from '../KeepTransportManager';
import { Logger } from '../../utils';
import * as util from 'util';
import { PimItemFactory } from './PimItemFactory';
import { PimItem } from './PimItemInterfaces';
import { KeepPimConstants, PimItemFormat } from './KeepPimConstants';
import { PimLabelClassic } from './PimLabelClassic';
import { PimSearchQuery } from './PimSearchQuery';
import { PimItemClassic } from './PimItemClassic';
import { KeepPimLabelManager } from '.';
import { PimDelegation, PimUpdateDelegation } from './PimDelegation';

/**
 * Interface to general Keep functions.
 */
export class KeepPimManager {
    private static instance: KeepPimManager;

    public static getInstance(): KeepPimManager {
        if (!KeepPimManager.instance) {
            this.instance = new KeepPimManager();
        }
        return this.instance;
    }

    /**
     * Retrieve a Pim item from keep. 
     * @param unid The unid of the item to retrieve.
     * @param userInfo The current user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns a PimItem or undefined if the item does not exist or an error occurred. 
     */
    async getPimItem(unid: string, userInfo: UserInfo, mailboxId?: string): Promise<PimItem | undefined> {

        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            const itemObject: any = await keepPimProvider.getPimItem(uToken, unid, mailboxId);

            return this.createPimItemFromObject(itemObject);

        } catch (err) {
            Logger.getInstance().error(`getPimItem error: ${err}`);
            throw err;
        }
    }

    /**
     * Update a PIM item. 
     * @param unid The unid of the item to update.
     * @param userInfo The user authentication information.
     * @param pimItem The item to update.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns The result object of the Keep API call. 
     * @throws An error if the update fails.
     */
    async updatePimItem(unid: string, userInfo: UserInfo, pimItem: PimItem, mailboxId?: string): Promise<any> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            if (pimItem.isPimLabel()) {
                KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);
            }
            return await keepPimProvider.updatePimItem(uToken, pimItem.unid, pimItem.toPimStructure(), mailboxId);
        } catch (err) {
            Logger.getInstance().error(`updatePimItem error: ${err}`);
            throw err;
        }
    }

    /** 
    * Retrieve delegation information
    * @param userInfo The user authentication information.
    * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
    * Value can be replica id, filepath, owner shortname, or owner email.
    * @returns List of users the authenticated user has delegated to and the permissions for each user. 
    * @throws An error if getting the delegation information fails.
    */
    async getDelegation(userInfo: UserInfo, mailboxId?: string): Promise<PimDelegation[]> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);

            if (!uToken) {
                throw new Error('User is unauthenticated');
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            return await keepPimProvider.getDelegation(uToken, mailboxId);
        } catch (err) {
            Logger.getInstance().error(`getDelegation error: ${err}`);
            throw err;
        }
    }

    /** 
    * Update delegation information
    * @param userInfo The user authentication information.
    * @param delegationStructure The delegation object with name and permissions
    * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
    * Value can be replica id, filepath, owner shortname, or owner email.
    * @returns The result object of the Keep API call with Save complete message.
    * @throws An error if creating the delegation information fails.
    */
    async createDelegation(userInfo: UserInfo, delegationStructure: PimDelegation, mailboxId?: string): Promise<any> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);

            if (!uToken) {
                throw new Error('User is unauthenticated');
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            return await keepPimProvider.createReplaceDelegation(uToken, delegationStructure, mailboxId);
        } catch (err) {
            Logger.getInstance().error(`createDelegation error: ${err}`);
            throw err;
        }
    }

    /** 
    * Update one delegation information
    * @param userInfo The user authentication information.
    * @param updateDelegationStructure List of delegates to add or to update or list of user to remove from delegation
    * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
    * Value can be replica id, filepath, owner shortname, or owner email.
    * @returns The result object of the Keep API call withUpdate complete message 
    * @throws An error if updating the delegation information fails.
    */
    async updateDelegation(
        userInfo: UserInfo, 
        updateDelegationStructure: PimUpdateDelegation, 
        mailboxId?: string
    ): Promise<any> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);

            if (!uToken) {
                throw new Error('User is unauthenticated');
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            return await keepPimProvider.updateDelegation(uToken, updateDelegationStructure, mailboxId);
        } catch (err) {
            Logger.getInstance().error(`updateDelegation error: ${err}`);
            throw err;
        }
    }

    /**
    * Delete one delegation information
    * @param userInfo The user authentication information.
    * @param delegate Id of the delegate to delete
    * @param mailboxId ptional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
    * Value can be replica id, filepath, owner shortname, or owner email.
    * @returns The result object of the Keep API call with Deletion complete message. 
    * @throws An error if deleting the delegation information fails.
    */
    async deleteDelegation( userInfo: UserInfo, delegate: string, mailboxId?: string): Promise<any> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);

            if (!uToken) {
                throw new Error('User is unauthenticated');
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            return await keepPimProvider.deleteDelegation(uToken, delegate, mailboxId);
        } catch (err) {
            Logger.getInstance().error(`deleteDelegation error: ${err}`);
            throw err;
        }
    }

    /**
     * Create a PimItem object from a PIM object returned from Keep. 
     * @param itemObject A PIM object returned from Keep
     * @param viewname Optional view name of the label containing the object.
     * @param format The format of the object. The default is DOCUMENT.
     * @returns The Pim item object.
     * @throws An error if the object could not be converted to a Pim item.
     */
    createPimItemFromObject(itemObject: any, viewname?: string, format = PimItemFormat.DOCUMENT): PimItem {
        let rtn: PimItem;
        const form: string = itemObject["Form"];
        const type: string = itemObject["@type"] ?? itemObject["type"];
        if (type === 'jsevent') {
            // FIXME: Workaround for LABS-1420 where not all calendar items have a calid set. We will assume all are for the default calendar for now.
            if (itemObject["calid"] === undefined) {
                Logger.getInstance().warn(`Calid is not set for calendar item ${itemObject["@unid"]}. Assuming it is default.`);
                itemObject["calid"] = KeepPimConstants.DEFAULT_CALENDAR_NAME;
            }

            const calid = itemObject["calid"];
            if (calid) {
                rtn = PimItemFactory.newPimCalendarItem(itemObject, calid, format);
            }
            else {
                throw new Error("Calid is not set for calendar item " + itemObject["@unid"]);
            }
        }
        else if (form === "Task" || type === "jstask") {
            rtn = PimItemFactory.newPimTask(itemObject, format);

        }
        else if (form === "Person") {
            rtn = PimItemFactory.newPimContact(itemObject, format);
            if (rtn.unid === undefined) {
                throw new Error("No unid for contact item: " + util.inspect(itemObject, false, 5));
            }
        }
        else if (form === "JournalEntry") {
            rtn = PimItemFactory.newPimNote(itemObject, format);
            if (rtn.unid === undefined) {
                throw new Error("No unid for note item: " + util.inspect(itemObject, false, 5));
            }
        }
        else if (itemObject["$ViewGlobalScript"] !== undefined) { // FIXME: This is a work around since the pimitem api does not return the correct label structure
            const labelObject: any = { "FolderId": itemObject["@unid"], "@noteid": itemObject["@noteid"], "View": itemObject["$Name"], "DisplayName": itemObject["$TITLE"] };
            rtn = new PimLabelClassic(labelObject);

        }
        else {
            // Assume it's a message
            rtn = PimItemFactory.newPimMessage(itemObject, format, viewname);
        }

        if (rtn.unid === undefined) {
            throw new Error("No unid for pim item: " + util.inspect(itemObject, false, 5));
        }

        return rtn;
    }

    /**
     * Search through Keep. 
     * @param userInfo: Authentication information
     * @param searchQuery: Instance of SearchQuery object defining the search phrase and limits
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     */
    async search(userInfo: UserInfo, searchQuery: PimSearchQuery, skip?: number, count?: number, mailboxId?: string): Promise<PimItemClassic[]> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const results: PimItemClassic[] = [];
            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            let searchResults: any[] = await keepPimProvider.search(uToken, searchQuery, skip, count, mailboxId);
            // The results of the Keep /search API will be in this format:
            // [ { "count": nn, "result": [ {}, {}, ... ] } ]
            if (searchResults) {
                if (!Array.isArray(searchResults)) {
                    searchResults = [searchResults];
                }

                for (const sResult of searchResults) {
                    const resultArray: any[] = sResult.result;
                    for (const itemObject of resultArray) {
                        const pItem = this.createPimItemFromObject(itemObject);
                        if (pItem && pItem instanceof PimItemClassic) {
                            results.push(pItem);
                        } else {
                            Logger.getInstance().debug(`Keep returned a search result that could not be converted to a PimItem ${util.inspect(pItem, false, 5)}`)
                        }
                    }
                }
            }
            return results;
        } catch (err) {
            Logger.getInstance().error(`search error: ${err}`);
            throw err;
        }
    }

    /**
     * Get the avatar for the user.
     * @param userInfo The information used to authenticate the user.
     * @param email The email address of the user to retrieve the avatar for.
     * @param height The height of the avatar to retrieve.
     * @param width The width of the avatar to retrieve.
     * @retuns The generated identicon image in png format. 
     * @throws An error if getting the avatar fails. 
     */
     async getAvatar(userInfo: UserInfo, email: string, height?: number, width?: number): Promise<any> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            
            return await keepPimProvider.getAvatar(uToken, email, height, width);
        } catch (err) {
            Logger.getInstance().error(`getAvatar error getting the avatar for the email address ${email}:\n${err}`);
            throw err;
        }
    }
}