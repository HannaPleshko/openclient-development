
import { KeepPim } from '../../services/keep-pim.service';
import { UserManager, UserInfo } from '../core';
import util from 'util';
import { Logger } from '../../utils';
import { KeepTransportManager } from '../KeepTransportManager';
import { KeepPimManager } from './KeepPimManager';
import { KeepPimLabelManager } from './KeepPimLabelManager';
import { PimItemFactory } from "./PimItemFactory";
import { KeepPimBaseResults, KeepPimConstants, PimItemFormat, PimReceiptType } from './KeepPimConstants';
import { PimItem, PimMessage, PimThread } from './PimItemInterfaces';
import { PimMessageClassic } from './PimMessageClassic';

/**
 * Interface for the response to moveMessages request.
 */
export interface KeepMoveMessagesResults {
  /** Description of status of the move request */
  "Move Status"?: string;
  /** The results of the move for each unid specified */
  movedIds?: KeepPimBaseResults[];
  /** Description of status of the add request */
  "Add Status"?: string;
  /** The results of the add for each unid specified */
  addedIds?: KeepPimBaseResults[];
  /** Description of status of the remove request */
  "Remove Status"?: string;
  /** The results of the remove for each unid specified */
  removedIds?: KeepPimBaseResults[];
  /** Description of status of the copy request */
  "Copy Status"?: string;
  /** The results of the copy for each unid specified */
  copiedIds?: KeepPimBaseResults[];
}

/**
 * Interface to the Keep messages functions.
 */
export class KeepPimMessageManager {
  private static instance: KeepPimMessageManager;
  private static readonly EXTRA_AMOUNT = 1;

  public static getInstance(): KeepPimMessageManager {
    if (!KeepPimMessageManager.instance) {
      this.instance = new KeepPimMessageManager();
    }
    return this.instance;
  }

  /**
   * Get the mail messages for a label. This will exclude calendar, contact, task, or notes beloging to the label. 
   * @param userInfo Authentication information for the current user.
   * @param labelId The view name or unid for a label.
   * @param documents True to return the full message information or false to return partial information.
   * @param skip The number of messages to skip before the first one that is returned. Default is 0. 
   * @param count The number of messages to return. Default it all.
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns A list of messages. 
   */
  async getMailMessages(userInfo: UserInfo, labelId?: string, documents = true, skip?: number, count?: number, mailboxId?: string): Promise<PimMessage[]> {
    return this.getMessages(userInfo, labelId, documents, skip, count, mailboxId, ['Appointment', 'Person', 'Task', 'TaskNotice', 'JournalEntry', 'Mailrule']);
  }

  /**
   * Get all messages for a label.
   * @param userInfo Authentication information for the current user.
   * @param labelId The view name or unid for a label.
   * @param documents True to return the full message information or false to return partial information.
   * @param skip The number of messages to skip before the first one that is returned. Default is 0. 
   * @param count The number of messages to return. Default it all.
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @param excludeFormTypes A list of form types to exclude. 
   * @returns A list of messages.
   */
  async getMessages(userInfo: UserInfo, labelId?: string, documents = true, skip?: number, count?: number, mailboxId?: string, excludeFormTypes: string[] = []): Promise<PimMessage[]> {

    const items = await this.getPimItems(userInfo, labelId, documents, skip, count, mailboxId, excludeFormTypes);
    let pMessages: PimMessage[] = [];

    if (items) {
      // TODO:  Must do something different here to check to see if the item implements the PimMessage interface instead.
      pMessages = items.filter(item => item instanceof PimMessageClassic) as PimMessageClassic[];
    }
    return Promise.resolve(pMessages);
  }

  /**
   * Get information about a message thread.
   * @param userInfo Authentication information for the current user.
   * @param threadId The thread id for the thread to return.
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns The thread information for the thread id.
   */
  async getThread(userInfo: UserInfo, threadId: string, mailboxId?: string): Promise<PimThread> {
    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
    const result = await keepPimProvider.getThread(uToken, threadId, mailboxId);
    const threadObj: any = {};
    if (Array.isArray(result)) {
      if (result.length > 0) {
        threadObj["@unid"] = result[0]["@unid"];
      }
      threadObj["threadEntries"] = result;
    }
    return PimItemFactory.newPimThread(threadObj, PimItemFormat.DOCUMENT);
  }

