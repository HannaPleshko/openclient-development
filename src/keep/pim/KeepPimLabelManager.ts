import { KeepPim, DocumentDeletion } from '../../services/keep-pim.service';
import { UserManager, UserInfo } from '../core';
import { Logger } from '../../utils';
import { KeepTransportManager } from '../KeepTransportManager';
import { PimLabelTypes, PimLabelDesignTypes, KeepPimBaseResults, PimItemFormat, KeepPimConstants } from './KeepPimConstants';
import memoryCache, { CacheClass } from 'memory-cache';
import { PimLabel } from './PimItemInterfaces';
import { PimItemFactory } from './PimItemFactory';

/**
 * Interface for object return when deletingp a label.
 */
export interface KeepDeleteLabelResults extends KeepPimBaseResults {
  deletedDocuments?: number; // The number of documents deleted as a result of deleting the label. 
}

/**
 * Interface for object returned when moving a label.
 */
export interface KeepMoveLabelResults {
  "Move Status": string; // Status message. Informational only. 
  movedFolderIds: KeepPimBaseResults[]; // The results of move for each label
}

/**
 * Interface to the Keep Label (e.g. folder) functions.
 */
export class KeepPimLabelManager {
  private static instance: KeepPimLabelManager;
  protected static labelCache: CacheClass<string, PimLabel[]>;

  /**
   * Returns a shared instance of the label manager.
   * @returns The shared instance of the label manager class.
   */
  public static getInstance(): KeepPimLabelManager {
    if (!KeepPimLabelManager.instance) {
      this.instance = new KeepPimLabelManager();
      this.labelCache = new memoryCache.Cache();
    }
    return this.instance;
  }

  /**
   * Called when the Pim datasource is stopped to clear the label cache. 
   */
  public static shutdown(): void {
    if (this.labelCache) {
      this.labelCache.clear();
    }
  }

  /**
   * Get the list of labels.
   * @param userInfo The Domino username and password
   * @param includeUnread True to include the unread count in the returned labels. Including the unread count cause extra processing on the Keep side, so only use it when needed.
   * @param ignore An object that contains a property called 'views' that is a list of views to ignore and not include in the returned labels or a property called 'types' that is a 
   * list of PimLabelTypes to ignore and not include in the returned labels. The default is to igonre the ALL view. 
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns An array of label objects.
   * @throws An error if an error occurs retrieving the list of labels from Keep. 
   */
  async getLabels(userInfo: UserInfo, includeUnread = false, ignore: any = { views: [KeepPimConstants.ALL] }, mailboxId?: string): Promise<PimLabel[]> {
    if (!userInfo) {
      throw new Error("Unable to get user id to request labels to return.");
    }

    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }

    // Check the memory cache before making call to Keep
    const cacheKey = this.labelCacheKey(userInfo.userId, includeUnread);
    const cachedLabels = KeepPimLabelManager.labelCache.get(cacheKey);
    if (cachedLabels) {
      Logger.getInstance().debug(`Returning labels for ${cacheKey} from cache`);
      return this.filterLabels(cachedLabels, ignore);
    }

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
    const labelObjects = await keepPimProvider.getLabels(uToken, includeUnread, mailboxId);

    const labels = labelObjects.map(obj => PimItemFactory.newPimLabel(obj, PimItemFormat.DOCUMENT));

    // Add label to cache
    KeepPimLabelManager.labelCache.put(cacheKey, labels, 3000, function (key, value) {
      Logger.getInstance().debug(`Removing labels for ${key} from cache due to timeout.`);
    });

