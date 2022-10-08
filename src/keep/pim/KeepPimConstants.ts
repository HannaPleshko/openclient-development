export class KeepPimConstants {
    static readonly INBOX = "($Inbox)";
    static readonly SENT = "($Sent)";
    static readonly TRASH = "($SoftDeletions)";
    static readonly DRAFTS = "($Drafts)";
    static readonly JUNKMAIL = "($JunkMail)";
    static readonly CALENDAR = "($Calendar)";
    static readonly CONTACTS = "($Contacts)";
    static readonly TASKS = "($ToDo)";
    static readonly JOURNAL = "($Journal)";
    static readonly ALL = "($All)";
    static readonly MOVE_ROOT_ID = "($Root)";

    /**
     * Prefix for keys that contain extended properties. Each property is a group of key/value pairs. Use this when more than one of the key/value pairs are used to uniquely identify the property. 
     * A unique index will be appended to it when saved to Keep. 
     */
    static readonly EXT_PROPERTY_PREFIX = "xHCL-extProp_";
    static readonly ADDITIONAL_FIELDS = "AdditionalFields";

    /** 
     * Prefix for keys that contain additional properties that are not in the Keep API. It is appeneded with a unique property name. Use this when there is a single unique property name. 
     * For example xHCL-UID is an alternate UID. 
     */
    static readonly EXT_ADDITIONAL_PREFIX = "xHCL-";

    static readonly EXT_ADDITIONAL_NOTE_ID = KeepPimConstants.EXT_ADDITIONAL_PREFIX + "com.domino.noteid";
    static readonly EXT_ADDITIONAL_VIEW = KeepPimConstants.EXT_ADDITIONAL_PREFIX + "com.domino.view";
    static readonly EXT_ADDITIONAL_BODY_TYPE = KeepPimConstants.EXT_ADDITIONAL_PREFIX + "com.domino.bodyType";
    static readonly EXT_ADDITIONAL_TASK_TYPE = KeepPimConstants.EXT_ADDITIONAL_PREFIX + "com.domino.taskType";
    static readonly EXT_ADDITIONAL_STATUS_LABEL = KeepPimConstants.EXT_ADDITIONAL_PREFIX + "com.domino.statusLabel";
    static readonly EXT_ADDITIONAL_COMPLETED_DATE = KeepPimConstants.EXT_ADDITIONAL_PREFIX + "com.domino.completedDate";
    static readonly EXT_ADDITIONAL_IS_DRAFT = KeepPimConstants.EXT_ADDITIONAL_PREFIX + "com.domino.isDraft";

    /** 
     * Participant types
     * TYPE_PARTICIPANT implies the user defined is a participant of a calendar item, task, etc.
     */
    static readonly TYPE_PARTICIPANT = "Participant";

    /** 
     * Participant roles
     */
    // ROLE_OWNER is the owner of the event; calendar item, task, etc.
    static readonly ROLE_OWNER = "owner";
    // ROLE_CHAIR is the chair person of the event; calendar item, task, etc.
    static readonly ROLE_CHAIR = "chair";
    // ROLE_ATTENDEE is an attendee of the event, task, etc.
    static readonly ROLE_ATTENDEE = "attendee";
    // ROLE_OPTIONAL indicates that the person's participation is optional.
    static readonly ROLE_OPTIONAL = "optional";
    // ROLE_INFORMATIONAL for FYI participants.
    static readonly ROLE_INFORMATIONAL = "informational";
    // ROLE_CONTACT is for a person who may be contacted for information about the event.
    static readonly ROLE_CONTACT = "contact";

    /** Calendar name for the default calendar */
    static readonly DEFAULT_CALENDAR_NAME = "default";
}


/**
 * PIM Api Operation Ids
 * All PIM operation ids come from the Keep swagger doc (when selecting the POST, DELETE, PUT for the operation, the browser url shows the operation id)
 */
