import { parseValue, convertToListObject, Logger } from "../../utils";
import { ContactAddressKey, ContactType, PimAddress } from "./KeepPimConstants";
import { PimItemClassic } from './PimItemClassic';
import { PimContact } from "./PimItemInterfaces";

export class PimContactClassic extends PimItemClassic implements PimContact {

    /**
     * Return true if this object implements the PimContact interface
     * @return True if the item implements the PimContact protocol
     */
     isPimContact(): this is PimContact {
        return true;
    }

    /**
     * Returns true if this contact is a group, false if it represents a person. 
     */
    get isGroup(): boolean {
        return this.props.type === "Group"
    }

    /**
     * Comment to body
     */
    get comment(): string {
        return this.body;
    }

    set comment(aComment: string){
        this.body = aComment;
    }
    /**
     * Returns the type of the contact
     */
    get type(): ContactType {
        return this.props.type ?? ContactType.Group;
    }

    set type(typeValue: ContactType){
        this.props.type = typeValue;
    }

    /**
     * Returns the full name of the contact. 
     */
    get fullName(): string[] | undefined {
        return this.props.fullName;
    }

    set fullName(name: string[] | undefined) {
        this.props.fullName = name;
    }

    /**
     * Returns the first name of the contact.
     */
    get firstName(): string | undefined {
        return this.props.firstName;
    }

    set firstName(name: string | undefined) {
        this.props.firstName = name;
    }

    /**
     * Returns the last name of the contact.
     */
    get lastName(): string | undefined {
        return this.props.lastName;
    }

    set lastName(name: string | undefined) {
        this.props.lastName = name;
    }

    /**
     * Returns the middle initial for the contact.
     */
    get middleInitial(): string | undefined {
        return this.props.middleInitial;
    }

    set middleInitial(initial: string | undefined) {
        this.props.middleInitial = initial;
    }

    /**
     * Returns the title to use for this contact's name. 
     */
    get title(): string | undefined {
        return this.props.nameTitle;
    }

    set title(title: string | undefined) {
        this.props.nameTitle = title
    }

    /**
     * Returns the suffix to use for this contact's name.
     */
    get suffix(): string | undefined {
        return this.props.nameSuffix;
    }

    set suffix(suffix: string | undefined) {
        this.props.nameSuffix = suffix; 
    }

    /**
     * Returns the 
     */
    get jobTitle(): string | undefined {
        return this.props.jobTitle;
    }

    set jobTitle(title: string | undefined) {
        this.props.jobTitle = title;
    }

    /**
     * Returns the contact's company name.
     */
    get companyName(): string | undefined {
        return this.props.company;
    }

    set companyName(name: string | undefined) {
        this.props.company = name;
    }

    /**
     * Returns the contact's primary email address.
     */
    get primaryEmail(): string | undefined {
        return this.props.primaryEmail;
    }

    set primaryEmail(email: string | undefined) {
        this.props.primaryEmail = email;
    }

    /**
     * Returns the contact's school email address.
     */
    get schoolEmail(): string | undefined {
        return this.props.schoolEmail;
    }

    set schoolEmail(email: string | undefined) {
        this.props.schoolEmail = email;
    }

    /**
     * Returns the contact's mobile email address.
     */
    get mobileEmail(): string | undefined {
        return this.props.mobileEmail;
    }

    set mobileEmail(email: string | undefined) {
        this.props.mobileEmail = email;
    }

    /**
     * Returns the contact's work email addresses.
     */
    get workEmails(): string[] {
        return this.props.workEmails;
    }

    set workEmails(emails: string[]) {
        this.props.workEmails = emails;
    }

    /**
     * Returns the contact's home email addresses.
     */
    get homeEmails(): string[] {
        return this.props.homeEmails;
    }

    set homeEmails(emails: string[]) {
        this.props.homeEmails = emails;
    }

    /**
     * Returns other email addresses set for the contact.
     */
    get otherEmails(): string[] {
        return this.props.otherEmails;
    }

    set otherEmails(emails: string[]) {
        this.props.otherEmails = emails;
    }

