import { getService } from '@loopback/service-proxy';
import { inject, Provider } from '@loopback/core';
import { KeepPimDataSource } from '../datasources';
import { KeepDeleteLabelResults, KeepMoveLabelResults } from '../keep/pim/KeepPimLabelManager';
import { KeepPimBaseResults } from '../keep/pim/KeepPimConstants';
import { KeepMoveMessagesResults } from '../keep/pim/KeepPimMessageManager';
import { PimSubscription } from '../keep/pim/PimSubscription';


export enum DocumentDeletion {
  NONE = "NONE",
  LASTFOLDER = "LASTFOLDER",
  ALL = "ALL"
}

export interface KeepPim {
  // this is where you define the Node.js methods that will be
  // mapped to REST/SOAP/gRPC operations as stated in the datasource
  // json file.
  getLabels(authToken: string, includeUnreadCount?: boolean, mailboxid?: string): Promise<object[]>;
  getLabel(authToken: string, labelid: string, includeUnreadCount?: boolean, mailboxid?: string): Promise<object>;
  deleteLabel(authToken: string, labelid: string, documentdeletion?: DocumentDeletion, mailboxid?: string): Promise<KeepDeleteLabelResults>;
  createLabel(authToken: string, createStructure: any, mailboxid?: string): Promise<object>;
  moveLabel(authToken: string, labelid: string, moveStructure: any, mailboxid?: string): Promise<KeepMoveLabelResults>;
  updateLabel(authToken: string, labelid: string, updateStructure: any, mailboxid?: string): Promise<KeepPimBaseResults>;
  getMessages(authToken: string, labelId?: string, documents?: boolean, skip?: number, count?: number, mailboxid?: string): Promise<object[]>;
  createMessage(authToken: string, pimMessage: any, sendMessage?: boolean, mailboxid?: string): Promise<object>;
  createMimeMessage(authToken: string, base64MimeMessage: string, sendMessage: boolean, receipts?: string, mailboxid?: string): Promise<object>;
  updateMimeMessage(authToken: string, messageId: string, base64MimeMessage: string, sendMessage?: boolean, saveFolderId?: string, receipts?: string, mailboxid?: string): Promise<object>;
  updateMessageFlags(authToken: string, flagstructure: any, mailboxid?: string): Promise<any>;
  getMimeMessage(authToken: string, messageId: string, mailboxid?: string): Promise<string>;
  deleteMessage(authToken: string, messageId: string, mailboxid?: string): Promise<any>;
  getCalendars(authToken: string, mailboxid?: string): Promise<object[]>;
  getInboxMessages(authToken: string, documents?: boolean, skip?: number, count?: number, mailboxid?: string): Promise<object[]>;
  getSentMessages(authToken: string, documents?: boolean, skip?: number, count?: number, mailboxid?: string): Promise<object[]>;
  getJunkMessages(authToken: string, documents?: boolean, skip?: number, count?: number, mailboxid?: string): Promise<object[]>;
  getDraftMessages(authToken: string, documents?: boolean, skip?: number, count?: number, mailboxid?: string): Promise<object[]>;
  getTrashMessages(authToken: string, documents?: boolean, skip?: number, count?: number, mailboxid?: string): Promise<object[]>;
  emptyTrash(authToken: string, mailboxid?: string): Promise<KeepPimBaseResults>;
  deleteItemFromTrash(authToken: string, unid: string, mailboxid?: string): Promise<KeepPimBaseResults>;
  moveMessages(authToken: string, labelid: string, addRemoveStructure: any, mailboxid?: string): Promise<KeepMoveMessagesResults>;
  getThread(authToken: string, threadid: string, mailboxid?: string): Promise<any>;
  getCalendarEntries(authToken: string, calid: string, startDate?: string, endDate?: string, skip?: number, count?: number, mailboxid?: string): Promise<object[]>;
  getCalendarEntry(authToken: string, calid: string, entryid: string, mailboxid?: string): Promise<any>;
  createCalendarItem(authToken: string, calid: string, itemstructure: any, sendMeetingInvitations?: boolean,  mailboxid?: string): Promise<object>;
  updateCalendarItem(authToken: string, calid: string, unid: string, itemstructure: any, mailboxid?: string): Promise<any>;
  modifyCalendarItem(authToken: string, calid: string, unid: string, itemstructure: any, mailboxid?: string): Promise<any>;
  deleteCalendarItem(authToken: string, calid: string, itemid: string, mailboxid?: string): Promise<any>;
  getCalendarResponse(authToken: string, calid: string, itemid: string, mailboxid?: string): Promise<any>;
  createCalendarResponse(authToken: string, calid: string, itemid: string, invitationresponse: any, preventDelete?: boolean, mailboxid?: string): Promise<any>;
  getAttachment(authToken: string, unid: string, attachmentName: string, mailboxid?: string): Promise<any>;
  deleteAttachment(authToken: string, unid: string, attachmentName: string, mailboxid?: string): Promise<any>;
  createAttachment(authToken: string, unid: string, attachment: any, attachmentName?: string, attachmentContentType?: string, mailboxid?: string): Promise<any>;
  getContactEntries(authToken: string, documents?: boolean, skip?: number, count?: number, mailboxid?: string):  Promise<object[]>;
  lookupContactEntries(authToken: string, q: string, fulltext?: boolean, directoryid?: string, all?: boolean, skip?: number, count?: number, mailboxid?: string): Promise<object[]>;
  getContactEntry(authToken: string, unid: string, mailboxid?: string): Promise<any>;
  createContactEntry(authToken: string, itemstructure: any, mailboxid?: string): Promise<any>;
  updateContactEntry(authToken: string, unid: string, itemstructure: any, mailboxid?: string): Promise<KeepPimBaseResults>;
  deleteContactEntry(authToken: string, unid: string, mailboxid?: string): Promise<any>;
  getTasks(authToken: string, documents?: boolean, skip?: number, count?: number, mailboxid?: string): Promise<object[]>;
  getTask(authToken: string, unid: string, mailboxid?: string): Promise<any>;
  createTaskEntry(authToken: string, itemstructure: any, mailboxid?: string): Promise<any>;
  updateTaskEntry(authToken: string, unid: string, itemstructure: any, mailboxid?: string): Promise<KeepPimBaseResults>;
  deleteTaskEntry(authToken: string, unid: string, mailboxid?: string): Promise<any>;
  getOOO(authToken: string, userid: string, mailboxid?: string): Promise<any>;
  updateOOO(authToken: string, itemstructure: any, mailboxid?: string): Promise<any>;
  getPimItem(authToken: string, unid: string, mailboxid?: string): Promise<any>;
  updatePimItem(authToken: string, unid: string, itemstructure: any, mailboxid?: string): Promise<any>;
  getDelegation(authToken: string, mailboxid?: string): Promise<any>;
  createReplaceDelegation(authToken: string, delegationStructure: any, mailboxid?: string): Promise<any>;
  updateDelegation(authToken: string, updateDelegationStructure: any, mailboxid?: string): Promise<any>;
  deleteDelegation(authToken: string, delegate: string, mailboxid?: string): Promise<any>;
  getNotes(authToken: string, documents?: boolean, skip?: number, count?: number, mailboxid?: string): Promise<object[]>;
  getNote(authToken: string, unid: string, mailboxid?: string): Promise<any>;
  createNote(authToken: string, itemstructure: any, mailboxid?: string): Promise<any>;
  updateNote(authToken: string, unid: string, itemstructure: any, mailboxid?: string): Promise<any>;
  deleteNote(authToken: string, unid: string, mailboxid?: string): Promise<any>;
  createRule(authToken: string, ruleStructure: any, mailboxid?: string): Promise<object>;
  getRules(authToken: string, mailboxid?: string): Promise<object[]>;
  getRule(authToken: string, ruleid: string, mailboxid?: string): Promise<any>;
  deleteRule(authToken: string, ruleid: string, mailboxid?: string): Promise<any>;
  updateRule(authToken: string, ruleId: string, updateStructure: any, mailboxid?: string): Promise<object[]>;
  search(authToken: string, searchStructure: any, skip?: number, count?: number, mailboxid?: string): Promise<object[]>;
  getAvatar(authToken: string, email: string, height?: number, width?: number): Promise<any>;
  getSubscription(authToken: string, uuid: string, mailboxid?: string): Promise<PimSubscription>;
  deleteSubscription(authToken: string, uuid: string, mailboxid?: string): Promise<KeepPimBaseResults>;
  createSubscription(authToken: string, subscriptionStructure: any, mailboxid?: string): Promise<KeepPimBaseResults>;
}

export class KeepPimProvider implements Provider<KeepPim> {
  constructor(
    // KeepPim must match the name property in the datasource json file
    @inject('datasources.KeepPim')
    protected dataSource: KeepPimDataSource = new KeepPimDataSource(),
  ) { }

  value(): Promise<KeepPim> {
    return getService(this.dataSource);
  }
}