export enum KeepPimOperationIds {
    GET_LABELS_ALL = "getLabelsAll",
    GET_LABEL = "getLabelInfo",
    GET_MESSAGES = "getMessageList",
    GET_MESSAGES_WITH_LABEL = "getMessagesWithLabel",
    GET_INBOX_MESSAGES = "getInbox",
    GET_SENT_MESSAGES = "getSentList",
    GET_JUNK_MESSAGES = "getJunkEmail",
    GET_TRASH_MESSAGES = "getTrash",
    EMPTY_TRASH = "emptyTrash",
    HARD_DELETE = "hardDeleteDocument",
    GET_DRAFT_MESSAGES = "getDrafts",
    GET_MAIL_THREAD = "getMailThread",
    DELETE_LABEL = "deleteLabel",
    CREATE_LABEL = "createLabel",
    MOVE_LABEL = "moveLabel",
    UPDATE_LABEL = "updateLabel",
    CREATE_MESSAGE = "createMessage",
    CREATE_MIME_MESSAGE = "createMimeMessage",
    UPDATE_MIME_MESSAGE = "updateMimeMessage",
    UPDATE_MESSAGE_FLAGS = "updateMessageProperties",
    GET_MIME_MESSAGE = "getMimeMessage",
    DELETE_MIME_MESSAGE = "deleteMimeMessage",
    MOVE_MESSAGES = "addRemoveToLabel",
    GET_CALENDARS = "getCalendars",
    GET_CALENDAR_ENTRIES = "getOneCalendar",
    GET_CALENDAR_ENTRY = "getCalendarEntry",
    CREATE_CALENDAR_ITEM = "createCalendarEntry",
    UPDATE_CALENDAR_ITEM = "updateCalendarEntry",
    MODIFY_CALENDAR_ITEM = "modifyCalendarEntry",
    DELETE_CALENDAR_ITEM = "deleteCalendarEntry",
    GET_CALENDAR_RESPONSE = "getCalendarResponses",
    CREATE_CALENDAR_RESPONSE = "createCalendarResponse",
    GET_ATTACHMENT = "getMailAttachment",
    DELETE_ATTACHMENT = "deleteMailAttachment",
    CREATE_ATTACHMENT = "createPimAttachment",
    GET_CONTACT_ENTRIES = "getPeople",
    GET_ADDRESS_LOOKUP_ENTRIES = "getAddressLookupSimple",
    GET_CONTACT_ENTRY = "getPerson",
    CREATE_CONTACT_ENTRY = "createPerson",
    UPDATE_CONTACT_ENTRY = "putPerson",
    DELETE_CONTACT_ENTRY = "deletePerson",
    GET_TASKS = "getTaskList",
    GET_TASK = "getTask",
    CREATE_TASK = "postTask",
    UPDATE_TASK = "postTask",
    DELETE_TASK = "deleteTask",
    GET_NOTES = "getNotebookEntries",
    GET_NOTE = "getNotebookEntry",
    CREATE_NOTE = "createNotebookEntry",
    UPDATE_NOTE = "updateNotebookEntry",
    DELETE_NOTE = "deleteNotebookEntry",
    GET_OOO = "getOOO",
    UPDATE_OOO = "updateOOO",
    GET_PIM_ITEM = "getPimItem",
    UPDATE_PIM_ITEM = "updatePimItem",
    GET_RULES = "getRules",
    GET_RULE = "getRule",
    DELETE_RULE = "deleteRule",
    CREATE_RULE = "createRule",
    UPDATE_RULE = "updateRule",
    SEARCH = "searchPIM",
    GET_AVATAR = "getAvatar"
}

/**
 * Importance settings 
 */
export enum PimImportance {
    NONE,
    HIGH,
    MEDIUM,
    LOW
}

/**
 * Delivery Priority settings 
 */
export enum PimDeliveryPriority {
    NORMAL,
    HIGH,
    LOW
}

/**
 * Receipt types 
 */
export enum PimReceiptType {
    READ,
    DELIVERY
}


// Describes the format of the item retrieve from the Keep PIM API. 
export enum PimItemFormat {
    PRIMITIVE,
    DOCUMENT
}

// Describes the amount of data returned
export enum PimObjectBaseShape {
    IDONLY,
    ALL
}

/**
 * Types of Pim items
 */
export enum PimItemType {
    MESSAGE,
    CALENDAR,
    CONTACT,
    TASK,
    NOTE
}

/**
 * Constants for building rules in PIM
 */
export enum PimRuleConditionConstants {
    SUBJECT = "Subject ",
    BODY_OR_SUBJECT = "Body or Subject ",
    SENDER = "Sender ",
}

/**
 * Constants for separators when building rules in PIM
 */
export enum PimRuleSeparatorConstants {
    WHEN = "WHEN",
    THEN = "THEN",
    OR = "OR",
    AND = "AND",
    SEPARATOR = ","
}


/**
 * Constants for separators when building rules in PIM
 */
export enum PimRuleOperatorConstants {
    CONTAINS = "contains ",
    IS = "is ",
    IS_NOT = "is not ",
    DOES_NOT_CONTAION = "does not contain "
}

/**
 * Constants for the beginning of actions  in PIM
 */
export enum PimRuleActionConstants {
    MOVE_TO_FOLDER = "move to folder ",
    COPY_TO_FOLDER = "copy to folder ",
    DELETE = "don't Accept Message",
    STOP_PROCESSING = "Stop Processing further Rules",
    SEND_FULL_COPY = "send Full Copy to ",
    SEND_HEADERS_COPY = "send Copy of Headers to ",
    CHANGE_IMPORTANCE = "change Importance to",
    EXPIRE = "Set Expire Date to"
}