    /**
     * Removes a specific email address from the contact. 
     * @param email The email address to remove.
     */
    public removeEmailAddress(email: string): void {
        if (this.primaryEmail === email) {
            this.primaryEmail = "";
        }
        if (this.mobileEmail === email) {
            this.mobileEmail = "";
        }
        if (this.schoolEmail === email) {
            this.schoolEmail = "";
        }

        this.otherEmails = this.otherEmails.filter(current => { return current !== email });
        this.homeEmails = this.homeEmails.filter(current => { return current !== email });
        this.workEmails = this.workEmails.filter(current => { return current !== email });
    }

    /**
     * Convenience method for removing all email addresses
     */
    public removeEmailAddresses(): void {
        this.primaryEmail = "";
        this.otherEmails = [];
        this.homeEmails = [];
        this.workEmails = [];
        this.mobileEmail = "";
        this.schoolEmail = "";
    }

    /**
     * Returns the contact's office phone number.
     */
    get officePhone(): string | undefined {
        return this.props.officePhone;
    }

    set officePhone(phone: string | undefined) {
        this.props.officePhone = phone;
    }

    /**
     * Returns the contact's home phone number.
     */
    get homePhone(): string | undefined {
        return this.props.homePhone;
    }

    set homePhone(phone: string | undefined) {
        this.props.homePhone = phone;
    }

    /**
     * Returns the contact's cell phone number.
     */
    get cellPhone(): string | undefined {
        return this.props.cellPhone;
    }

    set cellPhone(phone: string | undefined) {
        this.props.cellPhone = phone;
    }

    /**
     * Returns the contact's office fax number.
     */
    get officeFax(): string | undefined {
        return this.props.officeFax;
    }

    set officeFax(fax: string | undefined) {
        this.props.officeFax = fax;
    }

    /**
     * Returns the contact's home fax number.
     */
    get homeFax(): string | undefined {
        return this.props.homeFax;
    }

    set homeFax(fax: string | undefined) {
        this.props.homeFax = fax;
    }

    /**
     * Returns other phone numbers set for the contact.
     */
    get otherPhones(): string[] {
        return this.props.otherPhones;
    }

    set otherPhones(phones: string[]) {
        this.props.otherPhones = phones;
    }

    /**
     * Removes a specific phone number from the contact. 
     * @param number The phone number to remove.
     */
    public removePhoneNumber(number: string): void {
        if (this.homePhone === number) {
            this.homePhone = "";
        }
        if (this.homeFax === number) {
            this.homeFax = "";
        }
        if (this.cellPhone === number) {
            this.cellPhone = "";
        }
        if (this.officePhone === number) {
            this.officePhone = "";
        }
        if (this.officeFax === number) {
            this.officeFax = "";
        }
        this.otherPhones = this.otherPhones.filter(current => { return current !== number });
    }

    /**
     * Convenience method for removing all phone numbers
     */
    public removePhoneNumbers(): void {
        this.homePhone = "";
        this.homeFax = "";
        this.cellPhone = "";
        this.otherPhones = [];
        this.officePhone = "";
        this.officeFax = "";
    }

    /**
     * Returns the office address for the contact. 
     * @returns An address class containing the address information or undefined it the address is not set.
     */
    get officeAddress(): PimAddress | undefined {
        return this.props.officeAddress;
    }

    set officeAddress(address: PimAddress | undefined) {
        if (address === undefined || Object.entries(address).length === 0) {
            this.props.officeAddress = undefined;
        }
        else {
             this.props.officeAddress = address;
        }
    }

    /**
     * Returns the home address for the contact. 
     * @returns An address class containing the address information or undefined it the address is not set.
     */
    get homeAddress(): PimAddress | undefined {
        return this.props.homeAddress;
    }

    set homeAddress(address: PimAddress | undefined) {
        if (address === undefined || Object.entries(address).length === 0) {
            this.props.homeAddress = undefined;
        }
        else {
             this.props.homeAddress = address;
        }
    }

