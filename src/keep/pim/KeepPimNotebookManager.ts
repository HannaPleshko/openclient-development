import { PimNote } from '.';
import { UserManager, UserInfo } from '../core';
import { KeepPim } from '../../services';
import { PimItemFormat, KeepPimBaseResults } from './KeepPimConstants';
import util from 'util';
import { Logger } from '../../utils';
import { KeepTransportManager } from '../KeepTransportManager';
import { KeepPimLabelManager } from "./KeepPimLabelManager";
import { PimItemFactory } from './PimItemFactory';

/**
 * Interface to the Keep Notebook functions.
 */
export class KeepPimNotebookManager {
    private static instance: KeepPimNotebookManager;

    /**
     * Get a singleton instance of the Keep Notebook API manager. 
     */
    public static getInstance(): KeepPimNotebookManager {
        if (!KeepPimNotebookManager.instance) {
            this.instance = new KeepPimNotebookManager();
        }
        return this.instance;
    }

    /**
     * Returns a list of notes from Keep.
     * @param userInfo The information used to authenticate the user.
     * @param documents True to return the full note information or false to return partial information.
     * @param skip The number of messages to skip before the first one that is returned. Default is 0. 
     * @param count The number of messages to return. Default it all.
     * @param folderId The id of the notes folder containing the notes.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns A list of note items.
     */
    async getNotes(userInfo: UserInfo, documents = true, skip?: number, count?: number, folderId?: string, mailboxId?: string): Promise<PimNote[]> {

        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            let noteObjects: any[] = [];
            if (folderId) {
                // When enumerating the notes of a folder, we must use the messages API for retrieving items
                // associated with a label.
                noteObjects = await keepPimProvider.getMessages(uToken, folderId, documents, skip, count, mailboxId);
            } else {
                // If no folderId is passed in, fetch all notes.
                noteObjects = await keepPimProvider.getNotes(uToken, documents, skip, count, mailboxId);
            }

            if (noteObjects && !(noteObjects instanceof Array)) {
                Logger.getInstance().error(`Response from getNotes is not an array`);
                noteObjects = [noteObjects];
            }

            const notes: PimNote[] = [];
            for (const pimObject of noteObjects) {
                // Convert Pim data to EWS
                try {
                    const unid = pimObject["@unid"];
                    if (!unid) {
                        Logger.getInstance().error(`PIM note does not contain unid: ${util.inspect(pimObject, false, 5)}`);
                        continue;
                    }
                    
                    notes.push(PimItemFactory.newPimNote(pimObject, documents? PimItemFormat.DOCUMENT : PimItemFormat.PRIMITIVE));
                    
                } catch (err) {
                    Logger.getInstance().debug(`getNotes error converting PIM note: ${err}\nNote object: ${util.inspect(pimObject, false, 5)}`);
                }
            }

            return notes; 
        }
        catch (err) {
            Logger.getInstance().error(`Get Notes failed: ${err}`);
            throw err; 
        }

    }

    /**
     * Returns a single note from Keep.
     * @param userInfo The information used to authenticate the user.
     * @param unid The id of the note to return.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns A note item or undefined if the note could not be found. 
     */
    async getNote(userInfo: UserInfo, unid: string, mailboxId?: string): Promise<PimNote | undefined> {
        let note: PimNote | undefined = undefined;

        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            const pimObject: any = await keepPimProvider.getNote(uToken, unid, mailboxId);

            if (pimObject) {
                note = PimItemFactory.newPimNote(pimObject, PimItemFormat.DOCUMENT);
                if (note.unid === undefined) {
                    Logger.getInstance().error(`No unid for PIM note: ${util.inspect(pimObject, false, 5)}`);
                    throw new Error("No unid for PIM note");
                }
            }
            
            return note;

        } catch (err) {
            Logger.getInstance().debug(`getNote error for ${unid}: ${err}`);
            throw err;
        }
    }

    /**
     * Create a new note. 
     * @param item The note to create
     * @param userInfo The information used to authenticate the user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns The unid of the newly created note.
     * @throws An error if the create fails.
     */
    async createNote(item: PimNote, userInfo: UserInfo, mailboxId?: string): Promise<string> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            // Invalidate label cache before creating the note.
            KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            const response: any = await keepPimProvider.createNote(uToken, item.toPimStructure(), mailboxId);

            /*
             Response looks like this:
             {
                "statusText": "OK",
                "status": 200,
                "message": "creation complete",
                "unid": "367309CFDDCC18A4002585B4005C3132"
             }
             */
            const unid: string = response.unid;
            if (unid === undefined) {
                Logger.getInstance().error(`Create PIM note does not contain unid: ${util.inspect(response, false, 5)}`);
                throw new Error("New note does not contain a unid");
            }
            return unid;

        } catch (err) {
            Logger.getInstance().debug(`createNote error for ${util.inspect(item, false, 5)}: ${err}`);
            throw err; 
        }
    }

    /**
     * Update a note.
     * @param note The updated note.
     * @param userInfo The information used to authenticate the user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns An updated note.
     * @throws An error if the update fails.  
     */
    async updateNote(note: PimNote, userInfo: UserInfo, mailboxId?: string): Promise<KeepPimBaseResults> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            
            const response: any = await keepPimProvider.updateNote(uToken, note.unid, note.toPimStructure(), mailboxId);

            // Workaround for LABS-1461
            response["@unid"] = note.unid;

            if (response["@unid"] === undefined) {
                Logger.getInstance().error(`Updated PIM note does not contain unid: ${util.inspect(response, false, 5)}`);
                throw new Error("Updated note does not contain a unid");
            }

            return response; 

        } catch (err) {
            Logger.getInstance().error(`updateNote error updating note: ${util.inspect(note, false, 5)}\n${err}`);
            throw err; 
        }
    }

     /**
      * Delete a note. 
      * @param unid The unid of the note to delete.
      * @param userInfo The information used to authenticate the user.
      * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
      * Value can be replica id, filepath, owner shortname, or owner email. 
      * @retuns An object containing the status. 
      * @throws An error if the delete fails. 
      */
     async deleteNote(unid: string, userInfo: UserInfo, hardDelete = false, mailboxId?: string): Promise<any> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            // Invalidate label cache before deleting the note.
            KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            
            if (hardDelete) {
                return await keepPimProvider.deleteItemFromTrash(uToken, unid, mailboxId);
            } else {
                return await keepPimProvider.deleteNote(uToken, unid, mailboxId);
            }
            
        } catch (err) {
            Logger.getInstance().error(`deleteNote error deleting note with unid: ${unid}:\n${err}`);
            throw err; 
        }
    }
}