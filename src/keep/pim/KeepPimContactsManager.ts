import { KeepPim } from "../../services/keep-pim.service";
import { KeepPimBaseResults, PimItemFormat } from './KeepPimConstants';
import util from 'util';
import { Logger } from '../../utils';
import { KeepTransportManager } from '../KeepTransportManager';
import { KeepPimLabelManager } from './KeepPimLabelManager';
import { PimItemFactory } from "./PimItemFactory";
import { UserInfo, UserManager } from "../core/UserManager";
import { PimContact } from "./PimItemInterfaces";

/**
 * Interface to the Keep Contacts functions.
 */
export class KeepPimContactsManager {
    private static instance: KeepPimContactsManager;

    public static getInstance(): KeepPimContactsManager {
        if (!KeepPimContactsManager.instance) {
            this.instance = new KeepPimContactsManager();
        }
        return this.instance;
    }

    /**
     * Returns a list of contacts from Keep.
     * @param shape The shape of the contact items that are returned.
     * @param userInfo The information used to authenticate the user.
     * @param skip The number of items to skip.
     * @param count The number of items to fetch.
     * @param folderId The folderId of the folder we are enumerating.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns A list of contact items.
     */
    async getContacts(userInfo: UserInfo, documents = true, skip?: number, count?: number, folderId?: string, mailboxid?: string): Promise<PimContact[]> {
        const contacts: PimContact[] = [];

        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            let contactObjects: any[] = [];
            if (folderId) {
                // When enumerating the contacts of a folder, we must use the messages API for retrieving items
                // associated with a label.
                contactObjects = await keepPimProvider.getMessages(uToken, folderId, documents, skip, count, mailboxid);
            } else {
                // If no folderId is passed in, fetch all contacts.
                contactObjects = await keepPimProvider.getContactEntries(uToken, documents, skip, count, mailboxid);
            }

            if (contactObjects && !(contactObjects instanceof Array)) {
                Logger.getInstance().error(`Response from getContactEntries is not an array`);
                contactObjects = [contactObjects];
            }

            /**
             Each pimContacts entry looks like this:
             {
                "@unid": "FDEB4E4FF7EDCF988525858F006B10F1",
                "@noteid": 2378,
                "@index": "1.1.1",
                "$126": "User , Test",
                "$19": "[Office phone:999-111-1111, Office fax:999-555-1111, Cell phone:999-222-1111, Home phone:999-444-1111, Pager:999-333-1111]",
                "$20": "[Test User company name, Test User Job Title]",
                "$21": "[Test, contact55]",
                "$22": "Person"
             }
             */
            for (const pimObject of contactObjects) {
                // Convert Pim data to EWS
                try {
                    const unid = pimObject["@unid"] ?? pimObject["unid"];
                    if (!unid) {
                        Logger.getInstance().error(`PIM contact does not contain unid: ${pimObject}`);
                        continue;
                    }
                    
                    // FIXME: Workaround for LABS-1913 (duplicate contacts)
                    if (contacts.findIndex(pimContact => pimContact.unid === unid) === -1) {
                        contacts.push(PimItemFactory.newPimContact(pimObject, documents? PimItemFormat.DOCUMENT : PimItemFormat.PRIMITIVE));
                    }
                } catch (err) {
                    Logger.getInstance().error(`getContacts error converting PIM contact: ${err}\nTask object: ${util.inspect(pimObject, false, 5)}`);
                    throw err;
                }
            }
            return contacts;
        } catch (err) {
            Logger.getInstance().error(`getContacts error: ${err}`);
            throw err;
        }
    }

     /**
     * Returns a list of contacts from Keep.
     * @param userInfo The information used to authenticate the user.
     * @param skip How many of the result entries shall be skipped. Used for pagination. Default is 0
     * @param count How many results shall be returned, Default = 50
     * @param mailboxid Optional, when omitted the default mailbox of the authenticated user is addressed. Only used in delegation access when owner and user are different. Could be: replicaid, filepath or owner shortname or email
     * @param fulltext Should the query search Names beginning with (fulltext missing or false) or Names containing the seatch string
     * @param directoryid Name of the directory that contains the entry. If omitted main addressbook is used
     * @param all When set to true, an extensive search across all addressbooks will be launched. Results get potentially cached
     * @returns A list of contact items.
     */
     
      async lookupContacts(userInfo: UserInfo, q: string, fulltext?: boolean, directoryid?: string, all?: boolean, skip?: number, count?: number, mailboxid?: string): Promise<PimContact[]> {
        const contacts: PimContact[] = [];

        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            let contactObjects: any[] = await keepPimProvider.lookupContactEntries(uToken, q, fulltext, directoryid, all, skip, count, mailboxid);
            if (contactObjects && !(contactObjects instanceof Array)) {
                Logger.getInstance().debug(`Response from lookupContactEntries is not an array`);
                contactObjects = [contactObjects];
            }

            for (const pimObject of contactObjects) {
                // Convert Pim data to EWS
                try {
                    const unid = pimObject["@unid"] ?? pimObject["unid"];
                    if (!unid) {
                        Logger.getInstance().error(`PIM contact does not contain unid: ${pimObject}`);
                        continue;
                    }
                    
                    contacts.push(PimItemFactory.newPimContact(pimObject, PimItemFormat.DOCUMENT));
                    
                } catch (err) {
                    Logger.getInstance().debug(`lookupContacts error converting PIM contact: ${err}\nTask object: ${util.inspect(pimObject, false, 5)}`);
                    throw err;
                }
            }
            return contacts;
        } catch (err) {
            Logger.getInstance().debug(`lookupContacts error: ${err}`);
            throw err;
        }
    }

    /**
     * Returns a single contact from Keep.
     * @param unid The id of the contact item to return.
     * @param shape The shape of the contact item that is returned.
     * @param userInfo The information used to authenticate the user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns A contact item of undefined if the contact could not be found. 
     */
    async getContact(unid: string, userInfo: UserInfo, mailboxId?: string): Promise<PimContact | undefined> {
        let contact: PimContact | undefined = undefined;
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            const pimObject: any = await keepPimProvider.getContactEntry(uToken, unid, mailboxId);

            if (pimObject) {
                if (pimObject["@unid"] === undefined && pimObject["unid"] === undefined) {
                    Logger.getInstance().error(`PIM contact does not contain unid: ${util.inspect(pimObject, false, 5)}`);
                }
                else {
                    contact = PimItemFactory.newPimContact(pimObject, PimItemFormat.DOCUMENT)
                }
            }
            return contact;
        } catch (err) {
            Logger.getInstance().debug(`getContact error for ${unid}: ${err}`);
            throw err;
        }
    }

    /**
     * Create a new contact
     * @param contact The contact to create.
     * @param userInfo The information used to authenticate the user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns The unid of the newly created contact. 
     * @throws An error if the create failed. 
     */
    async createContact(contact: PimContact, userInfo: UserInfo, mailboxId?: string): Promise<string> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            // Invalidate label cache before creating the contact.
            KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);
            
            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            const response: any = await keepPimProvider.createContactEntry(uToken, contact.toPimStructure(), mailboxId)
            const unid: string = response.unid;
            if (unid === undefined) {
                Logger.getInstance().error(`Create PIM contact does not contain unid: ${util.inspect(response, false, 5)}`);
                throw new Error("New contact does not contain a unid");
            }
            return unid;

        } catch (err) {
            Logger.getInstance().error(`createContact error creating item: ${util.inspect(contact, false, 5)}\n${err}`);
            throw err;
        }
    }

    /**
     * Update a contact.
     * @param contact The updated contact.
     * @param userInfo The information used to authenticate the user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns An updated contact.
     * @throws An error if the update fails.  
     */
    async updateContact(contact: PimContact, userInfo: UserInfo, mailboxId?: string): Promise<KeepPimBaseResults> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            const response: any = await keepPimProvider.updateContactEntry(uToken, contact.unid, contact.toPimStructure(), mailboxId)
            if (response["@unid"] === undefined && response["unid"] === undefined) {
                Logger.getInstance().error(`Updated PIM contact does not contain unid: ${util.inspect(response, false, 5)}`);
                throw new Error("Updated contact does not contain a unid");
            }
            return response;
        } catch (err) {
            Logger.getInstance().error(`updateContact error updating contact: ${util.inspect(contact, false, 5)}\n${err}`);
            throw err;
        }
    }

    /**
     * Delete a contact. 
     * @param unid The unid of the contact to delete.
     * @param userInfo The information used to authenticate the user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @retuns An object containing the status. 
     * @throws An error if the delete fails. 
     */
    async deleteContact(unid: string, userInfo: UserInfo, hardDelete = false, mailboxId?: string): Promise<any> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            // Invalidate label cache before deleting the contact.
            KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);
            
            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            if (hardDelete) {
                return await keepPimProvider.deleteItemFromTrash(uToken, unid, mailboxId);
            } else {
                return await keepPimProvider.deleteContactEntry(uToken, unid, mailboxId);
            }
        } catch (err) {
            Logger.getInstance().error(`deleteContact error deleting contact with unid: ${unid}:\n${err}`);
            throw err;
        }
    }
}