    /**
     * Returns an other address for the contact. 
     * @returns An address class containing the address information or undefined it the address is not set.
     */
    get otherAddress(): PimAddress | undefined {
        return this.props.otherAddress;
    }

    set otherAddress(address: PimAddress | undefined) {
        if (address === undefined || Object.entries(address).length === 0) {
            this.props.otherAddress = undefined;
        }
        else {
             this.props.otherAddress = address;
        }
    }

    /**
     * Remove a matching key from an address object. 
     * @param key The key in the address object
     * @param type The type of address. Value is "Home", "Work", or "Other"
     */
    public removeAddressKey(key: ContactAddressKey, type: string): void {
        if (type === "Home") {
            if (this.homeAddress) {
                this.homeAddress[key] = "";
            }
        }
        else if (type === "Business") {
            if (this.officeAddress) {
                this.officeAddress[key] = "";
            }
        }
        else if (type === "Other") {
            if (this.otherAddress) {
                this.otherAddress[key] = "";
            }
        }
        else {
            Logger.getInstance().error(`Unknown address type ${type} for key ${key}`);
        }
    }

    /**
     * Convenience method for removing all addresses
     */
    public removeAddresses(): void {
        this.homeAddress = undefined;
        this.officeAddress = undefined;
        this.otherAddress = undefined;
    }

    /**
     * Returns the contact's department information
     */
    get department(): string | undefined {
        return this.props.department;
    }

    set department(name: string | undefined) {
        this.props.department = name;
    }

    /**
     * Returns the contact's location information
     */
    get location(): string | undefined {
        return this.props.location;
    }

    set location(place: string | undefined) {
        this.props.location = place;
    }

    /**
     * Returns the contact's manager information
     */
    get manager(): string | undefined {
        return this.props.manager;
    }

    set manager(name: string | undefined) {
        this.props.manager = name;
    }

    /**
     * Returns the contact's assistant information
     */
    get assistant(): string | undefined {
        return this.props.assistant;
    }

    set assistant(name: string | undefined) {
        this.props.assistant = name;
    }

    /**
     * Returns the contact's spouse information
     */
     get spouse(): string | undefined {
        return this.props.spouse;
    }

    set spouse(name: string | undefined) {
        this.props.spouse = name;
    }

    /**
     * Returns the contact's birthday. 
     */
    get birthday(): Date | undefined {
        return this.props.birthday;
    }

    set birthday(date: Date | undefined) {
        this.props.birthday = date;
    }

    /**
     * Returns the contact's wedding aniversary date.
     */
    get anniversary(): Date | undefined {
        return this.props.anniversary;
    }

    set anniversary(date: Date | undefined) {
        this.props.anniversary = date;
    }

    /**
     * Return the contact's homepage/workURL URL. 
     */
      
    get homepage(): string | undefined {
        return this.props.homepage;
    }

    set homepage(url: string | undefined) {
        this.props.homepage = url;
    }

    /**
     * Returns the contact's instant messaging addresses/SametimeLogin
     */
    get imAddresses(): string[] {
        return this.props.imAddresses ?? [];
    }

    set imAddresses(addresses: string[]) {
        this.props.imAddresses = addresses;
    }

    /**
    * Removes a specific instant message address from the contact. 
    * @param email The instant message address to remove.
    */
    public removeImAddress(email: string): void {
        this.imAddresses = this.imAddresses.filter(current => { return current !== email });
    }

    /**
     * TODO: What does this return?
     */
    get photo(): string | undefined {
        return this.props.photo;
    }

    set photo(photo: string | undefined){
        this.props.photo = photo;
    }

    /**
     * Returns a URL where a contact photo can be downloaded. 
     */
    get photoURL(): string | undefined {
        return this.props.photoURL;
    }

    set photoURL(photoURL: string | undefined){
        this.props.photoURL = photoURL;
    }

