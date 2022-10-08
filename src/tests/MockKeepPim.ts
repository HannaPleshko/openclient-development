
import { KeepMoveLabelResults, KeepMoveMessagesResults, KeepPimBaseResults, PimLabel } from "../keep";
import { KeepTransportManager } from "../keep/KeepTransportManager";
import { PimSubscription } from "../keep/pim/PimSubscription";
import { DocumentDeletion, KeepPim } from "../services";

/**
 * This class is for testing with Sinon mocks. Since KeepPim is an interface we can't create a Sinon mock for it. Sinon only allows mocking an class.
 * So this class is an implementation of KeepPim that can be used with Sinon to mock individual functions. When using this class, always set a mock for
 * any functions you expect to be called during your test. 
 */
export class MockKeepPim implements KeepPim {
    
    transportName: string = KeepTransportManager.SERVICE_TRANSPORT_NAME;

    getLabels(authToken: string, includeUnreadCount?: boolean, mailboxid?: string): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    getLabel(authToken: string, labelid: string, includeUnreadCount?: boolean, mailboxid?: string): Promise<PimLabel> {
        throw new Error("Method not implemented.");
    }
    deleteLabel(authToken: string, labelid: string, documentdeletion?: DocumentDeletion, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    createLabel(authToken: string, createStructure: any, mailboxid?: string): Promise<object> {
        throw new Error("Method not implemented.");
    }
    moveLabel(authToken: string, labelid: string, moveStructure: any, mailboxid?: string): Promise<KeepMoveLabelResults> {
        throw new Error("Method not implemented.");
    }
    updateLabel(authToken: string, labelid: string, updateStructure: any, mailboxid?: string): Promise<KeepPimBaseResults> {
        throw new Error("Method not implemented.");
    }
    getMessages(authToken: string, labelId?: string, documents?: boolean, skip?: number, count?: number, mailboxid?: string): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    createMessage(authToken: string, pimMessage: any, sendMessage = false, mailboxid?: string): Promise<object> {
        throw new Error("Method not implemented.");
    }
    createMimeMessage(authToken: string, base64MimeMessage: string, sendMessage: boolean, receipts?: string, mailboxid?: string): Promise<object> {
        throw new Error("Method not implemented.");
    }
    updateMimeMessage(authToken: string, messageId: string, base64MimeMessage: string, sendMessage = true, saveFolderId?: string, receipts?: string, mailboxid?: string): Promise<object> {
        throw new Error("Method not implemented.");
    }
    updateMessageFlags(authToken: string, flagstructure: any, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getMimeMessage(authToken: string, messageId: string, mailboxid?: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    deleteMessage(authToken: string, messageId: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    emptyTrash(authToken: string, mailboxid?: string): Promise<KeepPimBaseResults> {
        throw new Error("Method not implemented.");
    }
    deleteItemFromTrash(authToken: string, unid: string, mailboxid?: string): Promise<KeepPimBaseResults> {
        throw new Error("Method not implemented.");
    }
    getCalendars(authToken: string, mailboxid?: string): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    getInboxMessages(authToken: string, documents?: boolean, skip?: number, count?: number): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    getSentMessages(authToken: string, documents?: boolean, skip?: number, count?: number): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    getJunkMessages(authToken: string, documents?: boolean, skip?: number, count?: number): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    getDraftMessages(authToken: string, documents?: boolean, skip?: number, count?: number): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    getTrashMessages(authToken: string, documents?: boolean, skip?: number, count?: number): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    moveMessages(authToken: string, labelid: string, addRemoveStructure: any, mailboxid?: string): Promise<KeepMoveMessagesResults> {
        throw new Error("Method not implemented.");
    }
    getThread(authToken: string, threadid: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getCalendarEntries(authToken: string, calid: string, startDate?: string, endDate?: string, skip?: number, count?: number, mailboxid?: string): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    getCalendarEntry(authToken: string, calid: string, entryid: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    createCalendarItem(authToken: string, calid: string, itemstructure: any, sendMeetingInvitations?: boolean, mailboxid?: string): Promise<object> {
        throw new Error("Method not implemented.");
    }
    updateCalendarItem(authToken: string, calid: string, unid: string, itemstructure: any, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    modifyCalendarItem(authToken: string, calid: string, unid: string, itemstructure: any, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    deleteCalendarItem(authToken: string, calid: string, itemid: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getCalendarResponse(authToken: string, calid: string, itemid: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    createCalendarResponse(authToken: string, calid: string, itemid: string, invitationresponse: any, preventDelete?: boolean, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getAttachment(authToken: string, unid: string, attachmentName: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    deleteAttachment(authToken: string, unid: string, attachmentName: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    createAttachment(authToken: string, unid: string, attachment: any, attachmentName?: string, attachmentContentType?: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getContactEntries(authToken: string, documents = true, skip?: number, count?: number, mailboxid?: string): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    getContactEntry(authToken: string, unid: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    lookupContactEntries(authToken: string, q: string, fulltext?: boolean, directoryid?: string, all?: boolean, skip?: number, count?: number, mailboxid?: string): Promise<object[]>{
        throw new Error("Method not implemented.");
    }    
    createContactEntry(authToken: string, itemstructure: any, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    updateContactEntry(authToken: string, unid: string, itemstructure: any, mailboxid?: string): Promise<KeepPimBaseResults> {
        throw new Error("Method not implemented.");
    }
    deleteContactEntry(authToken: string, unid: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getTasks(authToken: string, documents = true, skip?: number, count?: number, mailboxid?: string): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    getTask(authToken: string, unid: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    createTaskEntry(authToken: string, itemstructure: any, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    updateTaskEntry(authToken: string, unid: string, itemstructure: any, mailboxid?: string): Promise<KeepPimBaseResults> {
        throw new Error("Method not implemented.");
    }
    deleteTaskEntry(authToken: string, unid: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getOOO(authToken: string, userid: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    updateOOO(authToken: string, itemstructure: any, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getPimItem(authToken: string, unid: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    updatePimItem(authToken: string, unid: string, itemstructure: any, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getDelegation(authToken: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    createReplaceDelegation(authToken: string, delegationStructure: any, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    updateDelegation(authToken: string, delegationStructure: any, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    deleteDelegation(authToken: string, delegate: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getNotes(authToken: string, documents?: boolean, skip?: number, count?: number, mailboxid?: string): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    getNote(authToken: string, unid: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    createNote(authToken: string, itemstructure: any, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    updateNote(authToken: string, unid: string, itemstructure: any, mailboxid?: string): Promise<KeepPimBaseResults> {
        throw new Error("Method not implemented.");
    }
    deleteNote(authToken: string, unid: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    createRule(authToken: string, ruleStructure: any, mailboxid?: string): Promise<object> {
        throw new Error("Method not implemented.");
    }
    getRules(authToken: string, mailboxid?: string): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    getRule(authToken: string, ruleid: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    deleteRule(authToken: string, ruleid: string, mailboxid?: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    updateRule(authToken: string, ruleId: string, updateStructure: any, mailboxid?: string): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    search(authToken: string, searchStructure: any, skip?: number, count?: number, mailboxid?: string): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    getAvatar(authToken: string, email: string, height?: number, width?: number): Promise<object[]>{
        throw new Error("Method not implemented.");
    } 
    getSubscription(authToken: string, uuid: string, mailboxid?: string): Promise<PimSubscription> {
        throw new Error("Method not implemented");
    }
    deleteSubscription(authToken: string, uuid: string, mailboxid?: string): Promise<KeepPimBaseResults> {
        throw new Error("Method not implemented");
    }
    createSubscription(authToken: string, pimSubscription: PimSubscription, mailboxid?: string): Promise<KeepPimBaseResults> {
        throw new Error("Method not implemented");
    }
}