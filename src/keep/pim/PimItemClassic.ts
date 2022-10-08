import { KeepPimConstants, PimItemFormat } from './KeepPimConstants';
import { PimLabel, PimContact, PimItem, PimMessage, PimNote, 
    PimThread } from './PimItemInterfaces';
import { parseValue, convertToListObject } from '../../utils';
import { PimCalendarItem, PimTask } from '../../internal';

/**
 * Base class for a PIM object returned from the Keep PIM api.  
 */
export class PimItemClassic implements PimItem {

    /**
     * Return true if this object implements the PimLabel interface
     * @return True if the item implements the PimLabel protocol
     */
     isPimLabel(): this is PimLabel {
        return false;
    }

    /**
     * Return true if this object implements the PimTask interface
     * @return True if the item implements the PimTask protocol
     */
    isPimTask(): this is PimTask {
        return false;
    }
    
    /**
     * Return true if this object implements the PimMessage interface
     * @return True if the item implements the PimMessage protocol
     */
    isPimMessage(): this is PimMessage {
        return false;
    }

    /**
     * Return true if this object implements the PimContact interface
     * @return True if the item implements the PimContact protocol
     */
    isPimContact(): this is PimContact {
        return false;
    }

    /**
     * Return true if this object implements the PimNote interface
     * @return True if the item implements the PimNote protocol
     */
    isPimNote(): this is PimNote {
        return false;
    }

    /**
     * Return true if this object implements the PimCalendarItem interface
     * @return True if the item implements the PimCalendarItem protocol
     */
    isPimCalendarItem(): this is PimCalendarItem {
        return false;
    }

    /**
     * Return true if this object implements the PimTask interface
     * @return True if the item implements the PimTask protocol
     */
    isPimThread(): this is PimThread {
        return false;
    }
    
    protected props: any = {};

    /**
     * Create a Pim object from Keep API data.  
     * @param pimObject The object returned from the Keep API.
     * @param format The format of the object. PimItemFormat.PRIMITIVE if the  object contains "$nnn" fields or PimItemFormat.DOCUMENT if the object does not contain "$nnn" fields (usually when document=true is used on the API). 
     */
    constructor(pimObject: any, format: PimItemFormat = PimItemFormat.PRIMITIVE, viewname?: string) {
        this.props.view = (pimObject ? pimObject['viewname'] : undefined) ?? viewname;
        return (format === PimItemFormat.DOCUMENT) ? this.itemFromDocument(pimObject) : this.itemFromPrimitive(pimObject);
    }

    /**
     * Returns the unique id for the item.
     */
    get unid(): string {
        return this.props.unid;
    }

    /**
     * Set the unique id for the item.
     */
    set unid(unid: string) {
        this.props.unid = unid;
    }

    get noteId(): number {
        return this.props.noteid ?? 0;
    }

    set noteId(noteId: number) {
        this.props.noteid = noteId;
    }

    /**
     * Returns the date the item was created.
     */
    get createdDate(): Date | undefined {
        return this.props.createdDate;
    }

    /**
     * Set the created date for the item. 
     */
    set createdDate(created: Date | undefined) {
        this.props.createdDate = created;
    }

    /**
     * Returns the last updated date for the item. 
     */
    get lastModifiedDate(): Date | undefined {
        return this.props.lastModifiedDate;
    }

    /**
     * Set the last updated date for the item. 
     */
    set lastModifiedDate(modified: Date | undefined) {
        this.props.lastModifiedDate = modified;
    }

    /**
     * Returns true if the item is marked confidential.
     */
    get isConfidential(): boolean {
        return this.props.confidential ?? false;
    }

    /**
     * Sets the confidentiality of the Item
     */

    set isConfidential(confidential: boolean) {
        this.props.confidential = confidential;
    }
    /**
     * Returns the view for this item
     */
    get view(): string {
        return this.props.view ?? '';
    }