  /**
   * Make the call to keep to get all items or the items for a label. 
   * @param userInfo Authentication information for the current user.
   * @param labelId Specify the label view or unid to retrieve the items for a label. If not specified, all messages are retrieved.
   * @param documents True to return the full item information or false to return partial information.
   * @param skip The number of messages to skip before the first one that is returned. Default is 0. 
   * @param count The number of messages to return. Default it all.
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @param excludeFormTypes A list of form types to exclude. 
   * @returns A list of PIM items.
   * @throws An error if the retreive failed. 
   */
  async getPimItems(userInfo: UserInfo, labelId?: string, documents = true, skip?: number, count?: number, mailboxId?: string, excludeFormTypes?: string[]): Promise<PimItem[]> {
    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }
    let askCount: number | undefined;
    if (count !== undefined) {
      // Ask for at least 1 more than requested to see if there are any more to be returned.  As the amount requested progressively 
      // gets smaller when considering filtering with completing the requested limit, the number of requests needed to complete the 
      // count requested may become larger  (e.g. Asks for 20, we get 4 after filtering, need 16.  Ask for 16, we get 4 after filtering, need 12.
      // Ask for 12, we get 3 after filtering, need 9....and so on.  When we get to needing 1, if we asked for 1 and they get filtered out, 
      // we'll be making many requests.)  Therefore we ask for at least 20 to minimize the number of requests to complete the requested amount.
      askCount = Math.max(count + KeepPimMessageManager.EXTRA_AMOUNT, 20);
    }

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

    let requestedMessages: object[] | undefined;
    switch (labelId) {
      case KeepPimConstants.INBOX: {
        requestedMessages = await keepPimProvider.getInboxMessages(uToken, documents, skip, askCount, mailboxId);
        break;
      }
      case KeepPimConstants.DRAFTS: {
        requestedMessages = await keepPimProvider.getDraftMessages(uToken, documents, skip, askCount, mailboxId);
        break;
      }
      case KeepPimConstants.SENT: {
        requestedMessages = await keepPimProvider.getSentMessages(uToken, documents, skip, askCount, mailboxId);
        break;
      }
      case KeepPimConstants.JUNKMAIL: {
        requestedMessages = await keepPimProvider.getJunkMessages(uToken, documents, skip, askCount, mailboxId);
        break;
      }
      case KeepPimConstants.TRASH: {
        requestedMessages = await keepPimProvider.getTrashMessages(uToken, documents, skip, askCount, mailboxId);
        break;
      }
      default: {
        let encoded: string | undefined;
        if (labelId) {
          encoded = escape(labelId);
        }
        requestedMessages = await keepPimProvider.getMessages(uToken, encoded, documents, skip, askCount, mailboxId);
      }
    }

