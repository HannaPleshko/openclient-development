import { PimCalendarItem, PimTask } from '../../../internal';
import { getTrimmedISODate } from '../../../utils';
import { KeepPimConstants, PimItemFormat } from '../KeepPimConstants';
import { PimLabel, PimContact, PimItem, PimMessage, PimNote, 
    PimThread } from '../PimItemInterfaces';

/**
 * Base class for a PIM object returned from the Keep PIM api.  
 */
export abstract class PimItemJmap implements PimItem {

    protected jmapObject: any = undefined;

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
    
    /**
     * Create a Pim object from Keep API data.  
     * @param pimObject The object returned from the Keep API.
     * @param format The format of the object. PimItemFormat.PRIMITIVE if the  object contains "$nnn" fields or PimItemFormat.DOCUMENT if the object does not contain "$nnn" fields (usually when document=true is used on the API). 
     */
    constructor(jmapObject: any, format?: PimItemFormat, viewname?: string) {
        this.jmapObject = {};
        Object.assign(this.jmapObject, jmapObject);
        if (!this.view && viewname) {
            this.view = viewname;
        }
    }

    /**
     * Returns the unique id for the item.
     */
    get unid(): string {
        return this.jmapObject.uid;
    }

    /**
     * Set the unique id for the item.
     */
    set unid(unid: string) {
        this.jmapObject.uid = unid;
    }

