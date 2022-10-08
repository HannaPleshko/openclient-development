import { PimItemClassic } from './PimItemClassic';
import { KeepPimConstants, PimItemFormat, PimLabelTypes } from './KeepPimConstants';
import { Logger } from '../../utils';
import { PimLabel } from './PimItemInterfaces';

/**
 * Represents a label returned from the Keep-PIM labels API. 
 */
export class PimLabelClassic extends PimItemClassic implements PimLabel {

  /**
   * Constructor for base PimItem class.
   * @param labelObject Object received from Keep from which the PimItem is created.
   */
  constructor(labelObject: any) {
    // We only have one source for labels, so just hard code DOCUMENT format.
    super(labelObject, PimItemFormat.DOCUMENT);
  }

  /**
   * Return true if this object implements the PimLabel interface
   * @return True if the item implements the PimLabel protocol
   */
      isPimLabel(): this is PimLabel {
      return true;
  }

  /**
   * This is a helper function that will create a PimLabel object from a JSON string received from the Keep API.
   * @param jsonString JSON content returned by the Keep API.
   * @returns A PimLabel object built from the passed in JSON.
   */
  static fromJson(jsonString: string): PimLabelClassic {
    return new PimLabelClassic(JSON.parse(jsonString));
  }

  /**
   * Get the unid of the label to use as a folder id. 
   * @returns The unid of the label. 
   */
  get folderId(): string {
    return this.props.folderId;
  }

  /**
   * Sets the folder id. 
   * @param id The id of the label/folder.
   */
  set folderId(id: string) {
    this.props.folderId = id;
  }

  /**
   * Get a human readable name for the label that is suitable for displaying in a UI. 
   * @returns The human readable name. 
   */
  get displayName(): string {
    return this.props.displayName;
  }

  /**
   * Sets the name of the label.
   * @param text The name.
   */
  set displayName(text: string) {
    this.props.displayName = text;
  }

  /**
   * Get the name of the view.
   * @returns The name of the view.
   */
  get view(): string {
    return this.props.view;
  }

  /**
   * Sets the name of the view for a label.
   * @param name The name to set.
   */
  set view(name: string) {
    this.props.view = name;
  }

  /**
   * Get the number of documents in the label.
   * @returns the number of documents in the label.
   */
  get documentCount(): number {
    return this.props.documentCount ?? 0;
  }

  /**
   * Sets the number of documents associated with the label.
   * @param count The document count.
   */
  set documentCount(count: number) {
    this.props.documentCount = count;
  }

  /**
   * Get the number of unread documents in the label.
   * @returns the number of unread documents in the label.
   */
  get unreadCount(): number {
    return this.props.unreadCount ?? 0;
  }

  /**
   * Sets the number of unread documents associated with the label.
   * @param count The unread count.
   */
  set unreadCount(count: number) {
    this.props.unreadCount = count;
  }

  /**
  * Get the type of the label. 
  * @returns The type of label.  We default to MAIL if none is set.
  */
  get type(): PimLabelTypes {
    return this.props.type ?? PimLabelTypes.MAIL;
  }

  /**
   * Sets the type of the label, indicating the type of items it is associated with.
   * @param type The type of the label.
   */
  set type(type: PimLabelTypes) {
    this.props.type = type;
  }

  /**
    * Returns the parent folder id for the item.  Labels can only have a single parent
    */
  get parentFolderId(): string | undefined {
      if (this.parentFolderIds) {
          if (Array.isArray(this.parentFolderIds)) {
            return (this.parentFolderIds.length > 0) ? this.parentFolderIds[0] : undefined;
          } else {
            return this.parentFolderIds;
          }
      }
      return undefined;
  }

  /**
   * Set the parent folder id for the item. Labels can only have a single parent
   */
  set parentFolderId(id: string | undefined) {
    if (id) {
      if (!Array.isArray(id)) {
        this.parentFolderIds = [id];
      } else {
        this.parentFolderIds = id;
      }
    } else {
      this.parentFolderIds = undefined;
    }
  }

  /**
   * Return calendar name to use on a Keep API request if this is a calendar label.
   * @returns The name of the calendar if this is a calendar label or undefined if it is not a calendar label. 
   */
   get calendarName(): string | undefined {

    if (this.view === KeepPimConstants.CALENDAR) {
      return KeepPimConstants.DEFAULT_CALENDAR_NAME; // Name of the default calendar
    }
    else if (this.view.startsWith('(NotesCalendar)\\')) { // TODO: Verify this is correct when LABS-530 is resolved
      return this.displayName; // The display name is the calendar name
    }

    return undefined; 
  }

  /**
   * Internal function to populate this with data from Keep.
   * @param labelObject Object of key value pairs from Keep describing the label.
   * @returns this after populating with data.
   */
  protected itemFromDocument(labelObject: any): PimLabelClassic {
    super.itemFromDocument(labelObject);

    this.view = labelObject['View'];
    this.folderId = labelObject['FolderId'];
    this.unid = this.folderId;
    this.documentCount = labelObject['DocumentCount'];
    this.unreadCount = labelObject['UnreadCount'];
    this.displayName = labelObject['DisplayName'];

    // Only allow valid strings for the label type
    let labelType = labelObject['Type'];
    if (labelType) {
      if (Object.values(PimLabelTypes).includes(labelType)) {
        // a valid label type
        this.type = labelType;
      } else {
        labelType = undefined;
        Logger.getInstance().warn(`Unrecognized PIM Label type: ${labelType}`);
      }
    }

    // Work around for LABS-1874
    if (this.view === "(Birthdays & Anniversaries)") {
      this.type = PimLabelTypes.CONTACTS; 
    }

    if (labelType === undefined && this.view !== undefined) {
      this.type = this.typeFromView(this.view);
    }

    // Keep will set the parent id to the folder id for top level folders
    const parentId = labelObject['ParentId'];
    if (parentId !== this.folderId) {
      this.parentFolderId = parentId;
    }

    return this;
  }

  /**
      * Returns a structure that can be used to create a label on the Keep API. 
      * @returns An object to use when creating a task entry on the Keep API. 
      */
  public toPimStructure(): object {
    const rtn: any = super.toPimStructure();

    rtn["ParentId"] = this.parentFolderId;
    rtn["DisplayName"] = this.displayName;

    return rtn;
  }

  /**
   * Returns a label type based on the labels view. Only call this if there is no Type returned for a Keep Label object. 
   * @param view The label's view
   * @returns The label type 
   */
  protected typeFromView(view: string): PimLabelTypes {

    if (view === KeepPimConstants.CALENDAR || view.startsWith('(NotesCalendar)\\')) { // TODO: Verify this when LABS-530 is complete
      return PimLabelTypes.CALENDAR;
    }
    else if (view === KeepPimConstants.CONTACTS || view.startsWith('(NotesContacts)\\')) {
      return PimLabelTypes.CONTACTS;
    }
    else if (view === KeepPimConstants.TASKS || view.startsWith('(NotesTasks)\\')) {
      return PimLabelTypes.TASKS;
    }
    else if (view === KeepPimConstants.JOURNAL || view.startsWith('(NotesJournal)\\')) {
      return PimLabelTypes.JOURNAL;
    }

    return PimLabelTypes.MAIL; // Everything else must be a mail folder

  }

}