    return this.filterLabels(labels, ignore);
  }

  async getLabel(userInfo: UserInfo, labelid: string, includeUnreadCount = false, mailboxId?: string): Promise<PimLabel> {
    if (!userInfo) {
      throw new Error("Unable to get user id to request labels to return.");
    }

    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }

    // Check the memory cache before making call to Keep
    const cacheKey = this.labelCacheKey(userInfo.userId, includeUnreadCount);
    const cachedLabels = KeepPimLabelManager.labelCache.get(cacheKey);
    if (cachedLabels) {
      const found = cachedLabels.find(label => label.folderId === labelid);
      if (found) {
        Logger.getInstance().debug(`Using label from cache ${cacheKey} for getLabel ${labelid}`);
        return found;
      }
    }

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
    return PimItemFactory.newPimLabel(await keepPimProvider.getLabel(uToken, labelid, includeUnreadCount, mailboxId), PimItemFormat.DOCUMENT);
  }

  /**
   * Delete a label
   * @param userInfo The Domino username and password
   * @param labelId The unid of the label
   * @param documentDeletion Indicates how to process documents associated with the label.
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns The results of the delete.
   * @throws An error if the delete failed. 
   */
  async deleteLabel(userInfo: UserInfo, labelId: string, documentDeletion = DocumentDeletion.ALL, mailboxId?: string): Promise<KeepDeleteLabelResults> {
    if (!userInfo) {
      throw new Error("Unable to get user id to request to delete a label.");
    }

    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }

    // Remove cached labels since there is an update
    this.invalidateCacheForUser(userInfo);

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
    return keepPimProvider.deleteLabel(uToken, labelId, documentDeletion, mailboxId);
  }

  /**
   * Create a new label
   * @param userInfo The Domino username and password
   * @param pimLabel The label to create
   * @param parentLabelType If this a sub-label, the parent labels type. The default is MAIL.
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns The new label created in Keep
   * @throws An error if the create failed. 
   */
  async createLabel(userInfo: UserInfo, pimLabel: PimLabel, parentLabelType?: PimLabelTypes, mailboxId?: string): Promise<PimLabel> {
    if (!userInfo) {
      throw new Error("Unable to get user id for label create");
    }

    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }

    // Remove cached labels since there is an update
    this.invalidateCacheForUser(userInfo);

    // Default parent label type to Mail
    if (parentLabelType === undefined) {
      parentLabelType = PimLabelTypes.MAIL;
    }

    const labelDesignType = designTypeForLabelType(parentLabelType);
    const createStructure: any = pimLabel.toPimStructure();

    if (labelDesignType !== undefined) {
      createStructure["DesignType"] = labelDesignType;
    }

    // For Contacts and Tasks, don't set a parentId as this will cause a separate label called Contacts (Tasks) to be created
    // FIXME:  This is a workaround for LABS-806.  The check for not Contacts or Tasks should be removed when that issue is fixed.    
    const parentId = pimLabel.parentFolderId;
    if (parentId !== undefined && (parentLabelType === PimLabelTypes.CONTACTS || parentLabelType === PimLabelTypes.TASKS)) {
      delete createStructure.ParentId;
    }

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
    const returnObj: any = await keepPimProvider.createLabel(uToken, createStructure, mailboxId);
    if (returnObj) {
      // Type is not returned on the create call, but needed throughout the code.
      returnObj.Type = parentLabelType;
    }

    return PimItemFactory.newPimLabel(returnObj, PimItemFormat.DOCUMENT);
  }

  /**
   * Move labels to a new parent.
   * @param userInfo The Domino username and password
   * @param labelId The unid of the new parent label.
   * @param moveLabelIds A list of unids for labels that will be moved.
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email.
   * @returns The results of the move. 
   * @throws An error if the move failed.
   */
  async moveLabel(userInfo: UserInfo, labelId: string, moveLabelIds: string[], mailboxId?: string): Promise<KeepMoveLabelResults> {
    if (!userInfo) {
      throw new Error("Unable to get user id for label move");
    }

    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }

    // Remove cached labels since there is an update
    this.invalidateCacheForUser(userInfo);

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();


    const targetLabel =  await this.getLabel(userInfo, labelId, false, mailboxId);
    if (targetLabel && targetLabel.view === KeepPimConstants.TRASH) {
      const res: any = {};
      res.movedFolderIds = new Array<KeepPimBaseResults>();
      let moveCount = 0;
      for (const lId of moveLabelIds) {
        const deleteRes = await this.deleteLabel(userInfo, lId, DocumentDeletion.ALL, mailboxId);
        res.movedFolderIds.push(deleteRes);
        if (deleteRes.unid) {
          moveCount++;
        }
      }
      res['Move Status'] = `${moveCount} items moved`;
      return res as KeepMoveLabelResults;
    } else {
      //Need formal structure to move a label.  According to the swagger api doc:
      // It will be based on the unid of the label. 
      // {
      //   "move": [
      //     "B7F20780A4F15C32482585C8003FAAB2"
      //   ]
      // }
      const moveStructure: any = {};
      moveStructure.move = moveLabelIds;

      return keepPimProvider.moveLabel(uToken, escape(labelId), moveStructure, mailboxId);
    }
  }

  /**
   * Update a label.
   * Currently this will only update the display name and additional fields in a label. 
   * @param userInfo The Domino username and password
   * @param label The label to update
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns An object with the results of the update. 
   */
  async updateLabel(userInfo: UserInfo, label: PimLabel, mailboxId?: string): Promise<KeepPimBaseResults> {
    if (!userInfo) {
      throw new Error("Unable to get user id to update the label");
    }

    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }

    // Remove cached labels since there is an update	    
    this.invalidateCacheForUser(userInfo);

    const updateStructure: any = { labelRenameTo: label.displayName }; // If display name has not changed, this will have no effect
    const structure: any = label.toPimStructure(); // Get Additional fields structure
    updateStructure[KeepPimConstants.ADDITIONAL_FIELDS] = structure[KeepPimConstants.ADDITIONAL_FIELDS];

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
    return keepPimProvider.updateLabel(uToken, escape(label.unid), updateStructure, mailboxId);
  }

  /**
   * Converts a JSON string representing an array of objects returned by GET /labels Keep API to an array of PimLabel objects.
   * @param jsonString JSON string representing an array of objects returned by GET /labels Keep API
   * @returns An array of PimLabel objects.
   */
  getPimLabelsFromJson(jsonString: string): PimLabel[] {
    const pimLabels: PimLabel[] = [];
    const jsonObj = JSON.parse(jsonString);
    if (Array.isArray(jsonObj)) {
      for (const obj of jsonObj) {
        pimLabels.push(PimItemFactory.newPimLabel(obj, PimItemFormat.DOCUMENT));
      }
    } else {
      pimLabels.push(PimItemFactory.newPimLabel(jsonObj, PimItemFormat.DOCUMENT));
    }

    return pimLabels;
  }

  /**
   * Returns a key for storing or retrieving labels from the cache.
   * @param userId The userid of the authenticate user.
   * @param includeUnread If the cached labels contain the unread count.
   * @returns The labels key
   */
  labelCacheKey(userId: string, includeUnread: boolean): string {
    return `${userId}-${includeUnread}`;
  }

  /**
   * Filter a list of labels
   * @param labels The list of labels to filter
   * @param ignore An object with information on the label to be filtered out.
   * @returns The list of filtered labels. 
   */
  filterLabels(labels: PimLabel[], ignore: any): PimLabel[] {

    return labels.filter(label => {
      if (ignore.views && ignore.views.includes(label.view)) {
        return false; // Skip this label
      }

      if (ignore.types && ignore.types.includes(label.type)) {
        return false; // Skip this lable
      }

      return true;
    });

  }

  /**
   * Invalidate the user's label cache.
   * @param cacheKey The key to the cache entries.
   */
  invalidateCache(cacheKey: string): void {
    Logger.getInstance().debug(`Removing labels for ${cacheKey} from cache.`);
    KeepPimLabelManager.labelCache.del(cacheKey);

  }

  /**
   * Invalidate the user's label cache.  Note that this function throws an error if the current user's
   * userId cannot be extracted from the userInfo.
   * @param userId The identifier acting as the cache key.
   */
  invalidateCacheForUser(userInfo: UserInfo): void {
    if (!userInfo.userId) {
      throw new Error("userId not provided for caching");
    }

    this.invalidateCache(this.labelCacheKey(userInfo.userId, true));
    this.invalidateCache(this.labelCacheKey(userInfo.userId, false));
  }

}

/**
* Given a label type, return the corresponding design type used for the Keep request to create a label.  Note
* that this does not apply to calendar labels as we use a different API to create a calendar.
* @param labelType The label type we are mapping to a design type.
* @returns A value to pass as the DesignType when creating a label of the passed in type.
*/
export function designTypeForLabelType(labelType: PimLabelTypes): string | undefined {

  let designType = undefined;

  switch (labelType) {
    case PimLabelTypes.CONTACTS: {
      designType = PimLabelDesignTypes.CONTACTS;
      break;
    }
    case PimLabelTypes.JOURNAL: {
      designType = PimLabelDesignTypes.JOURNAL;
      break;
    }
    case PimLabelTypes.TASKS: {
      designType = PimLabelDesignTypes.TASKS;
      break;
    }
    case PimLabelTypes.MAIL: {
      designType = PimLabelDesignTypes.MAIL;
    }
  }
  return designType;
}
