import { expect, sinon } from '@loopback/testlab';
import { KeepMoveMessagesResults, KeepPimBaseResults, KeepPimConstants, KeepPimMessageManager, PimItemFactory, PimItemFormat, PimReceiptType } from "../../../keep";
import { KeepPim } from '../../../services';
import { setupTransportManagerStub, setupUserManagerStub, setupUserManagerEmptyTokenStub, createObjectFromFile } from "../../test-helper";

describe('KeepPimMessageManager tests', function () {
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

    it('getReceiptsParameter', async function () {
        // getReceiptsParameter(receipts: PimReceiptType[] | undefined): string | undefined {

        let results = KeepPimMessageManager.getInstance().getReceiptsParameter(undefined);
        expect(results).to.be.undefined();

        let receiptTypes: PimReceiptType[] = [];
        results = KeepPimMessageManager.getInstance().getReceiptsParameter(receiptTypes);
        expect(results).to.be.undefined();

        receiptTypes = [PimReceiptType.DELIVERY];
        results = KeepPimMessageManager.getInstance().getReceiptsParameter(receiptTypes);
        expect(results).to.be.equal("deliver");

        receiptTypes = [PimReceiptType.READ];
        results = KeepPimMessageManager.getInstance().getReceiptsParameter(receiptTypes);
        expect(results).to.be.equal("read");

        receiptTypes = [PimReceiptType.READ, PimReceiptType.DELIVERY];
        results = KeepPimMessageManager.getInstance().getReceiptsParameter(receiptTypes);
        expect(results).to.be.equal("read,deliver");

        receiptTypes = [PimReceiptType.DELIVERY, PimReceiptType.READ, ];
        results = KeepPimMessageManager.getInstance().getReceiptsParameter(receiptTypes);
        expect(results).to.be.equal("deliver,read");

    });

    it('deleteMessage', async function(){
        const obj = {
            "statusText": "OK",
            "status": 200,
            "message": "deletion complete",
            "unid": "22D137087F7C1245002586CE004AD010"
        }

        keepPimStub.deleteMessage.resolves(obj);
        const results = await KeepPimMessageManager.getInstance().deleteMessage(userInfo,'testId')
        expect(results).to.not.be.undefined();
    });

    it('deleteMessage user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimMessageManager.getInstance().deleteMessage(userInfo,'testId', 'mailboxId');
        } catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('deleteMessage with hard delete', async function(){
        const obj = {
            "statusText": "OK",
            "status": 200,
            "message": "deletion complete",
            "unid": "22D137087F7C1245002586CE004AD010"
        }

        keepPimStub.deleteItemFromTrash.resolves(obj);
        const results = await KeepPimMessageManager.getInstance().deleteMessage(userInfo,'testId', 'mailboxId', true);
        expect(results).to.be.eql(obj);
    });


    it('createMessage user access token', async function () {
        const pimMessage = PimItemFactory.newPimMessage({});
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimMessageManager.getInstance().createMessage(userInfo, pimMessage , true, "mailboxId");
        } catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('createMessage success', async function () {  
        const pimMessage = PimItemFactory.newPimMessage({});
        const messages = {
            "statusText": "OK",
            "status": 200,
            "message": "Created a draft",
            "unid": "E2DD580859BE6C420025871100458889"
        }
   
        keepPimStub.createMessage.resolves(messages);
            
        const results = await KeepPimMessageManager.getInstance().createMessage(userInfo, pimMessage , true, "mailboxId");
        expect(results).to.be.equal(messages.unid);
    });

    it('createMessage failure', async function () {  
        const pimMessage = PimItemFactory.newPimMessage({});
        const messages = {
            "statusText": "error",
            "status": 502,
            "message": "Cannot create message",
        }
   
        keepPimStub.createMessage.resolves(messages);
       
        await expect(KeepPimMessageManager.getInstance().createMessage(userInfo, pimMessage , true, "mailboxId")).to.be.rejectedWith({ message: 'Cannot create message', status: 502 });
    });

    it('createMimeMessage user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimMessageManager.getInstance().createMimeMessage(userInfo, "base64MimeMessage" , false, undefined, "mailboxId");
        } catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('createMimeMessage success', async function () {  
        const messages = {
            "statusText": "OK",
            "status": 200,
            "message": "Created a draft",
            "unid": "E2DD580859BE6C420025871100458889"
        }
   
        keepPimStub.createMimeMessage.resolves(messages);
            
        const results = await KeepPimMessageManager.getInstance().createMimeMessage(userInfo, "base64MimeMessage" , true, undefined, "mailboxId");
        expect(results).to.be.equal(messages.unid);
    });

    it('createMimeMessage failure', async function () {  
        const messages = {
            "statusText": "error",
            "status": 502,
            "message": "Cannot create message",
        }
   
        keepPimStub.createMimeMessage.resolves(messages);
       
        await expect(KeepPimMessageManager.getInstance().createMimeMessage(userInfo, "base64MimeMessage" , true, undefined, "mailboxId")).to.be.rejectedWith({ message: 'Cannot create message', status: 502 });
    });

     it('updateMessageData success', async function () {
        const messages = {
            "Unread On": "Documents that were marked unread: 1"
        }
        keepPimStub.updatePimItem.resolves(messages);
        keepPimStub.updateMessageFlags.resolvesThis();
        
        const pimItem =  PimItemFactory.newPimMessage(messages, PimItemFormat.DOCUMENT);

        const results = await KeepPimMessageManager.getInstance().updateMessageData(pimItem, userInfo);
        expect(results['Unread On']).to.be.equal(messages['Unread On']);
    });

    it('updateMessageFlags success', async function () {
        const messages = {
            "Unread Off": "Documents that were marked read: 1"
        }

        keepPimStub.updateMessageFlags.resolves(messages);
        
        const pimItem =  PimItemFactory.newPimMessage(messages, PimItemFormat.DOCUMENT);
        const results = await KeepPimMessageManager.getInstance().updateMessageFlags(pimItem, userInfo);
        expect(results['Unread Off']).to.be.equal(messages['Unread Off']);
    });

    it('updateMessageFlagStructure user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimMessageManager.getInstance().updateMessageFlagStructure("flagStructure", userInfo , "mailboxId");
        } catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('updateMessageFlagStructure success', async function () {
        const messages = {
            "Quick Flag On": "Documents that were marked for Quick Flag: 1"
        }
        keepPimStub.updateMessageFlags.resolves(messages); 

        const results = await KeepPimMessageManager.getInstance().updateMessageFlagStructure("flagStructure", userInfo , "mailboxId");
        expect(results['Quick Flag On']).to.be.equal(messages['Quick Flag On']);
    });

    it('updateMimeMessage user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimMessageManager.getInstance().updateMimeMessage(userInfo , "messageId", "base64MimeMessage", true, "saveFolderId");
        } catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('updateMimeMessage success', async function () {
        const messagesFile = {
            "statusText": "OK",
            "status": 200,
            "message": "Created a draft",
            "unid": "F0FF2B4B7B83A1A7002587110047F18C"
        }
        keepPimStub.updateMimeMessage.resolves(messagesFile); 
       
        const results = await KeepPimMessageManager.getInstance().updateMimeMessage(userInfo, "messageId", "base64MimeMessage", true, "saveFolderId", [PimReceiptType.READ], "mailboxId");
        expect(results).to.be.equal(messagesFile.unid);
    });

    it('updateMimeMessage failure', async function () {  
        const messages = {
            "statusText": "error",
            "status": 502,
            "message": "Cannot create message",
        }
   
        keepPimStub.updateMimeMessage.resolves(messages);
       
        await expect(KeepPimMessageManager.getInstance().updateMimeMessage(userInfo, "messageId", "base64MimeMessage", true, "saveFolderId", [PimReceiptType.READ], "mailboxId")).to.be.rejectedWith({ message: 'Cannot create message', status: 502 });
    });

    it('getMimeMessage user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimMessageManager.getInstance().getMimeMessage(userInfo , "messageId", "mailboxId");
        } catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('getMimeMessage success', async function () {
            const messages = createObjectFromFile("message.json");
            keepPimStub.getMimeMessage.resolves(messages); 
           
            const results = await KeepPimMessageManager.getInstance().getMimeMessage(userInfo , "$MessageID", "mailboxId");
            expect(results).to.be.equal(messages);
    });

    it('moveMessages user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimMessageManager.getInstance().moveMessages(userInfo , "labelId", undefined, undefined, undefined, undefined, "mailboxId");
        } catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('moveMessages moveId success', async function () {
        const toLabel = "F98381D592E3C0B80025869B0061759B";
        const messageToMove = "69D93138451B7EFA0025869B006176BD";

        const moveResults: KeepMoveMessagesResults = {
            "Move Status": `Successful move of 1 message to folder ${toLabel}`,
            "movedIds": [
                {
                    "statusText": "OK",
                    "status": 200,
                    "message": "move message successful",
                    "unid": messageToMove
                }
            ]
        };
        keepPimStub.moveMessages.resolves(moveResults); 

        const results = await KeepPimMessageManager.getInstance().moveMessages(userInfo , toLabel, [messageToMove]);
        expect(keepPimStub.moveMessages.calledWith(sinon.match.string, toLabel, {move:[messageToMove]})).to.be.true();
        expect(results).to.be.equal(moveResults);
    });

    it('moveMessages addId success', async function () {
        const toLabel = "F98381D592E3C0B80025869B0061759B";
        const messageToAdd = "69D93138451B7EFA0025869B006176BD";

        const addResults: KeepMoveMessagesResults = {
            "Add Status": `Successful addition of 1 message to folder ${toLabel}`,
            "addedIds": [
                {
                    "statusText": "OK",
                    "status": 200,
                    "message": "add folder successful",
                    "unid": messageToAdd
                }
            ]
        };
        keepPimStub.moveMessages.resolves(addResults); 

        const results = await KeepPimMessageManager.getInstance().moveMessages(userInfo , toLabel, undefined, [messageToAdd]);
        expect(keepPimStub.moveMessages.calledWith(sinon.match.string, toLabel, {add:[messageToAdd]})).to.be.true();
        expect(results).to.be.equal(addResults);
    });  
    
    it('moveMessages removeId success', async function () {
        const toLabel = "F98381D592E3C0B80025869B0061759B";
        const messageToRemove = "69D93138451B7EFA0025869B006176BD";

        const addResults: KeepMoveMessagesResults = {
            "Remove Status": `Successful removal of 1 message from folder ${toLabel}`,
            "removedIds": [
                {
                    "statusText": "OK",
                    "status": 200,
                    "message": "add folder successful",
                    "unid": messageToRemove
                }
            ]
        };
        keepPimStub.moveMessages.resolves(addResults); 

        const results = await KeepPimMessageManager.getInstance().moveMessages(userInfo , toLabel, undefined, undefined, [messageToRemove]);
        expect(keepPimStub.moveMessages.calledWith(sinon.match.string, toLabel, {remove:[messageToRemove]})).to.be.true();
        expect(results).to.be.equal(addResults);
    }); 
    
    it('moveMessages copyId success', async function () {
        const toLabel = "F98381D592E3C0B80025869B0061759B";
        const messageToCopy = "69D93138451B7EFA0025869B006176BD";

        const copyResults: KeepMoveMessagesResults = {
            "Copy Status": `Successful copy of 1 message to folder ${toLabel}`,
            "copiedIds": [
                {
                    "statusText": "OK",
                    "status": 200,
                    "message": "add folder successful",
                    "unid": messageToCopy
                }
            ]
        };
        keepPimStub.moveMessages.resolves(copyResults); 

        const results = await KeepPimMessageManager.getInstance().moveMessages(userInfo , toLabel, undefined, undefined, undefined, [messageToCopy]);
        expect(keepPimStub.moveMessages.calledWith(sinon.match.string, toLabel, {copy:[messageToCopy]})).to.be.true();
        expect(results).to.be.equal(copyResults);
    }); 

    it('getThread', async function(){
       
        const thread = [{'@unid': '123'}, {'@unid': '456'},{'@unid': '789'}]
        keepPimStub.getThread.resolves(thread);

        const result = await KeepPimMessageManager.getInstance().getThread(userInfo, "123");
        expect(result.unid).to.be.equal('123');
        const emailIds = thread.map(t => t['@unid']);
        expect(result.emailIds).to.be.eql(emailIds);

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try{
            await KeepPimMessageManager.getInstance().getThread(userInfo, "123");
        } catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('getMessages', async function () {    
        // Create a list of message objects to return from getPimItems
        const msgObjects: any[] = createObjectFromFile('message.list.document.json');
        
        // Add a task item to make sure it is not returned
        msgObjects.push(createObjectFromFile('task.json'));

        const pItems = msgObjects.map(mObj => {
            if(mObj["type"] === "jstask"){
                return PimItemFactory.newPimTask(mObj, PimItemFormat.DOCUMENT);
            }
            return PimItemFactory.newPimMessage(mObj, PimItemFormat.DOCUMENT);
        });

        const stub = sinon.stub(KeepPimMessageManager.getInstance(), "getPimItems");
        stub.resolves(pItems);
       
       const results = await KeepPimMessageManager.getInstance().getMessages(userInfo);
       expect(results).to.be.an.Array();     

       const tasks = results.filter(res => res.isPimTask())
       expect(tasks).to.be.eql([]);
                   
       const messages = results.filter(res => res.isPimMessage());
       expect(messages.length).to.be.equal(results.length);
        
    });

    describe('emptyTrash', function () {
        it('emptyTrash user access token', async function () {
            sinon.restore();
            keepPimStub = setupTransportManagerStub();
    
            setupUserManagerEmptyTokenStub();
            let errMessage: string | undefined;
            try {
                await KeepPimMessageManager.getInstance().emptyTrash(userInfo ,"mailboxId");
            } catch (error) {
                const err: any = error; 
                errMessage = err.message;
            }
            expect(errMessage).to.be.equal('User is unauthenticated');
        });
        
        it('success', async function () {
            const expectedResults: KeepPimBaseResults = {
                "statusText": "OK",
                "status": 200,
                "message": "files removed in trash: 6"
            }
            ;
            keepPimStub.emptyTrash.resolves(expectedResults);

            const results = await KeepPimMessageManager.getInstance().emptyTrash(userInfo);
            expect(results.status).to.be.equal(200);

        });

        it('fails', async function () {
            const error = new Error("empty trash fails");
            keepPimStub.emptyTrash.rejects(error);
            
            await expect(KeepPimMessageManager.getInstance().emptyTrash(userInfo)).to.be.rejectedWith(error);
        });
    });

    describe('deleteItemFromTrash', function () {
        it('deleteItemFromTrash user access token', async function () {
            sinon.restore();
            keepPimStub = setupTransportManagerStub();
    
            setupUserManagerEmptyTokenStub();
            let errMessage: string | undefined;
            try {
                await KeepPimMessageManager.getInstance().deleteItemFromTrash(userInfo, "unid", "mailboxId");
            } catch (error) {
                const err: any = error; 
                errMessage = err.message;
            }
            expect(errMessage).to.be.equal('User is unauthenticated');
        });

        it('success', async function () {
            const unid = "unit-test-id";
            const expectedResults: KeepPimBaseResults = {
                statusText: "OK",
                status: 200,
                message: `Documet permanently deleted: ${unid}`
            };
            keepPimStub.deleteItemFromTrash.resolves(expectedResults);

            const results = await KeepPimMessageManager.getInstance().deleteItemFromTrash(userInfo, unid);
            expect(results.status).to.be.equal(200);

        });

        it('fails', async function () {
            const unid = "unit-test-id";
            const error = new Error("delete fails");
            keepPimStub.deleteItemFromTrash.rejects(error);
            
            await expect(KeepPimMessageManager.getInstance().deleteItemFromTrash(userInfo, unid)).to.be.rejectedWith(error);
        });
    });


    describe('getPimItems', function() {
        
        const requestedMessages = [{"@unid":"1"}, {"@unid":"2"}];

        it('getInboxMessages',async function(){
            keepPimStub.getInboxMessages.resolves(requestedMessages);

            const results = await KeepPimMessageManager.getInstance().getPimItems(userInfo,KeepPimConstants.INBOX);
            
            for (let index = 0; index < results.length; index++) {
                expect(results[index].unid).to.be.equal(requestedMessages[index]["@unid"]);
            }

        });

        it('getDraftMessages',async function(){
            keepPimStub.getDraftMessages.resolves(requestedMessages);

            const results = await KeepPimMessageManager.getInstance().getPimItems(userInfo,KeepPimConstants.DRAFTS);
            
            for (let index = 0; index < results.length; index++) {
                expect(results[index].unid).to.be.equal(requestedMessages[index]["@unid"]);
            }

        });

        it('getSentMessages',async function(){
            keepPimStub.getSentMessages.resolves(requestedMessages);

            const results = await KeepPimMessageManager.getInstance().getPimItems(userInfo,KeepPimConstants.SENT);
            
            for (let index = 0; index < results.length; index++) {
                expect(results[index].unid).to.be.equal(requestedMessages[index]["@unid"]);
            }

        });

        it('getJunkMessages',async function(){
            keepPimStub.getJunkMessages.resolves(requestedMessages);

            const results = await KeepPimMessageManager.getInstance().getPimItems(userInfo,KeepPimConstants.JUNKMAIL);
            
            for (let index = 0; index < results.length; index++) {
                expect(results[index].unid).to.be.equal(requestedMessages[index]["@unid"]);
            }

        });

        it('getTrashMessages',async function(){
            keepPimStub.getTrashMessages.resolves(requestedMessages);

            const results = await KeepPimMessageManager.getInstance().getPimItems(userInfo,KeepPimConstants.TRASH);
            
            for (let index = 0; index < results.length; index++) {
                expect(results[index].unid).to.be.equal(requestedMessages[index]["@unid"]);
            }

        });

        it('userAccessToken', async function(){
            sinon.restore();
            keepPimStub = setupTransportManagerStub();
    
            setupUserManagerEmptyTokenStub();
            let errMessage: string | undefined;
            try{
                await KeepPimMessageManager.getInstance().getPimItems(userInfo);
            } catch (error) {
                const err: any = error; 
                errMessage = err.message;
            }
            expect(errMessage).to.be.equal('User is unauthenticated');
        });

        it('getMessages', async function() {
            keepPimStub.getMessages.resolves(requestedMessages);
            
            const results = await KeepPimMessageManager.getInstance().getPimItems(userInfo);
            for (let index = 0; index < results.length; index++) {
                expect(results[index].unid).to.be.equal(requestedMessages[index]["@unid"]);
            }
        });
        it ('hasMore', async function () {
            
            const messages: any[] = createObjectFromFile('message.list.document.json');
            expect(messages.length).to.be.equal(3);
            const contacts: any[] = createObjectFromFile('contact.list.document.json');
            expect(contacts.length).to.be.equal(2);
            const expectedOnCall1: any[] = [];
            expectedOnCall1.push(messages[0]);
            expectedOnCall1.push(contacts[0]);
            expectedOnCall1.push(messages[1]);
            expectedOnCall1.push(contacts[1]);
            keepPimStub.getInboxMessages.withArgs(sinon.match.any,sinon.match.truthy, undefined, sinon.match.number).resolves(expectedOnCall1);
    
            const expectedOnCall2: any[] = [];
            expectedOnCall2.push(messages[2]);
            expectedOnCall2.push(contacts[2]);
            expectedOnCall2.push(contacts[3]);
            keepPimStub.getInboxMessages.withArgs(sinon.match.any,sinon.match.truthy, 3, sinon.match.number).resolves(expectedOnCall2);
    
            const results = await KeepPimMessageManager.getInstance().getPimItems(userInfo, KeepPimConstants.INBOX, true, undefined, 3, undefined, ["Person"]);
            expect(results.length).to.be.equal(3);

        });
       
    });
}); 
