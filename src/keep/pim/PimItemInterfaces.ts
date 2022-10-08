import { PimCalendarItem, PimTask } from "../../internal";
import { PimDeliveryPriority, PimImportance, PimLabelTypes, ContactAddressKey, ContactType, PimAddress } from "./KeepPimConstants";
export interface PimItem {

    /**
     * Properties common to all PIM items
     */


    /**
     * Unique identifier for an item.
     * @type {string}
     */
    unid: string;

    /**
     * Internal id of the document representing the item in Domino.
     * @type {number}
     */
    noteId: number;

    /**
     * The timestamp of when the item was created.
     * @type {(Date | undefined)}
     */
    createdDate: Date | undefined;

    /**
     * Timestamp of when the item was last changed.
     * @type {(Date | undefined)}
     */
    lastModifiedDate: Date | undefined;

    /**
     * Indicates whether the item is marked as confidential.
     * @type {boolean}
     */
    isConfidential: boolean;

    /**
     * The name of the view for this item in Domino.
     * @type {string}
     */
    view: string;

    /**
     * An array of unique ids of folders that contain this item.
     * @type {(string[] | undefined)}
     */
    parentFolderIds: string[] | undefined;

    /**
     * The text of the body of the item.
     * @type {string}
     */
    body: string;

    /**
     * Describes the format of the contents of the body.
     * @type {(string | undefined)}
     */
    bodyType: string | undefined;

    /**
     * The subject or brief description of the item.
     * @type {(string | undefined)}
     */
    subject: string | undefined;

    /**
     * Indicates whether the item has been read by the user.
     * @type {boolean}
     */
    isRead: boolean;

    /**
     * Indicates whether the item is marked as private.
     * @type {boolean}
     */
    isPrivate: boolean;

    /**
     * Array of categories assigned to the item.
     * @type {string[]}
     */
    categories: string[];

    /**
     * Array of names of attachments associated with the item.
     * @type {string[]}
     */
    attachments: string[];

    /**
     * Array of extended properties associated with the item.
     * @type {any[]}
     */
    extendedProperties: any[];
    
    /**
     * The text of the mime content of the item in base64 format
     * @type {(string | undefined)}
     */
    mimeUpdate: string | undefined;

    /**
     * Add a single extened proeprty to the item. 
     * @param property The property to add
     */
    addExtendedProperty(property: any): void;

    /**
     * Update an extended property for the item.
     * @param identifiers A list of identifiers and their values for a matching extended property. 
     * @param newProperty The new value of the property
     */
    updateExtendedProperty(identifiers: any, newProperty: any): void;

    /**
     * Find an extended property in this Pim item.
     * @param identifiers A list of identifiers and their values for a matching extended property. 
     * @returns An object containing the extended property data or undefined if the extended property does not exist.
     */
    findExtendedProperty(identifiers: any): any | undefined;

    /**
     * Delete an extended property in this Pim item.  Note that this does not remove the key, but sets
     * the value to null so that the field is removed when sent to Keep.
     * @param identifiers A list of identifiers and their values for a matching extended property
     */
    deleteExtendedProperty(identifiers: any): void;

    /**
     * Returns an additional property set for the item. 
     * @param key The key for the property to return.
     * @returns The value of the proeperty or undefined if it is not set. 
     */
    getAdditionalProperty(key: string): any | undefined;

    /**
     * Delete an additional property set for the item.  This will set the property's value to null so that
     * Keep will remove the setting if this object is send in an update.
     * @param key The key for the property to delete.
     */
    deleteAdditionalProperty(key: string): void;

    /**
     * Remove an additional property from the object's AdditionalProperties.  This will remove the
     * property from this objects internal representation.  Note that Keep will NOT remove the value from the
     * object's AdditionalProperties if no value is sent in an update.
     * @param key The key of the property to remove
     */
    removeAdditionalProperty(key: string): void;

    /**
     * Set an additional property for the item. Use this to set additional properiies not defined on the Keep API. 
     * @param key The key for the property to set. 
     * @param value The value of the property. 
     */
    setAdditionalProperty(key: string, value: any): void;

    /**
     * Returns a structure that can be used to create or update a PIM item on the Keep API. 
     * @returns An object to use when creating or updating a PIM item. 
     */
    toPimStructure(): object;

    /**
     * Return true if this object implements the PimLabel interface
     * @return True if the item implements the PimLabel protocol
     */
    isPimLabel(): this is PimLabel;

    /**
    * Return true if this object implements the PimTask interface
    * @return True if the item implements the PimTask protocol
    */
    isPimTask(): this is PimTask;

    /**
     * Return true if this object implements the PimMessage interface
     * @return True if the item implements the PimMessage protocol
     */
    isPimMessage(): this is PimMessage;

    /**
     * Return true if this object implements the PimContact interface
     * @return True if the item implements the PimContact protocol
     */
    isPimContact(): this is PimContact;

    /**
     * Return true if this object implements the PimNote interface
     * @return True if the item implements the PimNote protocol
     */
    isPimNote(): this is PimNote;

