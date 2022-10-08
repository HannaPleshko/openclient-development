/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from "@loopback/testlab";
import { DateTime } from "luxon";
import { PimDeliveryPriority, PimImportance, PimItemFactory, PimItemFormat, PimMessageClassic, PimNoticeTypes } from "../../../keep";

describe('PimMessage tests', () => {

    describe('Test getters and setters', () => {
        // Object return when document=false on API
        const pimObjectPrimitive = {
            "@unid": "test-id",
            "@index": 5
        };

        // Object return when document=true on API
        let pimObjectDocument: any;
        beforeEach(function () {
            pimObjectDocument = {
                "@unid": "test-id",
                "In_Reply_To": "test-reply@test.com",
                'References': '<OF038FB60B.186BFD5A-ON0025873D.0055CC2C-4325873D.00560394@LocalDomain> <OF23EB46BE.0E550615-ON0025873D.0055EA33-4325873D.00561AEB@LocalDomain>',
                "FollowUpStatus": "2",
                'Body': 'Body of message',
                'BodyType': 'BodyType of message',
                'From': 'senderTest1',
                'SendTo': 'recieverTest1',
                'CopyTo': 'copytoTest1',
                'BlindCopyTo': 'bccTest1',
                'ReplyTo': 'replytoTest1',
                '@size': 1234,
                '@created': "2020-12-26T15:00:00.000Z",
                'PostedDate': "2020-12-26T15:00:00.000Z",
                'Subject': "HCL Connections and AirWatch SDK configuration - case: 1572033",
                'Importance': PimImportance.NONE,
                'DeliveryPriority': '',
                '$TUA': "25D1BCF45DF7B4C30025844E0069F22C",
                '$Abstract': "Hi Lucas,   I opened case 1572033 for the issue described below, however I had to login with my dave",
                'NoticeType': "Notice test",
                '$ICAL_ORIG_STREAM': "icalstream test",
                '$ICAL_ORIG_MSG_ID': "icalmessageid test",
                '$MessageID': "messageid test",
                '$ThreadEmbed': '',
                'StartDateTime': "2020-12-26T15:00:00.000",
                'StartTimeZone': "America/New_York",
                'EndDateTime': "2020-12-30T15:00:00.000",
                'EndTimeZone': "America/New_York",
                'NewStartDate': "2020-12-26T15:00:00.000Z",
                'NewEndDate': "2020-12-30T15:00:00.000Z",
                'ApptUNID': 'apptUnId test',
                '@threadid': 'threadId test',
                'threadTopic': 'thread topic test',
            };
        });

        it('position from Primitive format', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectPrimitive, PimItemFormat.PRIMITIVE);

            expect(pimMessage.position).to.be.equal(5);
        });

        it('position from Document format', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.position).to.be.equal(0);

            pimMessage.position = 2;
            expect(pimMessage.position).to.be.equal(2);
        });

        it('from', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.from).to.be.deepEqual('senderTest1');
       
            pimMessage.from = 'senderTest2';
            expect(pimMessage.from).to.be.deepEqual('senderTest2');

            pimMessage.from = undefined;
            expect(pimMessage.from).to.be.equal(undefined);

        })

        it('to', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.to).to.be.deepEqual(['recieverTest1']);
       
            pimMessage.to = ['recieverTest2'];
            expect(pimMessage.to).to.be.deepEqual(['recieverTest2']);

            pimMessage.to = undefined;
            expect(pimMessage.to).to.be.equal(undefined);
        });

        it('cc', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.cc).to.be.deepEqual(['copytoTest1']);
       
            pimMessage.cc = ['copytoTest2'];
            expect(pimMessage.cc).to.be.deepEqual(['copytoTest2']);

            pimMessage.cc = undefined;
            expect(pimMessage.cc).to.be.equal(undefined);
        });

        it('bcc', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.bcc).to.be.deepEqual(['bccTest1']);
       
            pimMessage.bcc = ['bccTest2'];
            expect(pimMessage.bcc).to.be.deepEqual(['bccTest2']);

            pimMessage.bcc = undefined;
            expect(pimMessage.bcc).to.be.equal(undefined);
        });

        it('replyTo', () => {
           const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.replyTo).to.be.deepEqual(['replytoTest1']);
       
            pimMessage.replyTo = ['replytoTest2'];
            expect(pimMessage.replyTo).to.be.deepEqual(['replytoTest2']);

            pimMessage.replyTo = undefined;
            expect(pimMessage.replyTo).to.be.equal(undefined);
        });

        it('inReplyTo', () => {
            let pimMessage = PimItemFactory.newPimMessage(pimObjectPrimitive, PimItemFormat.PRIMITIVE);
            expect(pimMessage.inReplyTo).to.be.undefined();

            pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.inReplyTo).to.be.equal(pimObjectDocument.In_Reply_To);

            pimMessage.inReplyTo = undefined;
            expect(pimMessage.inReplyTo).to.be.undefined();

            pimMessage.inReplyTo = "new-reply@test.com";
            expect(pimMessage.inReplyTo).to.be.equal("new-reply@test.com");

        });

        it('references', () => {
            let pimMessage = PimItemFactory.newPimMessage(pimObjectPrimitive, PimItemFormat.PRIMITIVE);
            expect(pimMessage.references).to.be.undefined();

            pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.references).to.be.equal(pimObjectDocument.References);

            pimMessage.references = undefined;
            expect(pimMessage.references).to.be.undefined();

            const testReferences = pimObjectDocument.References;
            pimMessage.references = testReferences;
            expect(pimMessage.references).to.be.equal(testReferences);
        });

        it('returnReceipt', () => {
            let pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.returnReceipt).to.be.eql(undefined);
       
            pimObjectDocument["ReturnReceipt"] = "0";
            pimMessage = new PimMessageClassic(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.returnReceipt).to.be.eql(false);

            pimObjectDocument["ReturnReceipt"] = "1";
            pimMessage = new PimMessageClassic(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.returnReceipt).to.be.eql(true);

            pimMessage.returnReceipt = true;
            expect(pimMessage.returnReceipt).to.be.eql(true);

            pimMessage.returnReceipt = undefined;
            // pimMessage = new PimMessage(messageObject, PimItemFormat.DOCUMENT);
            expect(pimMessage.returnReceipt).to.be.equal(undefined);
        });

        it('deliveryReceipt', () => {
            let pimMessage = new PimMessageClassic(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.deliveryReceipt).to.be.eql(undefined);
       
            pimObjectDocument["DeliveryReport"] = "B";
            pimMessage = new PimMessageClassic(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.deliveryReceipt).to.be.eql(false);

            pimObjectDocument["DeliveryReport"] = "C";
            pimMessage = new PimMessageClassic(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.deliveryReceipt).to.be.eql(true);

            pimMessage.deliveryReceipt = false;
            expect(pimMessage.deliveryReceipt).to.be.eql(false);

            pimMessage.deliveryReceipt = true;
            expect(pimMessage.deliveryReceipt).to.be.eql(true);

            pimMessage.deliveryReceipt = undefined;
            // pimMessage = new PimMessage(messageObject, PimItemFormat.DOCUMENT);
            expect(pimMessage.deliveryReceipt).to.be.equal(undefined);
        });


        it('size', () => {
           const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.size).to.be.eql(1234);
       
            pimMessage.size = 1233;
            expect(pimMessage.size).to.be.eql(1233);
        });

        it('receivedDate', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.receivedDate).to.be.eql(new Date('2020-12-26T15:00:00.000Z'));

            const createdDate = new Date("2020-12-25T15:00:00.000Z");
            pimMessage.receivedDate = createdDate;
            expect(pimMessage.receivedDate).to.be.eql(createdDate);

            pimMessage.receivedDate = undefined;
            expect(pimMessage.receivedDate).to.be.undefined();
        });

        it('sentDate', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.sentDate).to.be.eql(new Date('2020-12-26T15:00:00.000Z'));

            const createdDate = new Date("2020-12-25T15:00:00.000Z");
            pimMessage.sentDate = createdDate;
            expect(pimMessage.sentDate).to.be.eql(createdDate);

            pimMessage.sentDate = undefined;
            expect(pimMessage.sentDate).to.be.undefined();
        });

        it('subject', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.subject).to.be.eql('HCL Connections and AirWatch SDK configuration - case: 1572033');
        
            pimMessage.subject = 'HCL Connections and AirWatch SDK configuration - case: 1572032';
            expect(pimMessage.subject).to.be.eql('HCL Connections and AirWatch SDK configuration - case: 1572032');
        });

        it('importance', () => {
            let pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.importance).to.be.eql(PimImportance.NONE);

            pimMessage.importance = PimImportance.MEDIUM;
            expect(pimMessage.importance).to.be.eql(PimImportance.MEDIUM);

            pimMessage.importance = PimImportance.LOW;
            expect(pimMessage.importance).to.be.eql(PimImportance.LOW);

            pimMessage.importance = PimImportance.HIGH;
            expect(pimMessage.importance).to.be.eql(PimImportance.HIGH);

            pimObjectDocument.Importance = PimImportance.NONE;
            pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.importance).to.be.eql(PimImportance.NONE);
        });

        it('deliveryPriority', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.deliveryPriority).to.be.eql(PimDeliveryPriority.NORMAL);

            pimMessage.deliveryPriority = PimDeliveryPriority.HIGH;
            expect(pimMessage.deliveryPriority).to.be.eql(PimDeliveryPriority.HIGH);

            pimMessage.deliveryPriority = PimDeliveryPriority.LOW;
            expect(pimMessage.deliveryPriority).to.be.eql(PimDeliveryPriority.LOW);

            pimMessage.deliveryPriority = PimDeliveryPriority.NORMAL;
            expect(pimMessage.deliveryPriority).to.be.eql(PimDeliveryPriority.NORMAL);
        });

        it('conversationIndex', () => {

            let pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);

            // ========setter/getter for string | undefined==============
            pimMessage.conversationIndex = undefined;
            expect(pimMessage.conversationIndex).to.equal(undefined);

            pimMessage.conversationIndex = '0';
            expect(pimMessage.conversationIndex).to.equal('0');

            //set to undefined
            pimObjectDocument["$TUA"] = undefined;
            pimMessage = new PimMessageClassic(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.conversationIndex).to.equal(undefined);

            //set to string, expect 0
            pimObjectDocument["$TUA"] = 'test-id1';
            pimMessage = new PimMessageClassic(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.conversationIndex).to.equal('0');
            pimObjectDocument["$TUA"] = 'test-id';
            pimMessage = new PimMessageClassic(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.conversationIndex).to.equal('0');

            // ============$TUA.length - 1 if $TUA does not include unid=============
            pimObjectDocument["$TUA"] = ['test-id1'];
            pimMessage = new PimMessageClassic(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.conversationIndex).to.equal('0');

            pimObjectDocument["$TUA"] = ['test-id1', 'test-id2']; 
            pimMessage = new PimMessageClassic(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.conversationIndex).to.equal('1');

            pimObjectDocument["$TUA"] = ['test-id1', 'test-id2', 'test-id3'];
            pimMessage = new PimMessageClassic(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.conversationIndex).to.equal('2');

            // ============the index of unid in $TUA if $TUA includes unid=============
            pimObjectDocument["$TUA"] = ['test-id'];
            pimMessage = new PimMessageClassic(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.conversationIndex).to.equal('0');

            pimObjectDocument["$TUA"] = ['test-id', 'test-id1', 'test-id2']; 
            pimMessage = new PimMessageClassic(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.conversationIndex).to.equal('0');

            pimObjectDocument["$TUA"] = ['test-id1', 'test-id', 'test-id2']; 
            pimMessage = new PimMessageClassic(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.conversationIndex).to.equal('1');

            pimObjectDocument["$TUA"] = ['test-id1', 'test-id2', 'test-id']; 
            pimMessage = new PimMessageClassic(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.conversationIndex).to.equal('2');            
        });

        it('abstract', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.abstract).to.be.eql('Hi Lucas,   I opened case 1572033 for the issue described below, however I had to login with my dave');

            pimMessage.abstract = 'Hi Lucas,   I opened case 1572032 for the issue described below, however I had to login with my dave';
            expect(pimMessage.abstract).to.be.eql('Hi Lucas,   I opened case 1572032 for the issue described below, however I had to login with my dave');

        });

        it('noticeType', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.noticeType).to.be.eql('Notice test');

            pimMessage.noticeType = undefined;
            expect(pimMessage.noticeType).to.be.eql(undefined);
        });

        it('isMeetingRequest', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.isMeetingRequest()).to.be.eql(false);

            pimMessage.noticeType = PimNoticeTypes.INVITATION_REQUEST;
            expect(pimMessage.isMeetingRequest()).to.be.eql(true);

        });

        it('isMeetingResponse', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.isMeetingResponse()).to.be.eql(true);

            pimMessage.noticeType = PimNoticeTypes.INVITATION_REQUEST;
            expect(pimMessage.isMeetingResponse()).to.be.eql(false);

        });

        it('isCounterProposalRequest', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.isCounterProposalRequest()).to.be.eql(false);

            pimMessage.noticeType = PimNoticeTypes.COUNTER_PROPOSAL_REQUEST;
            expect(pimMessage.isCounterProposalRequest()).to.be.eql(true);

        });

        it('isDelegatedRequest', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.isDelegatedRequest()).to.be.eql(false);

            pimMessage.noticeType = PimNoticeTypes.REQUEST_DELEGATED;
            expect(pimMessage.isDelegatedRequest()).to.be.eql(true);

            pimMessage.noticeType = PimNoticeTypes.REQUEST_DELEGATED_DELEGEE;
            expect(pimMessage.isDelegatedRequest()).to.be.eql(true);
        });

        it('isMeetingCancellation', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.isMeetingCancellation()).to.be.eql(false);

            pimMessage.noticeType = PimNoticeTypes.EVENT_CANCELLED;
            expect(pimMessage.isMeetingCancellation()).to.be.eql(true);

        });

        it('icalStream', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.icalStream).to.be.eql('icalstream test');

            pimMessage.icalStream = undefined;
            expect(pimMessage.icalStream).to.be.eql(undefined);
        });

        it('icalMessageId', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.icalMessageId).to.be.eql('icalmessageid test');

            pimMessage.icalMessageId = undefined;
            expect(pimMessage.icalMessageId).to.be.eql(undefined);
        });

        it('messageId', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.messageId).to.be.eql('messageid test');

            pimMessage.messageId = undefined;
            expect(pimMessage.messageId).to.be.eql(undefined);
        });

        it('start', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            let st = DateTime.fromISO('2020-12-26T15:00:00.000');
            st = st.setZone(pimMessage.startTimeZone!, { keepLocalTime: true });
            let expectedDate = st.toISO();
            expect(pimMessage.start).to.be.eql(expectedDate);

            const createdDate = "2020-12-27T15:00:00.000";
            st = DateTime.fromISO(createdDate);
            st = st.setZone(pimMessage.startTimeZone!, { keepLocalTime: true });
            expectedDate = st.toISO();
            pimMessage.start = createdDate;
            expect(pimMessage.start).to.be.eql(expectedDate);

            pimMessage.start = undefined;
            expect(pimMessage.start).to.be.undefined();
        });

        it('startTimeZone', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.startTimeZone).to.be.eql("America/New_York");

            const createdTimeZone = "India";
            pimMessage.startTimeZone = createdTimeZone;
            expect(pimMessage.startTimeZone).to.be.eql(createdTimeZone);

            pimMessage.startTimeZone = undefined;
            expect(pimMessage.startTimeZone).to.be.undefined();
        });

        it('end', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            let st = DateTime.fromISO('2020-12-30T15:00:00.000');
            st = st.setZone(pimMessage.endTimeZone!, { keepLocalTime: true });
            let expectedDate = st.toISO();
            expect(pimMessage.end).to.be.eql(expectedDate);

            const createdDate = "2020-12-27T15:00:00.000Z";
            st = DateTime.fromISO(createdDate);
            st = st.setZone(pimMessage.startTimeZone!, { keepLocalTime: true });
            expectedDate = st.toISO();
            pimMessage.end = createdDate;
            expect(pimMessage.end).to.be.eql(expectedDate);

            pimMessage.end = undefined;
            expect(pimMessage.end).to.be.undefined();
        });

        it('endTimeZone', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.endTimeZone).to.be.eql("America/New_York");

            const createdTimeZone = "India";
            pimMessage.endTimeZone = createdTimeZone;
            expect(pimMessage.endTimeZone).to.be.eql(createdTimeZone);

            pimMessage.endTimeZone = undefined;
            expect(pimMessage.endTimeZone).to.be.undefined();
        });

        it('newStartDate', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.newStartDate).to.be.eql(new Date('2020-12-26T15:00:00.000Z'));

            const createdDate = new Date("2020-12-27T15:00:00.000Z");
            pimMessage.newStartDate = createdDate;
            expect(pimMessage.newStartDate).to.be.eql(createdDate);

            pimMessage.newStartDate = undefined;
            expect(pimMessage.newStartDate).to.be.undefined();
        });

        it('newEndDate', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.newEndDate).to.be.eql(new Date('2020-12-30T15:00:00.000Z'));

            const createdDate = new Date("2020-12-31T15:00:00.000Z");
            pimMessage.newEndDate = createdDate;
            expect(pimMessage.newEndDate).to.be.eql(createdDate);

            pimMessage.newEndDate = undefined;
            expect(pimMessage.newEndDate).to.be.undefined();
        });

        it('referencedCalendarItemUnid', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.referencedCalendarItemUnid).to.be.eql('apptUnId test');

            pimMessage.referencedCalendarItemUnid = undefined;
            expect(pimMessage.referencedCalendarItemUnid).to.be.undefined();
        });

        it('threadId', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.threadId).to.be.eql("threadId test");

            pimMessage.threadId = undefined;
            expect(pimMessage.threadId).to.be.eql(undefined);
        });

        it('threadTopic', () => {
            const pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.threadTopic).to.be.eql("thread topic test");

            pimMessage.threadTopic = undefined;
            expect(pimMessage.threadTopic).to.be.eql(undefined);
        });

        it('isFlaggedForFollowUp', () => {
            let pimMessage = PimItemFactory.newPimMessage(pimObjectPrimitive, PimItemFormat.PRIMITIVE);
            expect(pimMessage.isFlaggedForFollowUp).to.be.false();

            pimMessage.isFlaggedForFollowUp = true;
            expect(pimMessage.isFlaggedForFollowUp).to.be.true();

            pimMessage = PimItemFactory.newPimMessage(pimObjectDocument, PimItemFormat.DOCUMENT);
            expect(pimMessage.isFlaggedForFollowUp).to.be.true();

            pimMessage.isFlaggedForFollowUp = false;
            expect(pimMessage.isFlaggedForFollowUp).to.be.false();
        });
    });

    it('toPimStructure', function () {
        const sentDate = new Date()
        const pimObject = {
            "@unid": "test-id",
            "In_Reply_To": "test-reply@test.com",
            "FollowUpStatus": "2",
            "PostedDate": sentDate.toISOString()
        };

        const pimMessage = PimItemFactory.newPimMessage(pimObject, PimItemFormat.DOCUMENT);
        let structure: any = pimMessage.toPimStructure();
        const strDate = new Date(structure.PostedDate);
        expect(strDate.getTime()).to.be.equal(sentDate.getTime());
        expect(structure.FollowUpStatus).to.be.equal("2");

        pimMessage.sentDate = undefined;
        pimMessage.isFlaggedForFollowUp = false;
        structure = pimMessage.toPimStructure();
        expect(structure.PostedDate).to.be.undefined();
        expect(structure.FollowUpStatus).to.be.empty();

    });

    it('toMessageFlagStructure', function () {
        const pimObject = {
            "@unid": "test-id",
            "FollowUpStatus": "2",
            "@unread": true
        };

        let pimMessage = PimItemFactory.newPimMessage(pimObject, PimItemFormat.DOCUMENT);
        let structure: any = pimMessage.toMessageFlagStructure();
        expect(structure.unreadOn).to.containDeep(['test-id']);
        expect(structure.unreadOff).to.be.undefined();
        expect(structure.quickFlagOn).to.containDeep(['test-id']);
        expect(structure.quickFlagOff).to.be.undefined();

        pimObject.FollowUpStatus = "";
        pimObject["@unread"] = false;
        pimMessage = PimItemFactory.newPimMessage(pimObject, PimItemFormat.DOCUMENT);
        structure = pimMessage.toMessageFlagStructure();
        expect(structure.unreadOn).to.be.undefined();
        expect(structure.unreadOff).to.containDeep(['test-id']);
        expect(structure.quickFlagOn).to.be.undefined();
        expect(structure.quickFlagOff).to.containDeep(['test-id']);

    });
});