    if (requestedMessages) {
      // Before we exclude more we need to see if there are more to pull from...and we don't want to include the last item because it may exceed the limit requested
      const hasMore = count !== undefined && requestedMessages.length > count;
      // if hasMore, remove the last entry since that is beyond the limit requested
      if (hasMore) {
        requestedMessages = requestedMessages.slice(0, requestedMessages.length - KeepPimMessageManager.EXTRA_AMOUNT);
      }

      const filteredItems = this.convertToPimItems(requestedMessages, documents, labelId, excludeFormTypes, count);
      if (hasMore && count !== undefined && filteredItems.length < count) {
        // We have not reached the returned messages limit (count), so make a recursive call to this method to get more messages.
        const nextSkip = (skip ?? 0) + count;

        // Since there are more messages and we have not reached the return limit, call this method again to ask for more messages. 
        // The count for this call will subtract the number of messages we have already retrieved from the original requested count.
        const nextFilteredItems = await this.getPimItems(userInfo, labelId, documents, nextSkip, count - filteredItems.length, mailboxId, excludeFormTypes);

        // Append messages to the returned array until we have either satisfied the returned message limit (count) or we have appended all messages we got back 
        // from the getPimItems call above.
        for (let index = 0; index < count - filteredItems.length && index < nextFilteredItems.length; index++) {
          filteredItems.push(nextFilteredItems[index]);
        }
      }
      return filteredItems;
    }
    return [];
  }

  /**
   * Delete a messages.
   * @param userInfo Authentication information for the current user.
   * @param messageId The unid of the message to delete
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns The Keep results of deleting the message. 
   * @throws An error if the delete failed. 
   */
  async deleteMessage(userInfo: UserInfo, messageId: string, mailboxId?: string, hardDelete = false): Promise<any> {
    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }

    // Invalidate label cache before deleting the message.
    KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
    if (hardDelete) {
      return keepPimProvider.deleteItemFromTrash(uToken, messageId, mailboxId);
    } else {
      return keepPimProvider.deleteMessage(uToken, messageId, mailboxId);
    }
  }

  /**
   * Create a message.
   * @param userInfo Authentication information for the current user.
   * @param pimMessage The message to create.
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns The unid of the message that was created.
   * @throws An error if the create failed.
   */
  async createMessage(userInfo: UserInfo, pimMessage: PimMessage, sendMessage = false, mailboxId?: string,): Promise<string> {
    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }

    // Invalidate label cache before creating the message.
    KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

    //Need formal structure to message.  According to the swagger api doc:
    Logger.getInstance().debug("createMessage structure=" + util.inspect(pimMessage.getPimMessageStructure(), false, 5));
    const ret = await keepPimProvider.createMessage(uToken, pimMessage.getPimMessageStructure(), sendMessage, mailboxId);
    const retObj: any = (typeof (ret) === 'string') ? JSON.parse(ret) : ret;
    if (retObj.status === 200) {
      return retObj.unid;
    } else {
      const err: any = new Error(retObj.message);
      err.status = retObj.status;
      throw err;
    }
  }

  /**
   * Create a message from mime content.
   * @param userInfo Authentication information for the current user.
   * @param base64MimeMessage The mime messages encoded as base64. The message format is defined in [RFC 2045](https://tools.ietf.org/html/rfc2045).
   * @param sendMessage True to send the message after it is created. False to create a draft message. The default is false. 
   * @param receipts The type of receipts the originator of the message would like to receive. 
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns The unid of the created messages
   * @throws An error if the create failed. 
   */
  async createMimeMessage(userInfo: UserInfo, base64MimeMessage: string, sendMessage = false, receipts?: PimReceiptType[], mailboxId?: string,): Promise<string> {
    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }

    // Invalidate label cache before creating the message.
    KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

    //Need formal structure to message.  According to the swagger api doc:
    Logger.getInstance().debug(`createMimeMessage mime=${base64MimeMessage} sendMessage=${sendMessage} receipts=${receipts}`);
    const ret = await keepPimProvider.createMimeMessage(uToken, base64MimeMessage, sendMessage, this.getReceiptsParameter(receipts), mailboxId);
    const retObj: any = (typeof (ret) === 'string') ? JSON.parse(ret) : ret;
    if (retObj.status === 200) {
      return retObj.unid;
    } else {
      const err: any = new Error(retObj.message);
      err.status = retObj.status;
      throw err;
    }
  }

  /**
   * Update a messages flags (read/unread, etc) and any additional properties required to be stored with the message
   * @param pimItem The message to be updated with new data
   * @param userInfo The information used to authenticate the user.
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns The Keep results of the update. 
   */
  async updateMessageData(pimItem: PimMessage, userInfo: UserInfo, mailboxId?: string): Promise<any> {
    // Call updatePimItem to update the fields in the message through Keep
    const fStructure = pimItem.toMessageFlagStructure();
    if (fStructure && Object.keys(fStructure).length > 0) {
      await this.updateMessageFlagStructure(fStructure, userInfo, mailboxId);
    }

    const result = await KeepPimManager.getInstance().updatePimItem(pimItem.unid, userInfo, pimItem, mailboxId);

    if(pimItem.mimeUpdate && pimItem.unid){
      await KeepPimMessageManager
      .getInstance()
      .updateMimeMessage(userInfo, pimItem.unid, pimItem.mimeUpdate, true, undefined, undefined, mailboxId);
    }

    return result;
  }

  /**
   * Update only the messages flags (read/unread and quick flag) for a message. 
   * @param pimItem The message to update.
   * @param userInfo Authentication information for the current user.
   * @returns The Keep results of the update. 
   */
  async updateMessageFlags(pimItem: PimMessage, userInfo: UserInfo): Promise<any> {
    return this.updateMessageFlagStructure(pimItem.toMessageFlagStructure(), userInfo);
  }

  /**
   * Update only the messages flags (read/unread and quick flag) for one or more messages.
   * @param flagStructure An object containing the uids of messages who's flags should be updates. See PimMessages.toMessageFlagStructure for a description of this object.
   * @param userInfo Authentication information for the current user.
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns The Keep results of the update. 
   */
  async updateMessageFlagStructure(flagStructure: any, userInfo: UserInfo, mailboxId?: string,): Promise<any> {
    try {
      const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
      if (!uToken) {
        throw new Error("User is unauthenticated");
      }

      const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
      return await keepPimProvider.updateMessageFlags(uToken, flagStructure, mailboxId);
    } catch (err) {
      Logger.getInstance().error(`updateMessageFlags error: ${err}`);
      throw err;
    }
  }

  /**
   * Update the mime content of a message.
   * @param userInfo Authentication information for the current user.
   * @param messageId The unid of the message to update.
   * @param base64MimeMessage The base64 encoded updated mime content.
   * @param sendMessage True to send the message after it is updated. False to update a draft message. The default is false. 
   * @param saveFolderId Optional unid of a folder where the message will be saved.
   * @param receipts The type of receipts the originator of the message would like to receive. 
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns The unid of the updated message.
   */
  async updateMimeMessage(
    userInfo: UserInfo,
    messageId: string,
    base64MimeMessage: string,
    sendMessage = true,
    saveFolderId?: string,
    receipts?: PimReceiptType[],
    mailboxId?: string
  ): Promise<string> {
    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

    Logger.getInstance().debug(`updateMimeMessage mime=${base64MimeMessage} sendMessage=${sendMessage} saveFolderId=${saveFolderId} receipts=${receipts}`);
    const ret = await keepPimProvider.updateMimeMessage(
        uToken, 
        messageId, 
        base64MimeMessage, 
        sendMessage, 
        saveFolderId, 
        this.getReceiptsParameter(receipts), 
        mailboxId);
        
    const retObj: any = (typeof (ret) === 'string') ? JSON.parse(ret) : ret;
    if (retObj.status === 200) {
      return retObj.unid;
    } else {
      const err: any = new Error(retObj.message);
      err.status = retObj.status;
      throw err;
    }
  }

  /**
   * Returns the mime content of a messsage.
   * @param userInfo Authentication information for the current user.
   * @param messageId The unid of the message to retrieve
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns The mime content of the message
   * @throws An error if the retrieve of the mime content fails. 
   */
  async getMimeMessage(userInfo: UserInfo, messageId: string, mailboxId?: string): Promise<string> {
    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

    Logger.getInstance().debug("getMimeMessage messageId=" + messageId);
    return keepPimProvider.getMimeMessage(uToken, messageId, mailboxId);
  }

  /**
   * Move, add, or remove messages from a label. 
   * @param userInfo Authentication information for the current user.
   * @param labelId The unid of the target label. 
   * @param moveMessageIds A list of message unids of messages to move to the label.
   * @param addMessageIds A list of message unids of messages to add to the label.
   * @param removeMessageIds A list of message unids of messages to remove from the label.
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns The Keep results of the operation.
   */
  async moveMessages(userInfo: UserInfo, labelId: string, moveMessageIds?: string[], addMessageIds?: string[], removeMessageIds?: string[], copyMessageIds?: string[], mailboxId?: string): Promise<KeepMoveMessagesResults> {
    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }

    // Invalidate label cache before moving the messages.
    KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

    //Need formal structure to add and remove messages.  According to the swagger api doc:
    // It will be based on the unid of the message. 
    // {
    //   "add" : ["id1","id2","id3"],
    //   "move" : ["id1","id2","id3"],
    //   "remove" : ["id1","id2","id3"]
    // }
    const addRemoveStructure: any = {};

    if (moveMessageIds) {
      addRemoveStructure.move = moveMessageIds;
    }

    if (addMessageIds) {
      addRemoveStructure.add = addMessageIds;
    }

    if (removeMessageIds) {
      addRemoveStructure.remove = removeMessageIds;
    }

    if (copyMessageIds) {
      addRemoveStructure.copy = copyMessageIds;
    }
    return keepPimProvider.moveMessages(uToken, escape(labelId), addRemoveStructure, mailboxId);
  }

  /**
   * Permanently delete all messages in the trash. 
   * @param userInfo The information used to authenticate the user.
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns The results from Keep for empting the trash.
   * @throws An error if emptying the trash failed.
   */
  async emptyTrash(userInfo: UserInfo, mailboxId?: string): Promise<KeepPimBaseResults> {
    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

    return keepPimProvider.emptyTrash(uToken, mailboxId);

  }

  /**
   * Permenantly delete an item that is in the trash.
   * @param userInfo Authentication information for the current user.
   * @param unid The unid of the item to delete
   * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
   * Value can be replica id, filepath, owner shortname, or owner email. 
   * @returns The Keep results of deleting the item. 
   * @throws An error if the delete failed. 
   */
   async deleteItemFromTrash(userInfo: UserInfo, unid: string, mailboxId?: string): Promise<KeepPimBaseResults> {
    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
        throw new Error("User is unauthenticated");
    }

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
    return keepPimProvider.deleteItemFromTrash(uToken, unid, mailboxId);
}

  /**
   * Create Pim item objects from objects returned from Keep.
   * @param objArray An array of keep objects.
   * @param documents True if objects were retrieve from Keep with document=true. NOTE: This function will not return any results if document=false because the item form is not returned when documents=false.
   * @param viewname Optional name of the view that contains the objects. 
   * @param excludeFormTypes A list of form types to exclude.  
   * @param limit The maximum number of items to return.
   * @returns A list of Pim items 
   * @throws An error if any of the objects can not be converted to Pim items. 
   */
  convertToPimItems(objArray: object[], documents = true, viewname?: string, excludeFormTypes = ['Mailrule'], limit?: number): PimItem[] {
    const pimItems: PimItem[] = [];
    let iterArray: any[] = [];
    if (!Array.isArray(objArray)) {
      if (objArray['@unid'] || objArray["$TUA"]) {
        iterArray.push(objArray);
      }
    } else {
      iterArray = objArray;
    }

    for (const obj of iterArray) {
      if (documents) { // Form is only returned when using documents
        const formType = obj["Form"];
        if (excludeFormTypes.includes(formType)) {
          Logger.getInstance().warn(`Skipping rules when returning PimItems :${util.inspect(obj, false, 5)}`);
          continue; // Skip this item. 
        }
        const pItem = KeepPimManager.getInstance().createPimItemFromObject(obj, viewname);
        pimItems.push(pItem);
        if (limit !== undefined && pimItems.length === limit) {
          break;
        }
      }
    }
    return pimItems;
  }

  /**
   * Returns a list of PimMessage objects given a json string.
   * @param jsonString The json string containg the data for one of more Keep messages. 
   * @returns A array with one or more PimMessages. 
   */
  getPimMessagesFromJson(jsonString: string): PimMessage[] {
    const pimMessages: PimMessage[] = [];
    const jsonObj = JSON.parse(jsonString);
    if (Array.isArray(jsonObj)) {
      for (const obj of jsonObj) {
        pimMessages.push(PimItemFactory.newPimMessage(obj));
      }
    } else {
      pimMessages.push(PimItemFactory.newPimMessage(jsonObj));
    }

    return pimMessages;
  }

  /**
   * Returns the receipts parameter to use on Keep message API.
   * @param receipts The receipts to include.
   * @returns A string that can be used as the receipts parameter for the Keep message API.
   */
  getReceiptsParameter(receipts: PimReceiptType[] | undefined): string | undefined {
    let receiptParam: string | undefined = undefined;
    if (receipts) {
      const receiptStrings: string[] = [];
      for (const rType of receipts) {
        if (rType === PimReceiptType.DELIVERY) {
          receiptStrings.push("deliver");
        } else if (rType === PimReceiptType.READ) {
          receiptStrings.push("read");
        }
      }
      if (receiptStrings.length > 1) {
        receiptParam = receiptStrings.join(",");
      } else if (receiptStrings.length > 0) {
        receiptParam = receiptStrings[0];
      }
    }
    return receiptParam;
  }
}
