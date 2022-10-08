/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ContactType, PimAddress, PimItemFactory, PimItemFormat } from "../../../keep";
import { expect } from '@loopback/testlab';

describe('PimContact tests', () => {
    describe('Test getters and setters', () => {
        const pimObject = {
            "@unid": "test-id",
            "JobTitle": "Tester",
            "Suffix": "Jr.",
            "Title": "Mr."
        };

        it('job title', () => {
            // Verify set correctly by constructor
            const pimContact = PimItemFactory.newPimContact(pimObject, PimItemFormat.DOCUMENT);
            expect(pimContact.jobTitle).to.be.equal("Tester");

            // Test setter
            pimContact.jobTitle = "New Title";
            expect(pimContact.jobTitle).to.be.equal("New Title");
        });

        it('name title', () => {
            // Verify set correctly by constructor
            const pimContact = PimItemFactory.newPimContact(pimObject, PimItemFormat.DOCUMENT);
            expect(pimContact.title).to.be.equal("Mr.");

            // Test setter
            pimContact.title = "Dr.";
            expect(pimContact.title).to.be.equal("Dr.");
        });

        it('name suffix', () => {
            // Verify set correctly by constructor
            const pimContact = PimItemFactory.newPimContact(pimObject, PimItemFormat.DOCUMENT);
            expect(pimContact.suffix).to.be.equal("Jr.");

            // Test setter
            pimContact.suffix = "Sr.";
            expect(pimContact.suffix).to.be.equal("Sr.");
        });
    });

    describe('test with document format', () => {

        const contactObject = {
                '$PublicAccess': '1',
                Public: '1',
                FullName: 'fullname1',
                FirstName: 'fname2',
                MiddleInitial: 'midname2',
                LastName: 'lname2',
                Title: 'title1',
                Suffix: 'suffix1',
                MailAddress: 'email1@test.com',
                'email_2': 'email2@test.com',
                'email_3': 'email3@test.com',
                OfficePhoneNumber: '654-334-2388',
                PhoneNumber: '879-324-4423',
                CellPhoneNumber: '876-444-2345',
                OfficeFAXPhoneNumber: '443-452-0944',
                HomeFAXPhoneNumber: '499-221-9322',
                'PhoneNumber_6': '367-221-8494',
                OfficeStreetAddress: '123 Office St',
                OfficeCity: 'Office City',
                OfficeState: 'Office State',
                OfficeCountry: 'Office Country',
                OfficeZIP: '008476',
                HomeStreetAddress: '123 Home St',
                HomeCity: 'Home City',
                HomeState: 'Home State',
                HomeCountry: 'Home Country',
                HomeZip: '0995487',
                OtherStreetAddress: '123 Other St',
                OtherCity: 'Other City',
                OtherState: 'Other State',
                OtherCountry: 'Other Country',
                OtherZip: '855678',
                Comment: 'comment',
                JobTitle: 'Software Engineer',
                WebSite: 'http://test.site.com'
            };

          it('test out contact', () => {
              
            const contact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);

            expect(contact.firstName).to.be.equal(contactObject.FirstName);
            expect(contact.middleInitial).to.be.equal(contactObject.MiddleInitial);
            expect(contact.lastName).to.be.equal(contactObject.LastName);
            expect(contact.title).to.be.equal(contactObject.Title);
            expect(contact.suffix).to.be.equal(contactObject.Suffix);
            expect(contact.jobTitle).to.be.equal(contactObject.JobTitle);
            expect(contact.homepage).to.be.equal(contactObject.WebSite);

            expect(contact.primaryEmail).to.be.equal(contactObject.MailAddress);
            expect(contact.otherEmails).to.be.deepEqual([contactObject.email_2, contactObject.email_3]);

            expect(contact.officePhone).to.be.equal(contactObject.OfficePhoneNumber);
            expect(contact.officeFax).to.be.equal(contactObject.OfficeFAXPhoneNumber);
            expect(contact.homePhone).to.be.equal(contactObject.PhoneNumber);
            expect(contact.homeFax).to.be.equal(contactObject.HomeFAXPhoneNumber);
            expect(contact.otherPhones).to.be.deepEqual([contactObject.PhoneNumber_6]);

            expect(contact.homeAddress?.City).to.be.equal(contactObject.HomeCity);
            expect(contact.homeAddress?.PostalCode).to.be.equal(contactObject.HomeZip);
            expect(contact.homeAddress?.Country).to.be.equal(contactObject.HomeCountry);
            expect(contact.homeAddress?.State).to.be.equal(contactObject.HomeState);
            expect(contact.homeAddress?.Street).to.be.equal(contactObject.HomeStreetAddress);

            expect(contact.officeAddress?.City).to.be.equal(contactObject.OfficeCity);
            expect(contact.officeAddress?.PostalCode).to.be.equal(contactObject.OfficeZIP);
            expect(contact.officeAddress?.Country).to.be.equal(contactObject.OfficeCountry);
            expect(contact.officeAddress?.State).to.be.equal(contactObject.OfficeState);
            expect(contact.officeAddress?.Street).to.be.equal(contactObject.OfficeStreetAddress);

            expect(contact.otherAddress?.City).to.be.equal(contactObject.OtherCity);
            expect(contact.otherAddress?.PostalCode).to.be.equal(contactObject.OtherZip);
            expect(contact.otherAddress?.Country).to.be.equal(contactObject.OtherCountry);
            expect(contact.otherAddress?.State).to.be.equal(contactObject.OtherState);
            expect(contact.otherAddress?.Street).to.be.equal(contactObject.OtherStreetAddress);

          });

          it('test toPimStructure', () => {
            const contact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
            const struct: any = contact.toPimStructure(); 

            expect(struct.JobTitle).to.be.equal(contact.jobTitle);

            expect(struct.City).to.be.equal(contact.homeAddress!.City);
            expect(struct.Zip).to.be.equal(contact.homeAddress!.PostalCode);
            expect(struct.country).to.be.equal(contact.homeAddress!.Country);
            expect(struct.State).to.be.equal(contact.homeAddress!.State);
            expect(struct.StreetAddress).to.be.equal(contact.homeAddress!.Street);

            expect(struct.JobTitle).to.be.equal(contact.jobTitle);
            expect(struct.JobTitle).to.be.equal(contact.jobTitle);
            expect(struct.JobTitle).to.be.equal(contact.jobTitle);
            expect(struct.JobTitle).to.be.equal(contact.jobTitle);
            expect(struct.JobTitle).to.be.equal(contact.jobTitle);

          });
    }); 

    describe('test with primitive format', () => {
        it('Fully populated', () => {

            const contactObject = {
                '@unid': 'FDEB4E4FF7EDCF988525858F006B10F1',
                '@noteid': 2378,
                '@index': '1.1.1',
                '$126': 'User , Test',
                '$19': '[Office phone:999-111-1111, Office fax:999-555-1111, Cell phone:999-222-1111, Home phone:999-444-1111, Pager:999-333-1111]',
                '$20': '[Test User company name, Test User Job Title]',
                '$21': '[Test, contact55]',
                '$22': 'Person'
            }

            const contact = PimItemFactory.newPimContact(contactObject);
            expect(contact.firstName).to.be.equal('Test');
            expect(contact.lastName).to.be.equal('User');
            expect(contact.companyName).to.be.equal('Test User company name');
            expect(contact.jobTitle).to.be.equal('Test User Job Title');
            expect(contact.unid).to.be.equal('FDEB4E4FF7EDCF988525858F006B10F1');
            expect(contact.categories).to.be.eql(['Test', 'contact55']);
            // TODO:  Need a getter for contact.type
        });

        it('Missing some fields', () => {

            const contactObject = {
                '@unid': 'FDEB4E4FF7EDCF988525858F006B10F1',
                '@noteid': 2378,
                '@index': '1.1.1',
                '$19': '[Office phone:999-111-1111, Office fax:999-555-1111, Cell phone:999-222-1111, Home phone:999-444-1111, Pager:999-333-1111]',
                '$22': 'Person'
            }

            const contact = PimItemFactory.newPimContact(contactObject);
            expect(contact.firstName).to.be.undefined();
            expect(contact.lastName).to.be.undefined();
            expect(contact.companyName).to.be.undefined();
            expect(contact.jobTitle).to.be.undefined();
            expect(contact.categories).to.be.eql([]);
            expect(contact.unid).to.be.equal('FDEB4E4FF7EDCF988525858F006B10F1');
        });

        it('Variations of name field', () => {

            const contactObject = {
                '@unid': 'FDEB4E4FF7EDCF988525858F006B10F1',
                '@noteid': 2378,
                '@index': '1.1.1',
                '$126': 'User , Test',
                '$22': 'Person'
            }

            let contact = PimItemFactory.newPimContact(contactObject);
            expect(contact.firstName).to.be.equal('Test');
            expect(contact.lastName).to.be.equal('User');

            // Use only a last name
            contactObject['$126'] = 'Jones';
            contact = PimItemFactory.newPimContact(contactObject);
            expect(contact.firstName).to.be.undefined();
            expect(contact.lastName).to.be.equal('Jones');

            // Provide neither first or last name
            contactObject['$126'] = '';
            contact = PimItemFactory.newPimContact(contactObject);
            expect(contact.firstName).to.be.undefined();
            expect(contact.lastName).to.be.undefined();

        });

        it('Variations of company, jobTitle', () => {

            const contactObject = {
                '@unid': 'FDEB4E4FF7EDCF988525858F006B10F1',
                '@noteid': 2378,
                '@index': '1.1.1',
                '$126': 'User , Test',
                '$20': '[Test User company name, Test User Job Title]',
                '$22': 'Person'
            }

            let contact = PimItemFactory.newPimContact(contactObject);
            expect(contact.companyName).to.be.equal('Test User company name');
            expect(contact.jobTitle).to.be.equal('Test User Job Title');

            // Provide only a company name as an array
            contactObject['$20'] = '[HCL]';
            contact = PimItemFactory.newPimContact(contactObject);
            expect(contact.jobTitle).to.be.undefined();
            expect(contact.companyName).to.be.equal('HCL');

            // Proivde only a company name as a string
            contactObject['$20'] = 'HCL';
            contact = PimItemFactory.newPimContact(contactObject);
            expect(contact.jobTitle).to.be.undefined();
            expect(contact.companyName).to.be.equal('HCL');

            // Provide neither
            contactObject['$20'] = '';
            contact = PimItemFactory.newPimContact(contactObject);
            expect(contact.jobTitle).to.be.undefined();
            expect(contact.companyName).to.be.undefined();

        });

        it('Variations of categories', () => {

            const contactObject = {
                '@unid': 'FDEB4E4FF7EDCF988525858F006B10F1',
                '@noteid': 2378,
                '@index': '1.1.1',
                '$126': 'User , Test',
                '$20': '[Test User company name, Test User Job Title]',
                '$22': 'Person',
                '$21': '[Cat1, Cat2]'
            }

            let contact = PimItemFactory.newPimContact(contactObject);
            expect(contact.categories).to.be.eql(['Cat1', 'Cat2']);

            // Try Not Categorized
            contactObject['$21'] = 'Not Categorized';
            contact = PimItemFactory.newPimContact(contactObject);
            expect(contact.categories).to.be.eql([]);

            // Provide only a single category
            contactObject['$21'] = 'ABC';
            contact = PimItemFactory.newPimContact(contactObject);
            expect(contact.categories).to.be.eql(['ABC']);

        });

    });

    it('isGroup check', () => {
        const contactObject: any = {
            'Type': 'Group'
        }

        const pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.type).to.be.eql('Group');
        expect(pimContact.isGroup).to.be.eql(true);

    });

    it('comment check', () => {
        const contactObject: any = {
            'Comment': 'This is a comment to body'
        }

        const pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.comment).to.be.eql("This is a comment to body");

        pimContact.comment = 'comment updated';
        expect(pimContact.comment).to.be.eql('comment updated');

    });

    it('type check', () => {
        const contactObject: any = {
            'type': ContactType.Group
        }

        const pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.type).to.be.eql(ContactType.Group);

        pimContact.type = ContactType.Person;
        expect(pimContact.type).to.be.eql(ContactType.Person);
    });

    it('fullName of contact', () => {
        const contactObject: any = {
            'FullName': "JohnMDoe"
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        if(pimContact.fullName){
           expect(pimContact.fullName[0]).to.be.eql("JohnMDoe");
        }   

        pimContact.fullName = ['TinaNRina'];
        expect(pimContact.fullName[0]).to.be.eql('TinaNRina');

        contactObject.FullName = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.fullName).to.be.undefined();
    });

    it('firstName of contact', () => {
        const contactObject: any = {
            'FirstName': "John"
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.firstName).to.be.eql("John");

        pimContact.firstName = 'Tina';
        expect(pimContact.firstName).to.be.eql('Tina');

        contactObject.FirstName = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.firstName).to.be.undefined();
    });

    it('lastName of contact', () => {
        const contactObject: any = {
            'LastName': "Doe"
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.lastName).to.be.eql("Doe");

        pimContact.lastName = 'Rina';
        expect(pimContact.lastName).to.be.eql('Rina');

        contactObject.LastName = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.lastName).to.be.undefined();
    });

    it('middleInitial of contact', () => {
        const contactObject: any = {
            'MiddleInitial': "M"
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.middleInitial).to.be.eql("M");

        pimContact.middleInitial = 'N';
        expect(pimContact.middleInitial).to.be.eql('N');

        contactObject.MiddleInitial = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.middleInitial).to.be.undefined();
    });

    it('primaryEmail of contact', () => {
        const contactObject: any = {
            'MailAddress': 'john.doe@testmail.com'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.primaryEmail).to.be.eql("john.doe@testmail.com");

        pimContact.primaryEmail = 'tina.rina@testmail.com';
        expect(pimContact.primaryEmail).to.be.eql("tina.rina@testmail.com");

        contactObject.MailAddress = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.primaryEmail).to.be.undefined();
    });

    it('schoolEmail of contact', () => {
        const contactObject: any = {
            'SchoolEmail': 'ramya@testmail.com'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.schoolEmail).to.be.eql("ramya@testmail.com");

        pimContact.schoolEmail = 'saral@testmail.com';
        expect(pimContact.schoolEmail).to.be.eql("saral@testmail.com");

        contactObject.SchoolEmail = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.schoolEmail).to.be.undefined();
    });

    it('mobileEmail of contact', () => {
        const contactObject: any = {
            'mobileEmail': 'sneha@testmail.com'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.mobileEmail).to.be.eql("sneha@testmail.com");

        pimContact.mobileEmail = 'rashmi@testmail.com';
        expect(pimContact.mobileEmail).to.be.eql("rashmi@testmail.com");

        contactObject.mobileEmail = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.mobileEmail).to.be.undefined();
    });

    it('workEmail of contact', () => {
        const contactObject: any = {
            'work1email': 'work1@testmail.com',
            
        }
        const pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.workEmails).to.be.deepEqual(["work1@testmail.com"]);

        pimContact.workEmails = ['work2@testmail.com'];
        expect(pimContact.workEmails).to.be.deepEqual(['work2@testmail.com']);
    });
 
    it('homeEmail of contact', () => {
        const contactObject: any = {
            'home1email': 'home1@testmail.com',
            
        }
        const pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.homeEmails).to.be.deepEqual(["home1@testmail.com"]);

        pimContact.homeEmails = ['home2@testmail.com'];
        expect(pimContact.homeEmails).to.be.deepEqual(['home2@testmail.com']);
    });
   
    it('otherEmail of contact', () => {
        const contactObject: any = {
            'email_other': 'other1@testmail.com',
            
        }
        const pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.otherEmails).to.be.deepEqual(["other1@testmail.com"]);

        pimContact.otherEmails = ['other2@testmail.com'];
        expect(pimContact.otherEmails).to.be.deepEqual(['other2@testmail.com']);
    });

    it('officePhone of contact', () => {
        const contactObject: any = {
            'OfficePhoneNumber': '999-111-1111'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.officePhone).to.be.eql('999-111-1111');

        pimContact.officePhone = '999-111-1112';
        expect(pimContact.officePhone).to.be.eql('999-111-1112');

        contactObject.OfficePhoneNumber = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.officePhone).to.be.undefined();
    });

    it('homePhone of contact', () => {
        const contactObject: any = {
            'HomePhone': '08041970909'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.homePhone).to.be.eql('08041970909');

        pimContact.homePhone = '08041970808';
        expect(pimContact.homePhone).to.be.eql('08041970808');

        contactObject.HomePhone = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.homePhone).to.be.undefined();
    });

    it('cellPhone of contact', () => {
        const contactObject: any = {
            'CellPhone': '9876543333'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        // expect(pimContact.cellPhone).to.be.eql('9876543333');

        pimContact.cellPhone = '9876543331';
        expect(pimContact.cellPhone).to.be.eql('9876543331');

        contactObject.CellPhoneNumber = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.cellPhone).to.be.undefined();
    });

    it('officeFaxNumber', () => {
        const contactObject: any = {
            'OfficeFAXPhoneNumber':'999-555-1111'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.officeFax).to.be.equal('999-555-1111');

        pimContact.officeFax = '999-555-1112';
        expect(pimContact.officeFax).to.be.eql('999-555-1112');

        contactObject.OfficeFAXPhoneNumber = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.officeFax).to.be.undefined();
    });

    it('homeFaxNumber', () => {
        const contactObject: any = {
            'HomeFAXPhoneNumber':'999-333-1111'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.homeFax).to.be.equal('999-333-1111');

        pimContact.homeFax = '999-333-1112';
        expect(pimContact.homeFax).to.be.eql('999-333-1112');

        contactObject.HomeFAXPhoneNumber = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.homeFax).to.be.undefined();
    });
    
    it('otherPhones', () => {
        const contactObject: any = {
            'PhoneNumber_otherPhones':'234-444-3331'
        }

        const pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.otherPhones).to.be.deepEqual(['234-444-3331']);

        pimContact.otherPhones = ['234-444-3332'];
        expect(pimContact.otherPhones).to.be.deepEqual(['234-444-3332']);
    });

    it('officeAddress', () =>{
        const contactObject: any = {
            'OfficeStreetAddress':'98 Business St',
            'OfficeCity': 'Raleigh',
            'OfficeState': 'NC',
            'OfficeCountry': 'USA',
            'OfficeZIP': '27765',
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        
        expect(pimContact.officeAddress?.Street).to.be.equal('98 Business St');

        expect(pimContact.officeAddress?.City).to.be.equal('Raleigh');

        expect(pimContact.officeAddress?.State).to.be.equal('NC');

        expect(pimContact.officeAddress?.Country).to.be.equal('USA');

        expect(pimContact.officeAddress?.PostalCode).to.be.equal('27765');

        const pimAddress = new PimAddress();
        pimAddress.Street = 'Cedar Boulevard';
        pimAddress.City = 'Newark';
        pimAddress.State = 'CA';
        pimAddress.Country = 'US';
        pimAddress.PostalCode = '94560';
        pimContact.officeAddress = pimAddress;
        expect(pimContact.officeAddress).to.be.deepEqual(pimAddress);

        pimContact = PimItemFactory.newPimContact({}, PimItemFormat.DOCUMENT);
        expect(pimContact.officeAddress).to.be.undefined();
    });

    it('homeAddress', () =>{
        const contactObject: any = {
            'HomeStreetAddress':'99 Business St',
            'HomeCity': 'Raleigh',
            'HomeState': 'NC',
            'HomeCountry': 'USA',
            'HomeZip': '27765',
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
       
        expect(pimContact.homeAddress?.Street).to.be.equal('99 Business St');

        expect(pimContact.homeAddress?.City).to.be.equal('Raleigh');

        expect(pimContact.homeAddress?.State).to.be.equal('NC');

        expect(pimContact.homeAddress?.Country).to.be.equal('USA');

        expect(pimContact.homeAddress?.PostalCode).to.be.equal('27765');

        const pimAddress = new PimAddress();
        pimAddress.Street = 'Cedar Boulevard';
        pimAddress.City = 'Newark';
        pimAddress.State = 'CA';
        pimAddress.Country = 'US';
        pimAddress.PostalCode = '94560';
        pimContact.homeAddress = pimAddress;
        expect(pimContact.homeAddress).to.be.deepEqual(pimAddress);

        pimContact = PimItemFactory.newPimContact({}, PimItemFormat.DOCUMENT);
        expect(pimContact.homeAddress).to.be.undefined();
    });

    it('otherAddress', () =>{
        const contactObject: any = {
            'OtherStreetAddress':'Cedar Boulevard',
            'OtherCity': 'Newark',
            'OtherState': 'CA',
            'OtherCountry': 'USA',
            'OtherZip': '94560',
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        
        expect(pimContact.otherAddress?.Street).to.be.equal('Cedar Boulevard');
        
        expect(pimContact.otherAddress?.City).to.be.equal('Newark');

        expect(pimContact.otherAddress?.State).to.be.equal('CA');

        expect(pimContact.otherAddress?.Country).to.be.equal('USA');

        expect(pimContact.otherAddress ?.PostalCode).to.be.equal('94560');

        const pimAddress = new PimAddress();
        pimAddress.Street = '99 Business St';
        pimAddress.City = 'Raleigh';
        pimAddress.State = 'NC';
        pimAddress.Country = 'US';
        pimAddress.PostalCode = '27765';
        pimContact.otherAddress = pimAddress;
        expect(pimContact.otherAddress).to.be.deepEqual(pimAddress);

        pimContact = PimItemFactory.newPimContact({}, PimItemFormat.DOCUMENT);
        expect(pimContact.otherAddress).to.be.undefined();
    });


    it('Department', () => {
        const contactObject: any = {
            'Department':'research'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.department).to.be.equal('research');

        pimContact.department = 'development';
        expect(pimContact.department).to.be.eql('development');

        contactObject.Department = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.department).to.be.undefined();
    });

    it('Location', () => {
        const contactObject: any = {
            'Location':'Bangalore'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.location).to.be.eql('Bangalore');

        pimContact.location = 'Delhi';
        expect(pimContact.location).to.be.eql('Delhi');

        contactObject.Location = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.location).to.be.undefined();
    });

    it('Birthday', () => {
        const contactObject: any = {
            'Birthday':'1991-12-25T11:00:00.000Z'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.birthday).to.be.eql(new Date('1991-12-25T11:00:00.000Z'));

        const birthDate = new Date();
        pimContact.birthday = birthDate;
        expect(pimContact.birthday).to.be.eql(birthDate);

        contactObject.Birthday = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.birthday).to.be.undefined();
    });

    it('AnniversaryDate', () => {
        const contactObject: any = {
            'Anniversary':'1991-12-26T11:00:00.000Z'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.anniversary).to.be.eql(new Date('1991-12-26T11:00:00.000Z'));

        const anniversaryDate = new Date();
        pimContact.anniversary = anniversaryDate;
        expect(pimContact.anniversary).to.be.eql(anniversaryDate);

        contactObject.Anniversary = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.anniversary).to.be.undefined();
    });

    it('Homepage', () => {
        const contactObject: any = {
            'WorkUrl':'index@test.com'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.homepage).to.be.eql('index@test.com');

        pimContact.homepage = 'welcome@test.com';
        expect(pimContact.homepage).to.be.eql('welcome@test.com');

        contactObject.WorkUrl = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.homepage).to.be.undefined();
    });

    it('imAddress', () => {
        let contactObject: any = {
            'SametimeLogin':'index@test.com'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.imAddresses).to.be.deepEqual(['index@test.com']);

        pimContact.imAddresses = ['welcome@test.com'];
        expect(pimContact.imAddresses).to.be.deepEqual(['welcome@test.com']);

        contactObject["SametimeLogin"] = ["index1@test.com", "index2@test.com", "index3@test.com"];
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.imAddresses).to.be.an.Array();

        contactObject = {};
        pimContact = PimItemFactory.newPimContact(contactObject,PimItemFormat.DOCUMENT);
        expect(pimContact.imAddresses).to.be.eql([]);
    });

    it('PhotoURL', () => {
        const contactObject: any = {
            'PhotoURL':'photourl'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.photoURL).to.be.eql('photourl');

        pimContact.photoURL = 'phurl';
        expect(pimContact.photoURL).to.be.eql('phurl');

        contactObject.PhotoURL = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.photoURL).to.be.undefined();
    });

    it('Photo', () => {
        const contactObject: any = {
            'Photo':'photo'
        }

        let pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.photo).to.be.eql('photo');

        pimContact.photo = 'ph';
        expect(pimContact.photo).to.be.eql('ph');

        contactObject.Photo = undefined;
        pimContact = PimItemFactory.newPimContact(contactObject, PimItemFormat.DOCUMENT);
        expect(pimContact.photo).to.be.undefined();
    });
});