    /**
     * Returns the parent folder ids for the item
     */
    get parentFolderIds(): string[] | undefined {
        if (this.props.parentFolderIds) {
            if (!Array.isArray(this.props.parentFolderIds)) {
                return [this.props.parentFolderIds];
            }
            return this.props.parentFolderIds;
        }
        return undefined;
    }

    /**
     * Set the parent folder ids for the item. 
     */
    set parentFolderIds(ids: string[] | undefined) {
        this.props.parentFolderIds = ids;
    }

    /**
     * Returns the body of the item. An empty string will be returned if there is no body. 
     */
    get body(): string {
        return this.props.body ?? "";
    }

    set body(body: string) {
        this.props.body = body;
    }

    get bodyType(): string | undefined {
        return this.props.bodyType;
    }

    set bodyType(type: string | undefined) {
        this.props.bodyType = type;
    }

    get subject(): string | undefined {
        return this.props.subject ?? '';
    }

    set subject(subject: string | undefined) {
        this.props.subject = subject;
    }

    /**
    * Returns the string in base64 format. 
    */
    get mimeUpdate(): string | undefined {
        return this.props.mimeUpdate;
    }

    set mimeUpdate(mimeUpdate: string | undefined) {
        this.props.mimeUpdate = mimeUpdate;
    }

    /**
     * Returns if the item has been marked as read. 
     */
    get isRead(): boolean {
        if (this.props.unread === undefined) {
            return false;
        }

        return (this.props.unread === false || this.props.unread === 0);
    }

    set isRead(read: boolean) {
        this.props.unread = !read;
    }
    /**
     * Return true if the item is marked private
     */
    get isPrivate(): boolean {
        return this.props.private ?? true;
    }

    set isPrivate(value: boolean) {
        this.props.private = value;
    }

    /**
     * Returns the categories assigned to the item. And empty array will be returned if no categories assigned. 
     */
    get categories(): string[] {
        return this.props.categories ?? [];
    }

    /**
     * Set the categories assigned to the contact. Set to an empty array if no categories assigned. 
     */
    set categories(categories: string[]) {
        this.props.categories = categories;
    }

    /**
     * Return the attachments associated with this item. The values are unid of attachments.
     */
    get attachments(): string[] {
        return this.props.attachments ?? [];
    }

    /**
     * Set the attachments associated with this item. Set to an empty array if no attachements.
     */
    set attachments(attachments: string[]) {
        this.props.attachments = attachments;
    }

    /**
     * Returns the extended properties for the item.
     */
    get extendedProperties(): any[] {
        const rtn: any[] = [];
        const additionalProps = this.props[KeepPimConstants.ADDITIONAL_FIELDS];
        if (additionalProps) {
            Object.keys(additionalProps).forEach(key => {
                if (key.startsWith(KeepPimConstants.EXT_PROPERTY_PREFIX)) {
                    const value = this.props[KeepPimConstants.ADDITIONAL_FIELDS][key];
                    if (typeof value === "object" && value !== null) {
                        rtn.push(this.props[KeepPimConstants.ADDITIONAL_FIELDS][key]);
                    }
                }
            });
        }
        return rtn;
    }

    /**
     * Set extended properties for the item.
     * @param properties The exteneded properties. Each item in the array is an exteneded property object.
     */
    set extendedProperties(properties: any[]) {
        properties.forEach(property => this.addExtendedProperty(property));
    }

    /**
     * Add a single extened proeprty to the item. 
     * @param property The property to add
     */
    public addExtendedProperty(property: any): void {
        const index = this.getNextExtPropertyIndex();
        const key = `${KeepPimConstants.EXT_PROPERTY_PREFIX}${index}`;
        if (!this.props[KeepPimConstants.ADDITIONAL_FIELDS]) {
            this.props[KeepPimConstants.ADDITIONAL_FIELDS] = {};
        }
        this.props[KeepPimConstants.ADDITIONAL_FIELDS][key] = Object.assign({}, property);
    }

