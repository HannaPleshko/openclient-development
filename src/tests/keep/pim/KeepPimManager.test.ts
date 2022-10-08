/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect, sinon } from '@loopback/testlab';
import { KeepPimManager, PimItemFactory, PimItemFormat, PimSearchQuery } from '../../../keep';
import { KeepPim } from '../../../services';
import { createObjectFromFile, setupTransportManagerStub, setupUserManagerEmptyTokenStub, setupUserManagerStub } from '../../test-helper';


describe('KeepPimManager tests', function(){

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

    it('getPimItem success',async function() {
        const unid = "123" ;

        const pimMessage = createObjectFromFile('message.json');
        keepPimStub.getPimItem.resolves(pimMessage);
        
        const expectedUid = "77DB4C5F5B324B61002586B600631C08";
        const item = await KeepPimManager.getInstance().getPimItem(expectedUid, userInfo);
        expect(item).to.not.be.undefined(); 
        expect(item!.unid).to.be.equal(expectedUid);
     
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try{
            await KeepPimManager.getInstance().getPimItem(unid,userInfo);
        }
        catch(error) {
            const err: any = error;
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    })

    it('getPimItem calendar success',async function() {
        const unid = "123" ;

        const pimMessage = createObjectFromFile('calendarItem.json');
        keepPimStub.getPimItem.resolves(pimMessage);
        
        const expectedUid = pimMessage["uid"];
        const item = await KeepPimManager.getInstance().getPimItem(expectedUid, userInfo);
        expect(item).to.not.be.undefined(); 
        expect(item!.unid).to.be.equal(expectedUid);
     
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try{
            await KeepPimManager.getInstance().getPimItem(unid,userInfo);
        }
        catch(error) {
            const err: any = error;
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    })

    it('getPimItem task success',async function() {
        const unid = "123" ;

        const pimTask = createObjectFromFile('task.json');
        keepPimStub.getPimItem.resolves(pimTask);
        
        const expectedUid = pimTask["uid"];
        const item = await KeepPimManager.getInstance().getPimItem(expectedUid, userInfo);
        expect(item).to.not.be.undefined(); 
        expect(item!.unid).to.be.equal(expectedUid);
     
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try{
            await KeepPimManager.getInstance().getPimItem(unid,userInfo);
        }
        catch(error){
            const err: any = error;
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    })

    it('getPimItem contact success',async function() {
        const unid = "123" ;

        const pimMessage = createObjectFromFile('contact.json');
        keepPimStub.getPimItem.resolves(pimMessage);
        
        const expectedUid = pimMessage["@unid"];
        const item = await KeepPimManager.getInstance().getPimItem(expectedUid, userInfo);
        expect(item).to.not.be.undefined(); 
        expect(item!.unid).to.be.equal(expectedUid);
     
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try{
            await KeepPimManager.getInstance().getPimItem(unid,userInfo);
        }
        catch(error){
            const err: any = error;
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    })

    it('getPimItem note success',async function() {
        const unid = "123" ;

        const pimMessage = createObjectFromFile('note.json');
        keepPimStub.getPimItem.resolves(pimMessage);
        
        const expectedUid = pimMessage["@unid"];   
        const item = await KeepPimManager.getInstance().getPimItem(expectedUid, userInfo);
        expect(item).to.not.be.undefined(); 
        expect(item!.unid).to.be.equal(expectedUid);
     
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try{
            await KeepPimManager.getInstance().getPimItem(unid,userInfo);
        }
        catch(error){
            const err: any = error;
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    })

    it('getPimItem label success',async function() {
        const unid = "123" ;

        const pimMessage = createObjectFromFile('label.folder.json');
        keepPimStub.getPimItem.resolves(pimMessage);
        
        const expectedUid = pimMessage["@unid"]; 
        const item = await KeepPimManager.getInstance().getPimItem(expectedUid, userInfo);
        expect(item).to.not.be.undefined(); 
        expect(item!.unid).to.be.equal(expectedUid);
     
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try{
            await KeepPimManager.getInstance().getPimItem(unid,userInfo);
        }
        catch(error){
            const err: any = error;
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    })

    it("getPimItem failed", async function() {
        const unid = "123";
        const error = new Error("getPimItem Failed");

        keepPimStub.getPimItem.rejects(error);
        await expect(KeepPimManager.getInstance().getPimItem(unid,userInfo)).to.be.rejectedWith(error);
    });

    it('updatePimItem success',async function(){

       const unid = "1234" ;
        const updateResult = { 
            "statusText": "OK", 
            "status": 200, 
            "message": "update complete", 
            "unid": unid
        }

        keepPimStub.updatePimItem.resolves(updateResult);
        const pimItem = PimItemFactory.newPimMessage(createObjectFromFile('message.json'), PimItemFormat.DOCUMENT);

        const results = await KeepPimManager.getInstance().updatePimItem(unid,userInfo,pimItem)
        expect(results.status).to.be.equal(200);
        expect(results.unid).to.be.equal(unid);

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try{
            await KeepPimManager.getInstance().updatePimItem(unid,userInfo,pimItem);
        }
        catch(error){
            const err: any = error;
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('updatePimItem failed', async function() {
       const unid = "1234" ;
       const pimItem =  PimItemFactory.newPimMessage(createObjectFromFile('message.json'), PimItemFormat.DOCUMENT);

       const error = new Error('updatePimItem failed');
       keepPimStub.updatePimItem.rejects(error);
       await expect(KeepPimManager.getInstance().updatePimItem(unid,userInfo,pimItem)).to.be.rejectedWith(error);
    });

    it('search success', async function() {

        const query = new PimSearchQuery(); 
        query.type = "DQL"
        query.query = "Subject contains ('deleted')";
        
        const pimMessage = createObjectFromFile('message.json');
        const results: any = 
        {
        "count": 1,
        "result": [ pimMessage ]
        };
        
        keepPimStub.search.resolves(results);
        const searchResults = await KeepPimManager.getInstance().search(userInfo,query);
        expect(Array.isArray(searchResults)).to.be.true(); 
        expect(searchResults.length).to.be.equal(1);
        expect(searchResults[0].unid).to.be.equal(pimMessage["@unid"]);
        expect(searchResults[0].subject).to.be.equal(pimMessage.Subject);
        
        sinon.restore();
        keepPimStub = setupTransportManagerStub();
        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try{
           await KeepPimManager.getInstance().search(userInfo,query);
        }
        catch(error){
            const err: any = error;
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('search failed', async function(){
        const query = new PimSearchQuery(); 
        query.type = "DQL"
        query.query = "Subject contains ('deleted')";

        const error = new Error('search failed');
        keepPimStub.search.rejects(error);
        await expect(KeepPimManager.getInstance().search(userInfo,query)).to.be.rejectedWith(error);
    });

    it("getAvatar success", async function() {
        const response = {
            statusText: "OK",
            status: 200,
            headers: {
                'content-type': 'image/png',
            },
            body: Buffer.from('test'),
        }
        keepPimStub.getAvatar.resolves(response);

        const result = await KeepPimManager.getInstance().getAvatar(userInfo, "test@test.com");
        expect(result).to.be.equal(response);

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        
        let errMessage: string | undefined;
        try {
            await KeepPimManager.getInstance().getAvatar(userInfo, "test@test.com");
        }
        catch (error) {
            const err: any = error;
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('getAvatar failed', async function() {
        const error = new Error("getAvatar fails");
        keepPimStub.getAvatar.rejects(error);

        await expect(KeepPimManager.getInstance().getAvatar(userInfo, "test@test.com")).to.be.rejectedWith(error);
    });

});