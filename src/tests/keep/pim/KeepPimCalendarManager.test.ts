import { expect, sinon } from '@loopback/testlab';
import { KeepPimCalendarManager, OOOState, PimOOO } from '../../../keep';
import { PimCalendarItem } from '../../../keep/pim/jmap/PimCalendarItem';
import { KeepPim } from '../../../services';
import { createObjectFromFile, setupTransportManagerStub, setupUserManagerEmptyTokenStub, setupUserManagerStub } from '../../test-helper';

describe('KeepPimCalendarManager tests', function() {
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

    it('getCalendars user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimCalendarManager.getInstance().getCalendars(userInfo);
        }
        catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('getCalendars success', async function () {
        const calendar: any = {
            "default": {
                "CN=Bert Muppet/O=ProjectKeep": "MANAGER"
            },
            "Team Calendar": {
                "CN=Bert Muppet/O=ProjectKeep": "MANAGER"
            }
        }
        keepPimStub.getCalendars.resolves(calendar); 

        const results = await KeepPimCalendarManager.getInstance().getCalendars(userInfo, "mailboxId");
        expect(results.length).to.be.equal(2);
    });
    
    it('getCalendarItems user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimCalendarManager.getInstance().getCalendarItems("calName",userInfo);
        }
        catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('getCalendarItems success', async function () {
        const calendar = createObjectFromFile("calendarItem.json");
        keepPimStub.getCalendarEntries.resolves(calendar); 
       
        const results = await KeepPimCalendarManager.getInstance().getCalendarItems("calName",userInfo);
        expect(results.length).to.be.equal(1);
    });

    it('getCalendarItem user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimCalendarManager.getInstance().getCalendarItem("itemId","calName",userInfo);
        }
        catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });
   
    it('getCalendarItem error', async function() {
        const error = new Error("No unid for calendar item");
        keepPimStub.getCalendarEntry.rejects(error);

        await expect(KeepPimCalendarManager.getInstance().getCalendarItem("itemId","calName",userInfo, "mailboxId")).to.be.rejectedWith(error);
    });


    it('getCalendarItem success', async function() {
        const calendar = createObjectFromFile("calendarItem.json");
        keepPimStub.getCalendarEntry.resolves(calendar);

        const results = await KeepPimCalendarManager.getInstance().getCalendarItem("itemId","calName",userInfo, "mailboxId");
        expect(results?.unid).to.be.equal(calendar.uid);
    });
    
    it('createCalendarItem user access token', async function () {
        const item = new PimCalendarItem({},"calName");
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimCalendarManager.getInstance().createCalendarItem(item,userInfo);
        }
        catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

     it('createCalendarItem success', async function () {
       const createResponse = {
            "statusText": "OK",
            "status": 200,
            "message": "creation complete B837018C6E549346002586F50055019A",
            "unid": "B837018C6E549346002586F50055019A"
        }
        const calendar = createObjectFromFile("calendarItem.json");
        const item = new PimCalendarItem(calendar,"calName");
            
        keepPimStub.createCalendarItem.resolves(createResponse);
        const results = await KeepPimCalendarManager.getInstance().createCalendarItem(item,userInfo,true,"mailboxId");
        expect(results).to.be.equal(calendar["uid"]);
    });

    it('modifyCalendarItem user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimCalendarManager.getInstance().modifyCalendarItem("calid","calentryid","updates", userInfo);
        }
        catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('modifyCalendarItem success', async function () {
        const calendar = {
            "Calendar Entry Status": "Updated calendar entry",
            "calendarEntries": {
            "STARTDATETIME": "2021-07-16T03:00:00.000Z",
            "CalendarDateTime": "2021-07-16T03:00:00.000Z",
            "EndDateTime": "2021-07-16T04:00:00.000Z"
            }
        };
        keepPimStub.modifyCalendarItem.resolves(calendar); 
       

        const results = await KeepPimCalendarManager.getInstance().modifyCalendarItem("calid","calentryid","updates", userInfo);
        expect(results.calendarEntries).to.not.be.undefined();
    });

    it('getOOO user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimCalendarManager.getInstance().getOOO("userid", userInfo, "mailboxid");
        }
        catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('getOOO success', async function () {
        const ooo = {
            "StartDateTime": "2021-09-03T12:00:00Z",
            "EndDateTime": "2021-09-09T09:00:00Z",
            "ExcludeInternet": true,
            "Enabled": false,
            "SystemType": null,
            "SystemState": false,
            "GeneralSubject": "I am out of the office and ...",
            "GeneralMessage": "I am out of the office and will not be checking email while I am out"
        }
        keepPimStub.getOOO.resolves(ooo); 

        const results = await KeepPimCalendarManager.getInstance().getOOO("userid", userInfo, "mailboxid");
        expect(results?.state).to.be.equal(OOOState.DISABLED);
        expect(results?.replyMessage).to.be.not.undefined();
    });

    it('updateOOO user access token', async function () {
        const settings = new PimOOO({});
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimCalendarManager.getInstance().updateOOO(settings , userInfo, "mailboxid");
        }
        catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('updateOOO success', async function () {
        const oooUpdate = {
            "StartDateTime": "2021-09-03T12:00:00Z",
            "EndDateTime": "2021-09-09T09:00:00Z",
            "ExcludeInternet": true,
            "Enabled": true,
            "SystemType": null,
            "SystemState": false,
            "GeneralSubject": "I am out of the office",
            "GeneralMessage": "I am out of the office and will not be checking email while I am out"
        }
        keepPimStub.updateOOO.resolves(oooUpdate); 
        const settings = new PimOOO(oooUpdate);
       
        const results = await KeepPimCalendarManager.getInstance().updateOOO(settings , userInfo, "mailboxid");
        expect(results.state).to.be.equal(OOOState.SCHEDULED);
    });

    it('deleteCalendarItem success without hard delete', async function () {
        const unid = "B837018C6E549346002586F50055019A";
        const deleteResponse = {
            "statusText": "OK",
            "status": 200,
            "message": "deletion complete",
            "unid": unid
        }
        keepPimStub.deleteCalendarItem.resolves(deleteResponse);

        const results = await KeepPimCalendarManager.getInstance().deleteCalendarItem("calName","itemId", userInfo);
        expect(results.unid).to.be.equal(unid);
        expect(results.status).to.be.equal(200);
    });

    it('deleteCalendarItem success with hard delete', async function () {
        const calendarHardDelete = {
            "statusText": "OK",
            "status": 200,
            "message": "Document permanently deleted: E78A9910A5826D90002586F00075145F"
        }
        keepPimStub.deleteItemFromTrash.resolves(calendarHardDelete);
      
        const results = await KeepPimCalendarManager.getInstance().deleteCalendarItem("calName","itemId",userInfo, true);
        expect(results.status).to.be.equal(200);
    });

    it('deleteCalendarItem user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimCalendarManager.getInstance().deleteCalendarItem("calName","itemId",userInfo);
        }
        catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });
});