    /**
     * Return true if this object implements the PimCalendarItem interface
     * @return True if the item implements the PimCalendarItem protocol
     */
    isPimCalendarItem(): this is PimCalendarItem;

    /**
     * Return true if this object implements the PimTask interface
     * @return True if the item implements the PimTask protocol
     */
    isPimThread(): this is PimThread;

}
export interface PimMessage extends PimItem {
    /**
     * Indicates who created the message.
     */
    from: string | undefined;

    /**
     * Array of to recipients.
     */
    to: string[] | undefined;

    /**
     * Array of cc recipients.
     */
    cc: string[] | undefined;

    /**
     * Array of bcc recipients.
     */
    bcc: string[] | undefined;

    /**
     * List of recipients in a reply.
     */
    replyTo: string[] | undefined;

    /**
     * Subject line for a reply message.
     */
    inReplyTo: string | undefined;

    /**
     * Indicates whether a return receipt was requested.
     */
    returnReceipt: boolean | undefined;

    /**
     * Indicates whether a delivery receipt was requested.
     */
    deliveryReceipt: boolean | undefined;

    /**
     * The size of the message in byes.
     */
    size: number;

    /**
     * Timestamp of when the message was received.
     */
    receivedDate: Date | undefined;

    /**
     * Timestamp of when the message was sent.
     */
    sentDate: Date | undefined;

    /**
     * The subject of the message.
     */
    subject: string;

    /**
     * Indicates the importance assigned to the message.
     */
    importance: PimImportance;

    /**
     * Indicates the delivery priority of the message.
     */
    deliveryPriority: PimDeliveryPriority;

    /**
     * This property holds the conversation index of a message in a thread of messages in a conversation.
     */
    conversationIndex: string | undefined;

    /**
     * The abstract (beggining of the body) for a message.
     */
    abstract: string;

    /**
     * For meeting messages, this indicates the type of meeting request or response message.
     */
    noticeType: string | undefined;

    /**
     * For meeting messages, this is the unid of the related calendar item.
     */
    referencedCalendarItemUnid: string | undefined;

    /**
     * For meeting message, this is the ical representation of the message.
     */
    icalStream: string | undefined;

    /**
     * The ical message ID related to a meeting message.
     */
    icalMessageId: string | undefined;

    /**
     * A message ID associated with the message.
     */
    messageId: string | undefined;

    /**
     * A references represents the list of messageId separated by space.
     * They are used to associate replies with the original messages.
     */
    references: string | undefined;

    /**
     * Start date for a meeting notice.
     */
     start: string | undefined;

    /**
     * Start timezone for a meeting notice.
     */
     startTimeZone: string | undefined;

     /**
     * End date for a meeting notice.
      */
     end: string | undefined;

    /**
     * End timezone for a meeting notice.
     */
     endTimeZone: string | undefined;
     
     /**
     * Proposed new start date for a reschedule meeting response.
     */

    newStartDate: Date | undefined;

    /**
     * Proposed new end date for a reschedule meeting response.
     */
    newEndDate: Date | undefined;

    /**
     * Idenfies a threaded message conversation.
     */
    threadId: string | undefined;

    /**
     * The title for threaded message conversation.
     */
    threadTopic: string | undefined;
    /**
     * Indicates the message's position in a Domino view.
     */
    position: number;

    /**
     * Indicates whether the message has been flagged for followup.
     */
    isFlaggedForFollowUp: boolean;


    /**
     * Query to see if a message is a meeting request.
     * @return True if the message is a meeting request.
     */
    isMeetingRequest(): boolean;

    /**
     * Queries to see if the message is a meeting response message.
     * @return True if the message is a meeting response.
     */
    isMeetingResponse(): boolean;

    /**
     * Queries to see if the message is a counter proposal.
     * @return True if the message is a counter proposal.
     */
    isCounterProposalRequest(): boolean;

    /**
     * Queries to see if a message is a delegated request.
     * @return True if the message is a delegated reqeust.
     */
    isDelegatedRequest(): boolean;

    /**
     * This function generates an object in PIM format to send to Keep to create or update this message.
     * @return An object to send to Keep for a create or update of this message.
     */
    getPimMessageStructure(): object;

    /**
     * Based on this message's settings, this function generates an object we can send to Keep to update the message's flags.
     * @return A structure suitable for the Keep PATCH /messages. 
     */
    toMessageFlagStructure(): object;

    /**
     * Query to see if a message is a meeting cancellation.
     * @return True if the message is a meeting cancellation.
     */
     isMeetingCancellation(): boolean;
}
export interface PimNote extends PimItem {

    /**
     * The diary date of the note.
     */
    diaryDate: Date | undefined;

}

export interface PimContact extends PimItem {
    /**
     * Returns true if this contact is a group, false if it represents a person. 
     */
    readonly isGroup: boolean;

    /**
     * Comment containing details about the contact.
     */
    comment: string;

    /**
     * Indicates whether the contact is a person or a group.
     */
    type: ContactType;