export enum PimNoticeTypes {
    USER_ACCEPTED = "A",    // A = User accepted request
    COUNTER_PROPOSAL_ACCEPTED = "B",   // B = Chair has accepted a counter proposal
    EVENT_CANCELLED = "C",  // C = Chair cancelled event
    REQUEST_DELEGATED = "D", // D = User is delegating request; sent to Chair
    REFRESH_REQUESTED = "E",  // E = Participant would like fresh copy of event. Notice is refreshed info from Chair or Update info from Chair.
    // When participant is requesting info, the $CSFlags contains ‘r’. When Chair is responding to request, the $CSFlags contains ‘u’.
    // If Chair is merely sending an update, $CSFlags will not contain either of these flags.
    REQUEST_COMPLETED = "F",  // F = User has completed request
    ADD_EVENT_REQUESTED = "G", // G = User wants to add event to calendar (may not be stored on disk, only in memory use.)
    USER_DELETED = "H", // H = User is deleting event
    INVITATION_REQUEST = "I", // I = Invitation request
    COUNTER_PROPOSAL_DECLINED = "J", // J = Chair declines a counter-proposal request
    UPDATE_INFO = "K", // K = Chair is sending updated info to all invitees
    REQUEST_DELEGATED_DELEGEE = "L", // L = User is delegating request; Notice is sent to delegee
    EVENT_CONFIRMED = "N", // N = Event is being confirmed by Chair
    USER_TENTATIVELY_ACCEPTED = "P", // P = User has tentatively accepted the invitation
    USER_DECLINED = "R", // R = User declined the invitation
    STATUS_UPDATE = "S", // S = Status update from Chair
    COUNTER_PROPOSAL_REQUEST = "T", // T = User is counter-proposing request
    EVENT_RESCHEDULED = "U", // U = Chair has rescheduled the event
    WAIT_FOR_REPLY = "W", // W = Waiting for reply from user
    EXTENDED_NOTICETYPE = "X", // X = Placeholder for "Extended NoticeType"; may not be in actual use.
    ROOM_REMOVED = "Y", // Y = Chair wants to remove rooms/resources
    USER_REMOVED = "Z" // Z = User has been removed (may not be stored on disk, only in memory use.)
}

/**
 * Constants for PIM label types. The values must match the value for "Type" in a Keep Label object. 
 */
export enum PimLabelTypes {
    CALENDAR = "Calendar",
    MAIL = "Mail",
    TASKS = "Tasks",
    JOURNAL = "Journal",
    CONTACTS = "Contacts"
}

/**
 * Constants for PIM label DesignTypes.  These are used on Keep requests for creating labels.  Not that there
 * is not one for calendar as these are only used for creating a label and we create calendars with a different
 * API.
 */
export enum PimLabelDesignTypes {
    CONTACTS = "contacts",
    TASKS = "tasks",
    JOURNAL = "journal",
    MAIL = "mail"
}

/**
 * Contents of results for certain Keep Pim APIs when creating, updating, or deleting items.
 */
export interface KeepPimBaseResults {
    statusText?: string; // "OK" if successful. 
    status: number; // Completion code. 200 for success.
    message: string; // Results messages. Informational only. 
    unid?: string; // Unid of the Keep Pim item if successful.
}

/**
 * Priority settings for a Task
 */
export enum PimTaskPriority {
    NONE,
    HIGH,
    MEDIUM,
    LOW
}

/**
 * Progress settings for a Task
 */
 export enum PimTaskProgress {
    NEEDS_ACTION = "needs-action",
    IN_PROCESS = "in-process",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}

/**
 * Keys in the address objects returned by the PimContact class.
 */
export enum ContactAddressKey {
    Street = "Street",
    State = "State",
    City = "City",
    PostalCode = "PostalCode",
    CountryOrRegion = "Country"
}

/**
 * Type with values Person / group
 */
export enum ContactType {
    Group = "Group",
    Person = "Person"
}

/**
 * Represents a contact returned fro the Keep PIM people api. 
 */
export class PimAddress {
    Street: string | undefined;
    City: string | undefined;
    State: string | undefined;
    PostalCode: string | undefined;
    Country: string | undefined;

    isEmpty(): boolean {
        if (this.Street || this.City || this.State || this.PostalCode || this.Country) {
            return false;
        }
        return true;
    }
}
/**
 * Constants for Message DeliveryReport Values
 */
export enum PimDeliveryReportType {
    NONE = "N",  // No delivery receipt
    ON_FAILURE = "B",  // Report only when there is a delivery failure
    CONFIRM = "C", // Confirm Delivery
    TRACE = "T"  // Trace entire path
}

/**
 * Response options for a calendar or invitation
 */
 export enum PimParticipationStatus {
    NEEDS_ACTION = "needs-action",
    ACCEPTED = "accepted",
    DECLINED = "declined",
    TENTATIVE = "tentative",
    DELEGATED = "delegated",
    COUNTER = "counter"
}

export enum PimDelegateAccess {
    READ = 'READ',
    DELETE = 'DELETE',
    CREATE = 'CREATE',
    UPDATE =  'UPDATE'
}