    /**
     * Update an extended property for the item.
     * @param identifiers A list of identifiers and their values for a matching extended property. 
     * @param newProperty The new value of the property
     */
    public updateExtendedProperty(identifiers: any, newProperty: any): void {
        const matchKey = this.findExtendedPropertyKey(identifiers);
        if (matchKey) {
            this.props[KeepPimConstants.ADDITIONAL_FIELDS][matchKey] = newProperty;
        }
        else {
            this.addExtendedProperty(newProperty);
        }
    }

    /**
     * Find an extended property in this Pim item.
     * @param identifiers A list of identifiers and their values for a matching extended property. 
     * @returns An object containing the extended property data or undefined if the extended property does not exist.
     */
    public findExtendedProperty(identifiers: any): any | undefined {
        const matchKey = this.findExtendedPropertyKey(identifiers);
        return (matchKey === undefined) ? undefined : Object.assign({}, this.props[KeepPimConstants.ADDITIONAL_FIELDS][matchKey]);
    }

    /**
     * Delete an extended property in this Pim item.  Note that this does not remove the key, but sets
     * the value to null so that the field is removed when sent to Keep.
     * @param identifiers A list of identifiers and their values for a matching extended property
     */
    public deleteExtendedProperty(identifiers: any): void {
        const matchKey = this.findExtendedPropertyKey(identifiers);
        if (matchKey && this.props[KeepPimConstants.ADDITIONAL_FIELDS]) {
            this.props[KeepPimConstants.ADDITIONAL_FIELDS][matchKey] = null;
        }
    }

    /**
     * Returns the key of an extended property. 
     * @param identifiers A list of identifiers and their values for a matching extended property. 
     * @returns The key in this.props that contains the extended property. 
     */
    protected findExtendedPropertyKey(identifiers: any): string | undefined {
        const extPropertyKeys = Object.keys(this.props[KeepPimConstants.ADDITIONAL_FIELDS] ?? {}).filter(key => { return key.startsWith(KeepPimConstants.EXT_PROPERTY_PREFIX) });

        const matchKey = extPropertyKeys.find(key => {
            const value = this.props[KeepPimConstants.ADDITIONAL_FIELDS][key];
            if (typeof value === "object" && value !== null) {
                let match = true;
                for (const idKeys in identifiers) {
                    if (value[idKeys] !== identifiers[idKeys]) {
                        match = false;
                    }
                }

                return match;
            }
            return false;
        });

        return matchKey;
    }

    /**
     * Returns an additional property set for the item. 
     * @param key The key for the property to return.
     * @returns The value of the proeperty or undefined if it is not set. 
     */
    public getAdditionalProperty(key: string): any | undefined {
        const savedKey = key.startsWith(KeepPimConstants.EXT_ADDITIONAL_PREFIX) ? key : `${KeepPimConstants.EXT_ADDITIONAL_PREFIX}${key}`;
        if (!this.props[KeepPimConstants.ADDITIONAL_FIELDS]) {
            return undefined;
        }
        return this.props[KeepPimConstants.ADDITIONAL_FIELDS][savedKey];
    }

    /**
     * Delete an additional property set for the item.  This will set the property's value to null so that
     * Keep will remove the setting if this object is send in an update.
     * @param key The key for the property to delete.
     */
    public deleteAdditionalProperty(key: string): void {
        const savedKey = key.startsWith(KeepPimConstants.EXT_ADDITIONAL_PREFIX) ? key : `${KeepPimConstants.EXT_ADDITIONAL_PREFIX}${key}`;
        if (this.props[KeepPimConstants.ADDITIONAL_FIELDS]) {
            this.props[KeepPimConstants.ADDITIONAL_FIELDS][savedKey] = null;
        }
    }

    /**
     * Remove an additional property from the object's AdditionalProperties.  This will remove the
     * property from this objects internal representation.  Note that Keep will NOT remove the value from the
     * object's AdditionalProperties if no value is sent in an update.
     * @param key The key of the property to remove
     */
    public removeAdditionalProperty(key: string): void {
        const savedKey = key.startsWith(KeepPimConstants.EXT_ADDITIONAL_PREFIX) ? key : `${KeepPimConstants.EXT_ADDITIONAL_PREFIX}${key}`;
        if (this.props[KeepPimConstants.ADDITIONAL_FIELDS]) {
            delete this.props[KeepPimConstants.ADDITIONAL_FIELDS][savedKey];
        }
    }

