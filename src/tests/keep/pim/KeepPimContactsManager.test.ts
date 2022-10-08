import { expect, sinon } from '@loopback/testlab';
import { KeepPimContactsManager, PimItemFactory, PimItemFormat } from '../../../keep';
import { KeepPim } from '../../../services';
import { createObjectFromFile, setupTransportManagerStub, setupUserManagerEmptyTokenStub, setupUserManagerStub } from '../../test-helper';

describe('KeepPimContactsManager tests', function() {
    const userInfo = { userId: "test", password: "tst" };
    let keepPimStub: sinon.SinonStubbedInstance<KeepPim>;

    beforeEach(() => {
        // Stub for transport manager
        keepPimStub = setupTransportManagerStub();
    
        // Stub for authentication call
        setupUserManagerStub(); 
    });
    
    afterEach(() => {
        // Cleanup stubs
        sinon.restore();
    });

    it("getContacts success", async function() {

        const contactObjects = createObjectFromFile('contact.list.document.json');
        keepPimStub.getMessages.resolves(contactObjects);
     
        const results = await KeepPimContactsManager.getInstance().getContacts(userInfo, true, undefined, undefined, "test");
        expect(results.length).to.be.equal(contactObjects.length);
        
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try{
            await KeepPimContactsManager.getInstance().getContacts(userInfo);
        }
        catch(err){
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('getContacts failed', async function() {
        const error = new Error("getContacts fails");
        keepPimStub.getContactEntries.rejects(error);

        await expect(KeepPimContactsManager.getInstance().getContacts(userInfo)).to.be.rejectedWith(error);
    });

    it("lookupContacts success", async function() {

        const contactObjects = createObjectFromFile('contact.list.document.json');
        keepPimStub.lookupContactEntries.resolves(contactObjects);
     
        const results = await KeepPimContactsManager.getInstance().lookupContacts(userInfo, "test");
        expect(results.length).to.be.equal(contactObjects.length);
        
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try{
            await KeepPimContactsManager.getInstance().lookupContacts(userInfo, "test");
        }
        catch(err){
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('lookupContacts failed', async function() {
        const error = new Error("lookupContacts fails");
        keepPimStub.lookupContactEntries.rejects(error);

        await expect(KeepPimContactsManager.getInstance().lookupContacts(userInfo, "test")).to.be.rejectedWith(error);
    });

    it('getContact success', async function() {

        const contactObjects = createObjectFromFile('contact.json');
        
        keepPimStub.getContactEntry.resolves(contactObjects)
        const results = await KeepPimContactsManager.getInstance().getContact("testid",userInfo);
        expect(results?.unid).to.be.equal(contactObjects["@unid"])

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try{
            await KeepPimContactsManager.getInstance().getContact("testid",userInfo);
        }
        catch(err){
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    })

    it('getContact failed', async function() {
        const unid = "8CE7525EDE588D7F002586EF004389D0";
        const error = new Error("getContact fails");
        keepPimStub.getContactEntry.rejects(error);

        await expect(KeepPimContactsManager.getInstance().getContact(unid,userInfo)).to.be.rejectedWith(error);
    })

    it('createContact success',async function() {
        const createContact = {
            "statusText": "OK",
            "status": 200,
            "message": "creation complete",
            "unid": "8CE7525EDE588D7F002586EF004389D0"
        };
        keepPimStub.createContactEntry.resolves(createContact);
        
        const pimContact = PimItemFactory.newPimContact({}, PimItemFormat.DOCUMENT);
            
        const results = await KeepPimContactsManager.getInstance().createContact(pimContact,userInfo);
        expect(results).to.be.equal(createContact.unid);

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try{
            await KeepPimContactsManager.getInstance().createContact(pimContact,userInfo);
        }
        catch(err){
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');


    });

    it('createContact failed',async function() {
        const pimContact = PimItemFactory.newPimContact({}, PimItemFormat.DOCUMENT);

        const error = new Error("createContactEntry fails");
        keepPimStub.createContactEntry.rejects(error);

        await expect(KeepPimContactsManager.getInstance().createContact(pimContact,userInfo)).to.be.rejectedWith(error);
    });

    it("updateContact success", async function() {

        const pimContact = PimItemFactory.newPimContact({ "@unid": "69D93138451B7EFA0025869B006176BD", "DisplayName": "UnitTest" }, PimItemFormat.DOCUMENT);
        const updateContact = {
            "statusText": "OK",
            "status": 200,
            "message": "update complete",
            "unid": pimContact.unid
        }
        keepPimStub.updateContactEntry.resolves(updateContact);

        const result = await KeepPimContactsManager.getInstance().updateContact(pimContact,userInfo)
        expect(result.status).to.be.equal(200);
        expect(result.unid).to.be.equal(pimContact.unid);

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try{
            await KeepPimContactsManager.getInstance().updateContact(pimContact,userInfo);
        }
        catch(err){
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    })
    it("updateContact failed", async function() {
        const pimContact = PimItemFactory.newPimContact({ "@unid": "69D93138451B7EFA0025869B006176BD", "DisplayName": "UnitTest" }, PimItemFormat.DOCUMENT);

        const error = new Error("updateContact fails");
        keepPimStub.updateContactEntry.rejects(error);

        await expect(KeepPimContactsManager.getInstance().updateContact(pimContact,userInfo)).to.be.rejectedWith(error);
    })

    it('deleteContactEntry', async function() {
        const unid = "8CE7525EDE588D7F002586EF004389D0";
        const deleteContact  = {
            "statusText": "OK",
            "status": 200,
            "message": "deletion complete",
            "unid": unid
        }

        keepPimStub.deleteContactEntry.resolves(deleteContact);
        const results = await KeepPimContactsManager.getInstance().deleteContact(unid,userInfo);       
        expect(results.status).to.be.equal(200);
        expect(results.unid).to.be.equal(unid);

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try{
            await KeepPimContactsManager.getInstance().deleteContact(unid,userInfo);
        }
        catch(err){
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');

    });

    it('deleteItemFromTrash', async function() {
        const deleteContact  = {
            "statusText": "OK",
            "status": 200,
            "message": "deletion complete",
        }

        keepPimStub.deleteItemFromTrash.resolves(deleteContact);
        const results = await KeepPimContactsManager.getInstance().deleteContact("testid",userInfo,true);       
        expect(results.status).to.be.equal(200);

    });

    it('deleteContact failed', async function() {

        const error = new Error("createContactEntry fails");
        keepPimStub.deleteContactEntry.rejects(error);

        await expect(KeepPimContactsManager.getInstance().deleteContact("testid",userInfo)).to.be.rejectedWith(error);
    });
})