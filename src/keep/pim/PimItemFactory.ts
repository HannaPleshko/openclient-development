import { PimCalendarItem, PimTask } from "../../internal";
import { PimItemFormat } from "./KeepPimConstants";
import { PimContactClassic } from "./PimContactClassic";
import { PimThread, PimNote, PimMessage, PimContact, PimLabel } from './PimItemInterfaces';
import { PimLabelClassic } from "./PimLabelClassic";
import { PimMessageClassic } from "./PimMessageClassic";
import { PimNoteClassic } from "./PimNoteClassic";
import { PimThreadClassic } from "./PimThreadClassic";
export class PimItemFactory {

    /**
     * Create and return an object that implements the PimLabel protocol to represent a Domino label/folder.
     * @param labelObject Object used to populate the label's properties.
     * @param format The format of the passed in labelObject. TODO: Not required and should be removed 
     * @returns A new instance of an object that implements the PimLabel interface, populated with data from labelObject.
     */
    static newPimLabel(labelObject: any, format = PimItemFormat.DOCUMENT): PimLabel {
        return new PimLabelClassic(labelObject);
    }

    /**
     * Create and return an object that implements the PimMessage protocol to represent a Domino message.
     * @param messageObject Object used to populate the message's properties.
     * @param format The format of the passed in messageObject.
     * @param viewname The name of the Domino view to which the message belongs.
     * @returns A new instance of an object that implements the PimMessage interface, populated with data from messageObject.
     */
    static newPimMessage(messageObject: any, format: PimItemFormat = PimItemFormat.PRIMITIVE, viewname?: string): PimMessage {
        return new PimMessageClassic(messageObject, format, viewname);
    }

    /**
     * Create and return an object that implements the PimCalendarItem protocol to represent a Domino calendar item.
     * @param calItemObject Object used to populate the item's properties.
     * @param calName The name of the calendar owning this item
     * @param format No longer used.
     * @returns A new instance of an object that implements the PimCalendarItem interface, populated with data from calItemObject.
     */
    static newPimCalendarItem(calItemObject: any, calName: string, format?: PimItemFormat): PimCalendarItem {
        return new PimCalendarItem(calItemObject, calName);
    }

    /**
     * Create and return an object that implements the PimNote protocol to represent a Domino note (journal entry).
     * @param noteObject Object used to populate the note's properties.
     * @param format The format of the passed in noteObject.
     * @param viewname The name of the Domino view to which the note belongs.
     * @returns A new instance of an object that implements the PimNote interface, populated with data from noteObject.
     */
    static newPimNote(noteObject: any, format: PimItemFormat = PimItemFormat.PRIMITIVE, viewname?: string): PimNote {
        return new PimNoteClassic(noteObject, format, viewname);
    }

    /**
     * Create and return an object that implements the PimContact protocol to represent a Domino contact.
     * @param contactObject Object used to populate the contact's properties.
     * @param format The format of the passed in contactObject.
     * @param viewname The name of the Domino view to which the contact belongs.
     * @returns A new instance of an object that implements the PimContact interface, populated with data from contactObject.
     */
    static newPimContact(contactObject: any, format: PimItemFormat = PimItemFormat.PRIMITIVE, viewname?: string): PimContact {
        return new PimContactClassic(contactObject, format, viewname);
    }

    /**
     * Create and return an object that implements the PimTask protocol to represent a Domino task.
     * @param taskObject Object used to populate the task's properties.
     * @param format No longer used.
     * @param viewname The name of the Domino view to which the task belongs.
     * @returns A new instance of an object that implements the PimTask interface, populated with data from taskObject.
     */
    static newPimTask(taskObject?: any, format: PimItemFormat = PimItemFormat.PRIMITIVE, viewname?: string): PimTask {
        return new PimTask(taskObject, format, viewname);
    }

    /**
     * Create and return an object that implements the PimThread protocol to represent a Domino thread.
     * @param threadObject Object used to populate the thread's properties.
     * @param format The format of the passed in threadObject.
     * @returns A new instance of an object that implements the PimThread interface, populated with data from threadObject.
     */
    public static newPimThread(threadObject: any, format: PimItemFormat): PimThread {
        return new PimThreadClassic(threadObject, format);
    }
}