    /**
     * Set an additional property for the item. Use this to set additional properiies not defined on the Keep API. 
     * @param key The key for the property to set. 
     * @param value The value of the property. 
     */
    public setAdditionalProperty(key: string, value: any): void {
        const saveKey = key.startsWith(KeepPimConstants.EXT_ADDITIONAL_PREFIX) ? key : `${KeepPimConstants.EXT_ADDITIONAL_PREFIX}${key}`; // Add a prefix to make it unique
        if (!this.props[KeepPimConstants.ADDITIONAL_FIELDS]) {
            this.props[KeepPimConstants.ADDITIONAL_FIELDS] = {};
        }
        this.props[KeepPimConstants.ADDITIONAL_FIELDS][saveKey] = value;
    }

    /**
     * Returns the next index number to use when adding an extended property.
     */
    protected getNextExtPropertyIndex(): number {
        let extIndex = 0;

        if (this.props[KeepPimConstants.ADDITIONAL_FIELDS]) {
            const keys = Object.keys(this.props[KeepPimConstants.ADDITIONAL_FIELDS]);
            for (const key of keys) {
                if (key.startsWith(KeepPimConstants.EXT_PROPERTY_PREFIX)) {
                    const parts: string[] = key.split("_");
                    const last = parts.pop();
                    if (last === undefined) {
                        continue; 
                    }
                    const index = Number.parseInt(last);
                    if (isNaN(index)) {
                        continue;
                    }
                    const value: any = this.props[KeepPimConstants.ADDITIONAL_FIELDS][key];
                    if (typeof value !== "object") {
                        // Value has been remove, so reuse it. 
                        extIndex = index;
                        break;
                    }

                    if (index >= extIndex) {
                        extIndex = index + 1;
                    }
                }
            }
        }

        return extIndex;
    }

    /**
     * Use to create a PimItem from an object returned from the Keep API. Use this if the returned object does not contain "$nnn" fields. 
     * Subclasses must override this method. Common attributes, like unid, can be processed here and subclasses call super.itemForDocument. 
     * @param itemObject The object returned from the Keep API.
     */
    protected itemFromDocument(itemObject: any): PimItemClassic {

        if (!itemObject) {
            return this;
        }

        // Unique id
        let unid = parseValue("@unid", itemObject);
        if (unid === undefined) {
            unid = parseValue("ApptUNID", itemObject);
        }
        if (unid === undefined) {
            unid = parseValue("uid", itemObject);
        }

        if (unid) {
            this.props.unid = unid;
        }

        this.props.noteid = parseValue("@noteid", itemObject);  // "Note ID - unique for this replica, int",

        // Created date
        let date: string = parseValue("@created", itemObject);
        if (date) {
            this.props.createdDate = new Date(date);
        }

        date = parseValue("@lastmodified", itemObject);
        if (date) {
            this.props.lastModifiedDate = new Date(date);
        }

        // Public/Private setting
        let publicAccess = parseValue("$PublicAccess", itemObject) ?? parseValue("Public", itemObject); // old field
        if (!publicAccess) {
            const priv = parseValue("privacy", itemObject); // For jmap
            if (priv) {
                publicAccess = priv === 'public' ? '1' : '0';
            }
        }
        if (!publicAccess) {
            publicAccess = "1"; // Default to Public
        }
        this.props.private = (publicAccess === "1") ? false : true;

        let parents = parseValue("ParentFolder", itemObject);
        if (parents === undefined) {
            parents = parseValue("referenceFolder", itemObject); // jmap transition key
        }
        if (parents === undefined) {
            parents = parseValue("$FolderRef", itemObject); // Old key
        }
        if (parents === undefined) {
            parents = parseValue("@parentFolderUnid", itemObject); // Old key
        }
        if (parents !== undefined) {
            if (Array.isArray(parents)) {
                this.parentFolderIds = parents;
            } else if (typeof parents === 'string') {
                this.parentFolderIds = [parents];
            }
        }

        this.props.unread = itemObject["@unread"] ?? true;

        const attachments = parseValue("$FILES", itemObject);
        if (attachments && Array.isArray(attachments) && attachments.length > 0) {
            this.props.attachments = attachments;
        }

        // Parse out categories.
        const categories = parseValue("Categories", itemObject);
        if (categories && categories !== "Not Categorized") { // TODO: Should be blank or not included if none (LABS-1203).
            this.props.categories = convertToListObject(categories);  // TODO: Always be an array when LABS-1550 fixed
        }
        else {
            this.props.categories = [];
        }

        // Process extended and additional properties
        if (itemObject[KeepPimConstants.ADDITIONAL_FIELDS]) {
            Object.keys(itemObject[KeepPimConstants.ADDITIONAL_FIELDS]).forEach(key => {
                if (key.startsWith(KeepPimConstants.EXT_PROPERTY_PREFIX) ||
                    key.startsWith(KeepPimConstants.EXT_ADDITIONAL_PREFIX)) {
                    if (!this.props[KeepPimConstants.ADDITIONAL_FIELDS]) {
                        this.props[KeepPimConstants.ADDITIONAL_FIELDS] = {};
                    }
                    this.props[KeepPimConstants.ADDITIONAL_FIELDS][key] = itemObject[KeepPimConstants.ADDITIONAL_FIELDS][key];
                }
            });
        }

        return this;
    }