    /**
     * Full name of the contact.
     */
    fullName: string[] | undefined;

    /**
     * First name of the contact.
     */
    firstName: string | undefined;

    /**
     * Last name of the contact.
     */
    lastName: string | undefined;

    /**
     * Middle initial of the contact.
     */
    middleInitial: string | undefined;

    /**
     * The contact's title.
     */
    title: string | undefined;

    /**
     * Suffix of the contact's name.
     */
    suffix: string | undefined;

    /**
     * The contact's job title.
     */
    jobTitle: string | undefined;

    /**
     * The company with which the contact is associated.
     */
    companyName: string | undefined;

    /**
     * Primary email address of the contact.
     */
    primaryEmail: string | undefined;

    /**
     * The contact's school email address.
     */
    schoolEmail: string | undefined;

    /**
     * The contact's mobile email address.
     */
    mobileEmail: string | undefined;

    /**
     * Array of the contact's work email addresses.
     */
    workEmails: string[];

    /**
     * Array of the contact's home email addresses.
     */
    homeEmails: string[];

    /**
     * Array of any other email addresses associated with the contact.
     */
    otherEmails: string[];

    /**
     * The contact's office phone number.
     */
    officePhone: string | undefined;

    /**
     * The contact's home phone number.
     */
    homePhone: string | undefined;

    /**
     * The contact's mobile phone number.
     */
    cellPhone: string | undefined;

    /**
     * The contact's office fax number.
     */
    officeFax: string | undefined;

    /**
     * The contact's home fax number.
     */
    homeFax: string | undefined;

    /**
     * Other phone numbers assoicated with the contact.
     */
    otherPhones: string[];

    /**
     * Mailing address of the contact's place of work.
     */
    officeAddress: PimAddress | undefined;

    /**
     * The contact's home mailing address.
     */
    homeAddress: PimAddress | undefined;

    /**
     * Other mailing addresses associated with the contact.
     */
    otherAddress: PimAddress | undefined;

    /**
     * Identifies the department in which the contact works.
     */
    department: string | undefined;

    /**
     * Identifies the contact's location.
     */
    location: string | undefined;

    /**
     * Identifies the contact's manager.
     */
    manager: string | undefined;

    /**
     * Identifies the contact's assistant.
     */
    assistant: string | undefined;
    
    /**
     * Identifies the contact's spouse.
     */
    spouse: string | undefined;
    
    /**
     * The contacts birthday.
     */
    birthday: Date | undefined;

    /**
     * The contact's anniversary.
     */
    anniversary: Date | undefined;

    /**
     * The contact's homepage.
     */
    homepage: string | undefined;

    /**
     * Array of instant messenger addresses for the contact.
     */
    imAddresses: string[];

    /**
     * The contact's photo.
     */
    photo: string | undefined;

    /**
     * URL of where to get the contact's photo.
     */
    photoURL: string | undefined;


    /**
     * Remove an email address from the user's email addresses.  This function will search through all stored email
     * addresses for the contact and remove any matches.
     * @param email The address to remove.
     */
    removeEmailAddress(email: string): void;

    /**
     * This function clears all email addresses associated with the contact.
     */
    removeEmailAddresses(): void;

    /**
     * Remove a phone number from the user's phone numbers.  This function will search through all stored phone
     * numbers for the contact and remove any matches.
     * @param number The number to remove.
     */
    removePhoneNumber(number: string): void;

    /**
     * This function removes all phone numbers associated with the contacdt.
     */
    removePhoneNumbers(): void;

    /**
     * Remove a matching key from an address object. For instance, it can be used to remove the state from a contact's 
     * Home address.
     * @param key The key in the address object
     * @param type The type of address. Value is "Home", "Work", or "Other"
     */
    removeAddressKey(key: ContactAddressKey, type: string): void;

    /**
     * Convenience method for removing all addresses associated with the contact.
     */
    removeAddresses(): void;

    /**
    * Removes a specific instant message address from the contact. 
    * @param address The instant message address to remove.
    */
    removeImAddress(address: string): void;

}

export interface PimLabel extends PimItem {
    /**
     * Unique identifer of the folder this label represents.
     */
    folderId: string;

    /**
     * The user-viewable name of the folder this label represents.
     */
    displayName: string;

    /**
     * The Domino view the label represents.
     */
    view: string;

    /**
     * The number of items contained in (associated with) the label/folder.
     */
    documentCount: number;

    /**
     * The number of unread items contained in (associated with) the label/folder.
     */
    unreadCount: number;

    /**
     * Type of the label, indicating the type of items it is associated with.
     */
    type: PimLabelTypes;

    /**
     * The folderId of the parent of this folder, if it has a parent.
     */
    parentFolderId: string | undefined;

    /**
     * Return calendar name to use on a Keep API request if this is a calendar label.
     */
    readonly calendarName: string | undefined;
}

export interface PimThread extends PimItem {
    /**
     * Stores the email addresses associated with this thread.
     */
    emailIds: string[] | undefined;
}