    get noteId(): number {
        return this.getAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_NOTE_ID) ?? 0;
    }

    set noteId(noteId: number) {
        this.setAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_NOTE_ID, noteId);
    }

    /**
     * Returns the date the item was created.
     */
    get createdDate(): Date | undefined {
        if (this.jmapObject.created && typeof(this.jmapObject.created) === 'string') {
            return new Date(this.jmapObject.created);
        }

        return undefined;
    }

    /**
     * Set the created date for the item. 
     */
    set createdDate(created: Date | undefined) {
        this.jmapObject.created = created ? getTrimmedISODate(created) : undefined;
    }

    /**
     * Returns the last updated date for the item. 
     */
    get lastModifiedDate(): Date | undefined {
        if (this.jmapObject.updated && typeof(this.jmapObject.updated) === 'string') {
            return new Date(this.jmapObject.updated);
        }
        return undefined;
    }

    /**
     * Set the last updated date for the item. 
     */
    set lastModifiedDate(modified: Date | undefined) {
        this.jmapObject.updated = modified ? getTrimmedISODate(modified) : undefined;
    }

    /**
     * Returns true if the item is marked confidential.
     */
    get isConfidential(): boolean {
        return this.isPrivate;
    }

    /**
     * Sets the confidentiality of the Item
     */
    set isConfidential(confidential: boolean) {
        this.isPrivate = confidential;
    }

    /**
     * Returns the view for this item
     */
    get view(): string {
        return this.getAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_VIEW) ?? "";
    }

    /**
     * Sets the view for this item
     */
     set view(viewName: string) {
        this.setAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_VIEW, viewName);
    }

    /**
     * Returns the parent folder ids for the item
     */
    get parentFolderIds(): string[] | undefined {
        if (this.jmapObject.referenceFolder) {
            if (!Array.isArray(this.jmapObject.referenceFolder)) {
                return typeof (this.jmapObject.referenceFolder) === 'string' ? [this.jmapObject.referenceFolder] : undefined;
            }
            return this.jmapObject.referenceFolder.length > 0 
                ? (typeof(this.jmapObject.referenceFolder[0]) === 'string' ? this.jmapObject.referenceFolder : undefined) 
                : this.jmapObject.referenceFolder;
        }
        return undefined;
    }

    /**
     * Set the parent folder ids for the item. 
     */
    set parentFolderIds(ids: string[] | undefined) {
        this.jmapObject.referenceFolder = ids;
    }


    /**
     * Returns the description of the task. 
     */
     get description(): string {
        return this.jmapObject.description ?? "";
    }

    /**
     * Sets the description of the task. 
     */
    set description(description: string) {
        this.jmapObject.description = description;
    }
    
    /**
     * Returns the body of the item. An empty string will be returned if there is no body. 
     */
    get body(): string {
        return this.description ?? '';
    }

    set body(body: string) {
        this.description = body;
    }

    get bodyType(): string | undefined {
        return this.getAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_BODY_TYPE) ?? undefined;  // Don't return null
        
    }

    set bodyType(type: string | undefined) {
        if (type) {
            this.setAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_BODY_TYPE, type);
        } else {
            this.deleteAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_BODY_TYPE);
        }
    }

    /**
     * Returns the title of the item. 
     */
    get title(): string {
        return this.jmapObject.title ?? '';
    }

    /**
     * Sets the title of the task. 
     */
    set title(title: string) {
        this.jmapObject.title = title;
    }

    get subject(): string | undefined {
        return this.title;
    }

    set subject(subject: string | undefined) {
        this.title = subject ?? '';
    }

    /**
    * Returns the string in base64 format. 
    */
    get mimeUpdate(): string | undefined {
        return this.mimeUpdate;
    }

    set mimeUpdate(mimeUpdate: string | undefined) {
        this.mimeUpdate = mimeUpdate;
    }

    /**
     * Returns if the item has been marked as read. 
     */
    get isRead(): boolean {
        if (this.jmapObject.unread === undefined) {
            return false;
        }

        return (this.jmapObject.unread === false || this.jmapObject.unread === 0);
    }

    set isRead(read: boolean) {
        this.jmapObject.unread = !read;
    }
    /**
     * Return true if the item is marked private
     */
    get isPrivate(): boolean {
        return (this.jmapObject.privacy === 'private' || this.jmapObject.privacy === 'secret'); 
    }

    set isPrivate(value: boolean) {
        this.jmapObject.privacy = value ? 'private' : 'public';
    }

    /**
     * Returns the categories assigned to the item. And empty array will be returned if no categories assigned. 
     */
    get categories(): string[] {
        const cats = this.jmapObject.categories;
        if (cats) {
            return Object.keys(cats).filter(key => cats[key] === true);
        }
        return [];
    }

    /**
     * Set the categories assigned to the contact. Set to an empty array if no categories assigned. 
     */
    set categories(categories: string[]) {
        if (categories) {
            const cats: any = {};
            for (const c of categories) {
                cats[c] = true;
            }
            this.jmapObject.categories = cats;
        } else {
            this.jmapObject.categories = undefined;
        }
    }

    /**
     * Return the attachments associated with this item. The values are unid of attachments.
     */
    get attachments(): string[] {
        const atts = this.jmapObject.attachments;
        if (atts && Array.isArray(atts)) {
            const attNames: string[] = [];
            for (const att of atts) {
                if (att.name !== undefined && att.name !== null) {
                    attNames.push(att.name);
                }
            }
            return attNames;
        }
        return [];
    }

    /**
     * Set the attachments associated with this item. Set to an empty array if no attachements.
     */
    set attachments(attachments: string[]) {
        const jAttachments: any[] = [];
        for (const att of attachments) {
            jAttachments.push({name: att});
        }
        this.jmapObject.attachments = jAttachments;
    }

    /**
     * Returns the extended properties for the item.
     */
    get extendedProperties(): any[] {
        const rtn: any[] = [];
        const additionalProps = this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS];
        if (additionalProps) {
            Object.keys(additionalProps).forEach(key => {
                if (key.startsWith(KeepPimConstants.EXT_PROPERTY_PREFIX)) {
                    const value = this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS][key];
                    if (typeof value === "object" && value !== null) {
                        rtn.push(this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS][key]);
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
        if (!this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS]) {
            this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS] = {};
        }
        this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS][key] = Object.assign({}, property);
    }

    /**
     * Update an extended property for the item.
     * @param identifiers A list of identifiers and their values for a matching extended property. 
     * @param newProperty The new value of the property
     */
    public updateExtendedProperty(identifiers: any, newProperty: any): void {
        const matchKey = this.findExtendedPropertyKey(identifiers);
        if (matchKey) {
            this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS][matchKey] = newProperty;
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
        return (matchKey === undefined) ? undefined : Object.assign({}, this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS][matchKey]);
    }

    /**
     * Delete an extended property in this Pim item.  Note that this does not remove the key, but sets
     * the value to null so that the field is removed when sent to Keep.
     * @param identifiers A list of identifiers and their values for a matching extended property
     */
    public deleteExtendedProperty(identifiers: any): void {
        const matchKey = this.findExtendedPropertyKey(identifiers);
        if (matchKey && this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS]) {
            this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS][matchKey] = null;
        }
    }

    /**
     * Returns the key of an extended property. 
     * @param identifiers A list of identifiers and their values for a matching extended property. 
     * @returns The key in this.props that contains the extended property. 
     */
    protected findExtendedPropertyKey(identifiers: any): string | undefined {
        const extPropertyKeys = Object.keys(this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS] ?? {}).filter(key => { return key.startsWith(KeepPimConstants.EXT_PROPERTY_PREFIX) });

        return extPropertyKeys.find(key => {
            const value = this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS][key];
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
    }

    /**
     * Returns an additional property set for the item. 
     * @param key The key for the property to return.
     * @returns The value of the proeperty or undefined if it is not set. 
     */
    public getAdditionalProperty(key: string): any | undefined {
        const savedKey = key.startsWith(KeepPimConstants.EXT_ADDITIONAL_PREFIX) ? key : `${KeepPimConstants.EXT_ADDITIONAL_PREFIX}${key}`;
        if (!this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS]) {
            return undefined;
        }
        return this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS][savedKey];
    }

    /**
     * Delete an additional property set for the item.  This will set the property's value to null so that
     * Keep will remove the setting if this object is send in an update.
     * @param key The key for the property to delete.
     */
    public deleteAdditionalProperty(key: string): void {
        const savedKey = key.startsWith(KeepPimConstants.EXT_ADDITIONAL_PREFIX) ? key : `${KeepPimConstants.EXT_ADDITIONAL_PREFIX}${key}`;
        if (this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS]) {
            this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS][savedKey] = null;
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
        if (this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS]) {
            delete this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS][savedKey];
        }
    }

    /**
     * Set an additional property for the item. Use this to set additional properiies not defined on the Keep API. 
     * @param key The key for the property to set. 
     * @param value The value of the property. 
     */
    public setAdditionalProperty(key: string, value: any): void {
        const saveKey = key.startsWith(KeepPimConstants.EXT_ADDITIONAL_PREFIX) ? key : `${KeepPimConstants.EXT_ADDITIONAL_PREFIX}${key}`; // Add a prefix to make it unique
        if (!this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS]) {
            this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS] = {};
        }
        this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS][saveKey] = value;
    }

    /**
     * Returns the next index number to use when adding an extended property.
     */
    protected getNextExtPropertyIndex(): number {
        let extIndex = 0;

        if (this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS]) {
            const keys = Object.keys(this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS]);
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
                    const value: any = this.jmapObject[KeepPimConstants.ADDITIONAL_FIELDS][key];
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
     * Returns a structure that can be used to create or update a PIM item on the Keep API. 
     * @returns An object to use when creating or updating a PIM item. 
     */
    public toPimStructure(): object {
        return this.jmapObject;
    }
}

