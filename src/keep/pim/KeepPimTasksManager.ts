import { UserManager, UserInfo } from '../core';
import { KeepPim } from '../../services';
import { PimItemFormat, KeepPimBaseResults } from './KeepPimConstants';
import util from 'util';
import { yesterday, Logger } from '../../utils';
import { KeepTransportManager } from '../KeepTransportManager';
import { KeepPimLabelManager } from './KeepPimLabelManager';
import { PimItemFactory } from './PimItemFactory';
import { PimTask } from './jmap/PimTask';

/**
 * Interface to the Keep Task functions.
 */
export class KeepPimTasksManager {
    private static instance: KeepPimTasksManager;

    public static getInstance(): KeepPimTasksManager {
        if (!KeepPimTasksManager.instance) {
            this.instance = new KeepPimTasksManager();
        }
        return this.instance;
    }

    /**
     * Returns a list of tasks from Keep.
     * @param shape The shape of the task items that are returned.
     * @param userInfo The information used to authenticate the user.
     * @param skip The number of entries to skip (for paging).
     * @param count The number of tasks to request.
     * @param folderId The unid of the containing folder for the request.
     * @returns A list of task items.	     * @returns A list of task items.
     */
    async getTasks(userInfo: UserInfo, documents = true, skip?: number, count?: number, folderId?: string, mailboxid?: string): Promise<PimTask[]> {
        const tasks: PimTask[] = [];

        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            let taskObjects: any[] = [];
            if (folderId) {
                // When enumerating the tasks of a folder, we must use the messages API for retrieving items
                // associated with a label.
                taskObjects = await keepPimProvider.getMessages(uToken, folderId, documents, skip, count, mailboxid);
                if (taskObjects) {
                    taskObjects = taskObjects.map(to => {
                        const res: any = {};
                        res.uid = to['@unid'] ?? to['uid'];
                        return res;
                    })
                }
            } else {
                // If no folderId is passed in, fetch all tasks.
                taskObjects = await keepPimProvider.getTasks(uToken, documents, skip, count, mailboxid);
            }

            if (taskObjects && !(taskObjects instanceof Array)) {
                Logger.getInstance().error(`Response from getTasks is not an array`);
                taskObjects = [taskObjects];
            }

            for (const pimObject of taskObjects) {
                // Convert Pim data to EWS
                try {
                    const unid = pimObject["@unid"] ?? pimObject["uid"];
                    if (!unid) {
                        Logger.getInstance().error(`PIM task does not contain unid: ${util.inspect(pimObject, false, 5)}`);
                        continue;
                    }

                    // Avoid another API call, convert only need unid
                    const task = PimItemFactory.newPimTask(pimObject, documents ? PimItemFormat.DOCUMENT : PimItemFormat.PRIMITIVE);
                    tasks.push(task);
                } catch (err) {
                    Logger.getInstance().error(`getTasks error converting PIM task: ${err}\nTask object: ${util.inspect(pimObject, false, 5)}`);
                }
            }
            return tasks;
        } catch (err) {
            Logger.getInstance().error(`getTasks error: ${err}`);
            throw err;
        }
    }

    /**
     * Returns a single task from Keep.
     * @param unid The id of the task to return.
     * @param shape The shape of the task item that is returned.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @param userInfo The information used to authenticate the user.
     * @returns A task item of undefined if the task could not be found. 
     */
    async getTask(unid: string, userInfo: UserInfo, mailboxId?: string): Promise<PimTask | undefined> {
        let task: PimTask | undefined = undefined;

        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            const pimObject: any = await keepPimProvider.getTask(uToken, unid, mailboxId);

            if (pimObject) {
                task = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
                if (task.unid === undefined) {
                    Logger.getInstance().error(`No unid for PIM task: ${util.inspect(pimObject, false, 5)}`);
                    throw new Error("No unid for PIM task");
                }
            }
            return task;
        } catch (err) {
            Logger.getInstance().error(`getTask error for ${unid}: ${err}`);
            throw err;
        }
    }

    /**
     * Create a new task. 
     * @param item The task to create
     * @param userInfo The information used to authenticate the user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns The unid of the newly created task.
     * @throws An error if the create fails.
     */
    async createTask(item: PimTask, userInfo: UserInfo, mailboxId?: string): Promise<string> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            // Invalidate label cache before creating the task.
            KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            // The create date must be in the object or it will not show up in the client
            if (item.createdDate === undefined) {
                Logger.getInstance().warn(`The created date is not set for task item: ${util.inspect(item, false, 5)}`);
                item.createdDate = yesterday();
            }
            const response: any = await keepPimProvider.createTaskEntry(uToken, item.toPimStructure(), mailboxId);

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
                Logger.getInstance().error(`Create PIM task does not contain unid: ${util.inspect(response, false, 5)}`);
                throw new Error("New task does not contain a unid");
            }
            return unid;

        } catch (err) {
            Logger.getInstance().error(`createTask error for ${util.inspect(item, false, 5)}: ${err}`);
            throw err;
        }
    }

    /**
     * Update a task.
     * @param task The updated task.
     * @param userInfo The information used to authenticate the user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns An updated task.
     * @throws An error if the update fails.  
     */
    async updateTask(task: PimTask, userInfo: UserInfo, mailboxId?: string): Promise<KeepPimBaseResults> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            const response: any = await keepPimProvider.updateTaskEntry(uToken, task.unid, task.toPimStructure(), mailboxId);

            // Workaround for LABS-1461
            response["@unid"] = task.unid;

            if (response["@unid"] === undefined) {
                Logger.getInstance().error(`Updated PIM task does not contain unid: ${util.inspect(response, false, 5)}`);
                throw new Error("Updated task does not contain a unid");
            }

            return response;

        } catch (err) {
            Logger.getInstance().error(`updateTask error updating task: ${util.inspect(task, false, 5)}\n${err}`);
            throw err;
        }
    }

    /**
     * Delete a task. 
     * @param unid The unid of the task to delete.
     * @param userInfo The information used to authenticate the user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @retuns An object containing the status. 
     * @throws An error if the delete fails. 
     */
    async deleteTask(unid: string, userInfo: UserInfo, hardDelete = false, mailboxId?: string): Promise<any> {
        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            // Invalidate label cache before deleting the task.
            KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

            if (hardDelete) {
                return await keepPimProvider.deleteItemFromTrash(uToken, unid, mailboxId);
            } else {
                return await keepPimProvider.deleteTaskEntry(uToken, unid, mailboxId);
            }

        } catch (err) {
            Logger.getInstance().error(`deleteTask error deleting task with unid: ${unid}:\n${err}`);
            throw err;
        }
    }

}