    /**
     * Use to create a PimItem from an object returned from the Keep API. Use this if the returned object contains "$nnn" fields. 
     * Subclasses must override this method. Common attributes, like unid, can be processed here and subclasses call super.itemForDocument. 
     * @param itemObject The object returned from the Keep API.
     */
    protected itemFromPrimitive(itemObject: any): PimItemClassic {

        if (!itemObject) {
            return this;
        }
        
        let unid = parseValue("@unid", itemObject);
        if (unid === undefined) {
            unid = parseValue("ApptUNID", itemObject);
        }
        if (unid === undefined) {
            unid = parseValue("uid", itemObject);
        }

        if (unid) {
            this.props.unid = unid;
        }

        this.props.noteid = parseValue("@noteid", itemObject);  // "Note ID - unique for this replica, int",

        return this;
    }

    /**
     * Returns a structure that can be used to create or update a PIM item on the Keep API. 
     * @returns An object to use when creating or updating a PIM item. 
     */
    public toPimStructure(): object {
        const rtn: any = {};

        // TODO: Always set to array when LABS-1550 fixed
        if (this.categories.length > 0) {
            rtn["Categories"] = this.categories.length === 1 ? this.categories[0] : this.categories;
        }

        // Add extended and additional properties
        if (this.props[KeepPimConstants.ADDITIONAL_FIELDS]) {
            Object.keys(this.props[KeepPimConstants.ADDITIONAL_FIELDS]).forEach(key => {
                if (key.startsWith(KeepPimConstants.EXT_PROPERTY_PREFIX) ||
                    key.startsWith(KeepPimConstants.EXT_ADDITIONAL_PREFIX)) {
                    // rtn[key] = this.props[key];

                    // Also add to additional properties for now....Need to account for deletes
                    if (!rtn[KeepPimConstants.ADDITIONAL_FIELDS]) {
                        rtn[KeepPimConstants.ADDITIONAL_FIELDS] = {};
                    }
                    rtn[KeepPimConstants.ADDITIONAL_FIELDS][key] = this.props[KeepPimConstants.ADDITIONAL_FIELDS][key];
                }
            });
        }

        // Using the field (this.props.unread) rather than the method because the method will return a boolean even if not set
        if (this.props.unread !== undefined) {
            rtn["@unread"] = this.props.unread === 1 || this.props.unread === true;
        }

        return rtn;
    }
}