    /**
    * Returns a structure that can be used to create a calendar entry on the Keep API. 
    * @returns An object to use when creating a calendar entry on the Keep API. 
    */
    public toPimStructure(): object {

        const rtn: any = super.toPimStructure();
        rtn.Form = "Person";
        rtn.Type = ContactType.Person;

        if (this.fullName !== undefined) {
            rtn.FullName = this.fullName;
            rtn.FullNameInput = this.fullName;
        }

        if (this.firstName !== undefined) {
            rtn.FirstName = this.firstName;
        }

        if (this.lastName !== undefined) {
            rtn.LastName = this.lastName;
        }

        if (this.middleInitial !== undefined) {
            rtn.MiddleInitial = this.middleInitial;
        }

        if (this.suffix !== undefined) {
            rtn.Suffix = this.suffix;
        }

        if (this.title !== undefined) {
            rtn.Title = this.title;
        }

        if (this.primaryEmail !== undefined) {
            rtn.MailAddress = this.primaryEmail;
        }

        if (this.schoolEmail !== undefined) {
            rtn.SchoolEmail = this.schoolEmail;
        }

        if (this.mobileEmail !== undefined) {
            rtn.mobileEmail = this.mobileEmail;
        }

        //Clear any previous home emails first, in case they were deleted
        rtn.HomeEmail = "";
        for (let i = 0; i < 6; i++) {
            rtn[`home${i}email`] = "";
        }
        let index = 0;
        this.homeEmails.forEach(email => {
            if (index === 0) {
                rtn.HomeEmail = email;
            }
            else {
                rtn[`home${index}email`] = email;
            }
            index = index + 1;
        });

        //Clear any previous work emails first, in case they were deleted
        /* Sample work email settings. Index 0 and 3 have different capitalizations. 
        "Work0Email": "",
        "work1email": "jThomas@myco.com",
        "work2email": "jane@work2.myco.com",
        "Work3Email": "johnny@mymail.com",
        "work4email": "",
        "work5email": "",
        */
        for (let i = 0; i < 6; i++) {
            if (i === 0 || i === 3) {
                rtn[`Work${i}Email`] = "";
            }
            else {
                rtn[`work${i}email`] = "";
            }
        }
        index = 0;
        // If the primary email is a work email, make sure it is set at index 0. 
        const found = this.workEmails.find(email => { return email === this.primaryEmail });
        if (found !== undefined) {
            rtn.Work0Email = found;
            index = 1;
        }
        this.workEmails.forEach(email => {
            if (email !== found) {
                if (index === 0 || index === 3) {
                    rtn[`Work${index}Email`] = email;
                }
                else {
                    rtn[`work${index}email`] = email;
                }
                index = index + 1;
            }
        });

        //Clear any previous other emails first, in case they were deleted
        for (let i = 0; i < 6; i++) {
            rtn[`email_${i}email`] = "";
            rtn[`email_${i}`] = "";
            rtn[`InternetAddress${i}`] = "";
        }
        index = 0;
        this.otherEmails.forEach(email => {
            rtn[`email_${index}`] = email;
            index = index + 1;
        });

        if (this.homePhone !== undefined) {
            rtn.HomePhone = this.homePhone;
        }

        if (this.homeFax !== undefined) {
            rtn.HomeFAXPhoneNumber = this.homeFax;
        }

        if (this.cellPhone !== undefined) {
            rtn.CellPhoneNumber = this.cellPhone;
        }

        if (this.officePhone !== undefined) {
            rtn.OfficePhoneNumber = this.officePhone;
        }

        if (this.officeFax !== undefined) {
            rtn.OfficeFAXPhoneNumber = this.officeFax;
        }

        //Clear any previous numbers first, in case they were deleted
        for (let i = 0; i < 6; i++) {
            rtn[`PhoneNumber_${i}`] = "";
        }
        index = 0;
        this.otherPhones.forEach(phoneNumer => {
            rtn[`PhoneNumber_${index}`] = phoneNumer;
            index = index + 1;
        });

        // Office Address
        rtn.OfficeStreetAddress = this.officeAddress?.Street ?? "";
        rtn.OfficeCity = this.officeAddress?.City ?? "";
        rtn.OfficeState = this.officeAddress?.State ?? "";
        rtn.OfficeZIP = this.officeAddress?.PostalCode ?? "";
        rtn.OfficeCountry = this.officeAddress?.Country ?? "";

        // Other address
        rtn.OtherStreetAddress = this.otherAddress?.Street ?? "";
        rtn.OtherCity = this.otherAddress?.City ?? "";
        rtn.OtherState = this.otherAddress?.State ?? "";
        rtn.OtherZip = this.otherAddress?.PostalCode ?? "";
        rtn.OtherCountry = this.otherAddress?.Country ?? "";

        // Home address
        // FIXME: Will LABS-2995 change this? 
        rtn.StreetAddress = this.homeAddress?.Street ?? "";
        rtn.City = this.homeAddress?.City ?? "";
        rtn.State = this.homeAddress?.State ?? "";
        rtn.Zip = this.homeAddress?.PostalCode ?? "";
        rtn.country = this.homeAddress?.Country ?? "";

        if (this.jobTitle !== undefined) {
            rtn.JobTitle = this.jobTitle;
        }

        if (this.companyName !== undefined) {
            rtn.CompanyName = this.companyName;
        }

        if (this.location !== undefined) {
            rtn.Location = this.location;
        }

        if (this.manager !== undefined) {
            rtn.Manager = this.manager;
        }

        if (this.assistant !== undefined) {
            rtn.Assistant = this.assistant;
        }

        if (this.spouse !== undefined) {
            rtn.Spouse = this.spouse;
        }

        if (this.department !== undefined) {
            rtn.Department = this.department;
        }

        if (!this.isPrivate) {
            rtn["Public"] = "1";
        }

        rtn.Comment = this.body;

        if (this.imAddresses.length > 0) {
            rtn.SametimeLogin = this.imAddresses[0]; // Keep only supports one IM address
        }
        else {
            rtn.SametimeLogin = "";
        }

        if (this.anniversary) {
            rtn.Anniversary = this.anniversary.toISOString();
        }
        else {
            rtn.Anniversary = "";
        }

        if (this.birthday) {
            rtn.Birthday = this.birthday.toISOString();
        }
        else {
            rtn.Birthday = "";
        }

        if (this.homepage) {
            // This will show the URL in Notes client. 
            // TODO: Will LABS-1282 change this? 
            rtn.WebSite = this.homepage;
        }

        if (this.isConfidential) {
            rtn.Confidential = '1';
        }

        return rtn;
    }

    /**
     * Parse out the value from a contact object returned from the Keep PIM API to get a list of contacts. 
     * Each entry looks like this. TODO: Convert to use the document=true on the API when it is supported. 
     * {
     *   "@unid": "FDEB4E4FF7EDCF988525858F006B10F1",
     *   "@noteid": 2378,
     *   "@index": "1.1.1",
     *   "$126": "User , Test",
     *   "$19": "[Office phone:999-111-1111, Office fax:999-555-1111, Cell phone:999-222-1111, Home phone:999-444-1111, Pager:999-333-1111]",
     *   "$20": "[Test User company name, Test User Job Title]",
     *   "$21": "[Test, contact55]",
     *   "$22": "Person"
     * },
     * @param contactObject A contact object returned from the Keep PIM API. 
     */
    protected itemFromPrimitive(contactObject: any): PimContactClassic {

        super.itemFromPrimitive(contactObject);

        this.props.type = parseValue("$22", contactObject);

        // Parse out contact name
        const name: string = contactObject["$126"];
        if (name) {
            // Note: The order will always be lastname, firstname regardless of order set in contact.
            const parts = name.split(",");
            this.props.lastName = parts[0].trim();

            if (parts.length > 1) {
                this.props.firstName = parts[1].trim();
            }
        }

        // Parse out company name and job title. 
        const titles = parseValue("$20", contactObject);
        if (titles) {
            const parts = convertToListObject(titles);
            this.companyName = parts[0]

            if (parts.length > 1) {
                this.props.jobTitle = parts[1];
            }
        }

        // Parse out categories.
        const categories = parseValue("$21", contactObject);
        if (categories && categories !== "Not Categorized") { // TODO: Should be blank or not included if none (LABS-1203).
            this.categories = convertToListObject(categories);  // TODO: Always be an array when LABS-1550 fixed
        }

        return this;
    }

    /**
     * Parse out the value from a contact object returned from the Keep PIM API to get a single contact. 
     * @param contactObject A contact object returned from the Keep PIM API. 
     */
    protected itemFromDocument(contactObject: any): PimContactClassic {

        super.itemFromDocument(contactObject);

        const comment = parseValue('Comment', contactObject);
        if (comment) {
            this.body = comment;
        }

        const type = parseValue("Type", contactObject);
        if (type) {
            this.props.type = type;
        }

        /**
         Name has the following keys:
            "AltFullNameLanguage": "",
            "AltFullName": "",
            "FirstName": "Jane",
            "MiddleInitial": "",
            "LastName": "Doe",
            "Title": "",
            "Suffix": "",
            "FullNameInput": "Jane Doe",
         */
        let fullName = parseValue('FullName', contactObject);
        if (fullName === undefined) {
            fullName = parseValue('FullNameInput', contactObject);
        }
        if (fullName) {
            if(Array.isArray(fullName)){
                this.props.fullName = fullName;
            }else{
                this.props.fullName = [fullName];
            }
        }
        const firstName = parseValue('FirstName', contactObject);
        if (firstName) {
            this.props.firstName = firstName;
        }
        const lastName = parseValue('LastName', contactObject);
        if (lastName) {
            this.props.lastName = lastName;
        }
        const middleInitial = parseValue('MiddleInitial', contactObject);
        if (middleInitial) {
            this.props.middleInitial = middleInitial;
        }
        const title = parseValue('Title', contactObject);
        if (title) {
            this.props.nameTitle = title;
        }
        const suffix = parseValue('Suffix', contactObject);
        if (suffix) {
            this.props.nameSuffix = suffix;
        }
        //     "JobTitle": "Tester"
        const jobTitle = parseValue('JobTitle', contactObject);
        if (jobTitle) {
            this.props.jobTitle = jobTitle;
        }

        //     "CompanyName": "HCL"
        const company = parseValue('CompanyName', contactObject);
        if (company) {
            this.props.company = company;
        }

        //     "Confidential": "",
        const confidential = parseValue('Confidential', contactObject);
        this.props.confidential = (confidential === "1") ? true : false;

        /**
         Emails can have keys like this. A Contact item can only have a max of 3 emails. This is the order we will look for emails:
            "MailAddress": "testuser@business.hcl.com",
            "work1email": "testuser@assistant.hcl.com",
            "HomeEmail": "testuser@personal.hcl.com",
            "work2email": "testuser@business2.hcl.com",
            "SchoolEmail": "testuser@personal2.hcl.com",
            "mobileEmail": "",
            "email_1": "testuser@business.hcl.com",
            "email_5": "testuser@personal2.hcl.com",
            "InternetAddress": "testuser@business.hcl.com",
            "InternetAddress1": "testuser@business.hcl.com",
         */
        let emailAddress = parseValue("MailAddress", contactObject);
        if (emailAddress) {
            this.props.primaryEmail = emailAddress;
        }
        emailAddress = parseValue("SchoolEmail", contactObject);
        if (emailAddress) {
            this.props.schoolEmail = emailAddress;
        }
        emailAddress = parseValue("mobileEmail", contactObject);
        if (emailAddress) {
            this.props.mobileEmail = emailAddress;
        }

        // Work emails
        this.props.workEmails = [];
        for (const key in contactObject) {
            if (key.toLowerCase().startsWith("work") && key.toLowerCase().endsWith("email")) {
                const email = parseValue(key, contactObject);
                if (email && this.props.workEmails.indexOf(email) < 0) {
                    this.props.workEmails.push(email);
                }
            }
        }

        // Home emails
        this.props.homeEmails = [];
        for (const key in contactObject) {
            if (key.toLowerCase().startsWith("home") && key.toLowerCase().endsWith("email")) {
                const email = parseValue(key, contactObject);
                if (email && this.props.homeEmails.indexOf(email) < 0) {
                    this.props.homeEmails.push(email);
                }
            }
        }

        // Contains values for keys starting with email_ then starting with "InternetAddress"
        this.props.otherEmails = [];
        emailAddress = parseValue("OtherEmail", contactObject);
        if (emailAddress) {
            this.props.otherEmails.push(emailAddress);
        }
        for (const key in contactObject) {
            if (key.startsWith("email_")) {
                const email = parseValue(key, contactObject);
                if (email && this.props.otherEmails.indexOf(email) < 0) {
                    this.props.otherEmails.push(email);
                }
            }
        }

        for (const key in contactObject) {
            if (key.startsWith("InternetAddress")) {
                const email = parseValue(key, contactObject);
                if (email && this.props.otherEmails.indexOf(email) < 0) {
                    this.props.otherEmails.push(email);
                }
            }
        }

        /**
          Phone numbers have keys like this:
            "OfficePhoneNumber": "999-111-1111",
            "CellPhoneNumber": "999-222-1111",
            "HomePhoneNumber": "999-444-1111",
            "PhoneNumber_6": "999-333-1111",
            "PhoneNumber_8": "",
            "PhoneNumber_9": "",
            "OfficeFAXPhoneNumber": "999-555-1111",
            "PhoneNumber_10": "",
            "HomeFAXPhoneNumber": "",
         */
        let phone = parseValue("OfficePhoneNumber", contactObject);
        if (phone) {
            this.props.officePhone = phone;
        }
        phone = parseValue("PhoneNumber", contactObject);
        if (phone) {
            this.props.homePhone = phone;
        }
        else {
            // TODO: Is this needed?
            phone = parseValue("HomePhone", contactObject);
            if (phone) {
                this.props.homePhone = phone;
            }
        }
        phone = parseValue("CellPhoneNumber", contactObject);
        if (phone) {
            this.props.cellPhone = phone;
        }
        phone = parseValue("OfficeFAXPhoneNumber", contactObject);
        if (phone) {
            this.props.officeFax = phone;
        }
        phone = parseValue("HomeFAXPhoneNumber", contactObject);
        if (phone) {
            this.props.homeFax = phone;
        }
        this.props.otherPhones = [];
        for (const key in contactObject) {
            if (key.startsWith("PhoneNumber_")) {
                const phoneNumber = parseValue(key, contactObject);
                if (phoneNumber) {
                    this.props.otherPhones.push(phoneNumber);
                }
            }
        }

        /**
           Addresses have keys like this:
            "OfficeStreetAddress": "99 Business St",
            "OfficeState": "NC",
            "OfficeCountry": "USA",
            "OfficeCity": "Raleigh",
            "OfficeZIP": "27765",
            "StreetAddress": "99 Personal Ave",
            "State": "NC",
            "country": "USA",
            "City": "Raleigh",
            "Zip": "33376",
            "OtherStreetAddress": "",
            "OtherState": "",
            "OtherCountry": "",
            "OtherCity": "",
            "OtherZip": "",
         */
        const officeAddress = new PimAddress();
        const homeAddress = new PimAddress();
        const otherAddress = new PimAddress();

        let street = parseValue("OfficeStreetAddress", contactObject);
        if (street) {
            officeAddress.Street = street;
        }
        let state = parseValue("OfficeState", contactObject);
        if (state) {
            officeAddress.State = state;
        }
        let city = parseValue("OfficeCity", contactObject);
        if (city) {
            officeAddress.City = city;
        }
        let zip = parseValue("OfficeZIP", contactObject);
        if (zip) {
            officeAddress.PostalCode = zip;
        }
        let country = parseValue("OfficeCountry", contactObject);
        if (country) {
            officeAddress.Country = country;
        }

        /* 
            FIXME: Workaround for LABS-2995. 

            For /person/<person_id>
            "HomeCity": "Raleigh",
            "HomeCountry": "USA",
            "HomeState": "NC",
            "HomeStreetAddress": "99 Personal Ave",
            "HomeZip": "27765",
            
            For GET /pimitem/<person_id>
            "City": "Raleigh",
            "country": "USA",
            "State": "NC",
            "StreetAddress": "99 Personal Ave",
            "Zip": "27765",
         */
        street = parseValue("HomeStreetAddress", contactObject);
        if (street === undefined) {
            street = parseValue("StreetAddress", contactObject);
        }
        if (street) {
            homeAddress.Street = street;
        }
        state = parseValue("HomeState", contactObject);
        if (state === undefined) {
            state = parseValue("State", contactObject);
        }
        if (state) {
            homeAddress.State = state;
        }
        city = parseValue("HomeCity", contactObject);
        if (city === undefined) {
            city = parseValue("City", contactObject);
        }
        if (city) {
            homeAddress.City = city;
        }
        zip = parseValue("HomeZip", contactObject);
        if (zip === undefined) {
            zip = parseValue("Zip", contactObject);
        }
        if (zip) {
            homeAddress.PostalCode = zip;
        }
        country = parseValue("HomeCountry", contactObject);
        if (country === undefined) {
            country = parseValue("country", contactObject);
        }
        if (country) {
            homeAddress.Country = country;
        }

        street = parseValue("OtherStreetAddress", contactObject);
        if (street) {
            otherAddress.Street = street;
        }
        state = parseValue("OtherState", contactObject);
        if (state) {
            otherAddress.State = state;
        }
        city = parseValue("OtherCity", contactObject)
        if (city) {
            otherAddress.City = city;
        }
        zip = parseValue("OtherZip", contactObject);
        if (zip) {
            otherAddress.PostalCode = zip;
        }
        country = parseValue("OtherCountry", contactObject);
        if (country) {
            otherAddress.Country = country;
        }

        if (Object.entries(otherAddress).length > 0){
            this.props.otherAddress = otherAddress;
        }
        
        if (Object.entries(homeAddress).length > 0){
            this.props.homeAddress = homeAddress;
        }

        if (Object.entries(officeAddress).length > 0){
            this.props.officeAddress = officeAddress;
        }

        //  "Department": "A334",
        const dept = parseValue("Department", contactObject);
        if (dept) {
            this.props.department = dept;
        }

        //  "Location": "Cary, NC",
        const location = parseValue("Location", contactObject);
        if (location) {
            this.props.location = location;
        }

        //"Manager": "John Doe",
        const manager = parseValue("Manager", contactObject);
        if (manager) {
            this.props.manager = manager;
        }

        //"Assistant": "John Doe",
        const assistant = parseValue("Assistant", contactObject);
        if (assistant) {
            this.props.assistant = assistant;
        }

        //"Spouse": "Jane Doe",
        const spouse = parseValue("Spouse", contactObject);
        if (spouse) {
            this.props.spouse = spouse;
        }

        //  "Birthday": "",
        const bDay = parseValue("Birthday", contactObject);
        if (bDay) {
            this.props.birthday = new Date(bDay);
        }

        //  "Anniversary": "",
        const anniversary = parseValue("Anniversary", contactObject);
        if (anniversary) {
            this.props.anniversary = new Date(anniversary);
        }

        let site = parseValue("WorkUrl", contactObject);
        if (site === undefined) {
            // FIXME: Workaround for LABS-1282
            site = parseValue("WebSite", contactObject);
        }
        if (site) {
            this.props.homepage = site;
        }

        const im = parseValue("SametimeLogin", contactObject);
        if (im) {
            this.props.imAddresses = [im];
        }

        //     "Photo": "",
        //     "PhotoURL": "",
        const photoUrl = parseValue("PhotoURL", contactObject);
        if (photoUrl) {
            this.props.photoURL = photoUrl;
        }
        const photo = parseValue("Photo", contactObject);
        if (photo) {
            this.props.photo = photo;
        }

        return this;
    }

}


