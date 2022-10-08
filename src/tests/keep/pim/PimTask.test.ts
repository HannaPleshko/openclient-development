/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from '@loopback/testlab';
import { getTrimmedISODate, JmapAlert, OffsetTrigger, PimTask } from '../../../internal';
import { KeepPimConstants, PimItemFactory, PimItemFormat, PimTaskPriority, PimTaskProgress } from '../../../keep';
import { v4 as uuidv4 } from 'uuid';
import { compareDateStrings } from '../../test-helper';

/**
 * Unit test for PimTask class
 */

describe('PimTask tests', () => {

    describe('Test getters and setters', () => {

        it('with uid', function () {
            const pimObject = {
                "uid": "unit-test-contact"
            };

            const pimItem = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.unid).to.be.equal("unit-test-contact");
            pimItem.unid = "updated-unid";
            expect(pimItem.unid).to.be.equal("updated-unid");
        });

        it('with no unid', function () {
            const pimObject = {
            };

            const pimItem = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.unid).to.be.undefined();
            pimItem.unid = "bogusunid";
            expect(pimItem.unid).to.be.equal("bogusunid");
        });

        it('Test from setter/getter', () => {
            let pimObject: any = {
            }

            let pimTask = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            pimTask.from = "ramya";

            expect(pimTask.from).to.be.equal("ramya");
            pimTask.from = "updated-ramya";
            expect(pimTask.from).to.be.equal("updated-ramya");

            pimObject = {};
            pimTask = PimItemFactory.newPimTask(pimObject);
            expect(pimTask.from).to.be.undefined();

            pimObject = {
                "uid": "unid",
            };

            let pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.from).to.be.undefined();

            pimItem = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.from).to.be.undefined();

            pimObject.participants = {
                "abcdef": {
                    email: "myemail@test.com",
                    roles: {
                        "chair": true
                    }
                }
            }
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.from).to.be.undefined();

            let ownerEmail = "myowneremail@test.com";
            pimObject.participants = {
                "abcdef": {
                    email: "myemail@test.com",
                    roles: {
                        "chair": true
                    }
                },
                "ghijkl": {
                    email: ownerEmail,
                    roles: {
                        "owner": true
                    }
                }
            }
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.from).to.be.equal(ownerEmail);

            pimItem.from = undefined;
            expect(pimItem.from).to.be.undefined();

            pimItem.from = ownerEmail;
            expect(pimItem.from).to.be.equal(ownerEmail);

            ownerEmail = "mynewowneremail@test.com";
            pimItem.from = ownerEmail;
            expect(pimItem.from).to.be.equal(ownerEmail);

        });

        it('Test altChair setter/getter', () => {
            let pimObject: any = {
            }
            let pimTask = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            pimTask.altChair = "xyz";

            expect(pimTask.altChair).to.be.equal("xyz");
            pimTask.altChair = "updated-xyz";
            expect(pimTask.altChair).to.be.equal("updated-xyz");

            pimObject = {};
            pimTask = PimItemFactory.newPimTask(pimObject);
            expect(pimTask.altChair).to.be.undefined();

            pimObject = {
                "uid": "unid",
            };

            let pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.altChair).to.be.undefined();

            pimItem = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.altChair).to.be.undefined();

            pimObject.participants = {
                "abcdef": {
                    email: "myemail@test.com",
                    roles: {
                        "owner": true
                    }
                }
            }
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.altChair).to.be.undefined();

            let chairEmail = "mychairemail@test.com";
            const ownerEmail = "myowneremail@test.com";
            pimObject.participants = {
                "abcdef": {
                    email: chairEmail,
                    roles: {
                        "chair": true
                    }
                },
                "ghijkl": {
                    email: ownerEmail,
                    roles: {
                        "owner": true
                    }
                }
            }
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.altChair).to.be.equal(chairEmail);

            pimItem.altChair = undefined;
            expect(pimItem.altChair).to.be.undefined();

            pimItem.altChair = chairEmail;
            expect(pimItem.altChair).to.be.equal(chairEmail);

            chairEmail = "mynewchairremail@test.com";
            pimItem.altChair = chairEmail;
            expect(pimItem.altChair).to.be.equal(chairEmail);
        });

        it('Test title setter/getter', () => {
            let pimObject: any = {
            }

            let pimTask = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            pimTask.title = "UnitTest";

            expect(pimTask.title).to.be.equal("UnitTest");
            pimTask.title = "updated-UnitTest";
            expect(pimTask.title).to.be.equal("updated-UnitTest");

            pimObject = {};
            pimTask = PimItemFactory.newPimTask(pimObject);
            expect(pimTask.title).to.be.equal("");
        });

        it('Test description setter/getter', () => {
            let pimObject: any = {
            }

            let pimTask = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            pimTask.description = "UnitTest for setters and getters";

            expect(pimTask.description).to.be.equal("UnitTest for setters and getters");
            pimTask.description = "updated-UnitTest for setters and getters";
            expect(pimTask.description).to.be.equal("updated-UnitTest for setters and getters");

            pimObject = {};
            pimTask = PimItemFactory.newPimTask(pimObject);
            expect(pimTask.description).to.be.eql("");
        });

        it('Test due setter/getter', () => {
            let pimObject: any = {
            }

            let pimTask = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            pimTask.due = "1990-09-09T23:00:03Z";

            expect(compareDateStrings(pimTask.due, "1990-09-09T23:00:03Z")).to.be.equal(0);

            const dueDate = new Date();
            pimTask.due = dueDate.toISOString();
            expect(getTrimmedISODate(pimTask.due)).to.be.eql(getTrimmedISODate(dueDate));

            pimObject = {};
            pimTask = PimItemFactory.newPimTask(pimObject);
            expect(pimTask.due).to.undefined();
        });


        it('Test taskType setter/getter', () => {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.taskType).to.be.undefined();

            let testValue = "TestTaskType";
            pimItem.taskType = testValue;
            expect(pimItem.taskType).to.be.equal(testValue);

            pimItem.taskType = undefined;
            expect(pimItem.taskType).to.be.undefined();

            testValue = 'taskTypeAdditionalField';
            pimObject.AdditionalFields = {};
            pimObject.AdditionalFields[KeepPimConstants.EXT_ADDITIONAL_TASK_TYPE] = testValue;
            pimItem = new PimTask(pimObject);
            expect(pimItem.taskType).to.be.equal(testValue);

        });

        it('PimTask.type', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            const pimItem = new PimTask(pimObject);
            expect(pimItem.type).to.be.equal('jstask');
        });

        it('Test due getter/setter', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.due).to.be.undefined();

            const dueString = "2020-12-25T15:00:00Z";
            pimObject.due = dueString;
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(compareDateStrings(pimItem.due!, dueString)).to.be.eql(0);

            pimItem.due = undefined;
            expect(pimItem.due).to.be.undefined();
        });

        it('Test completed date setter/getter', () => {
            let pimObject: any = {
            }

            let pimTask = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            const testDate = new Date("1990-09-05T23:00:03Z");
            pimTask.completedDate = testDate
            expect(getTrimmedISODate(pimTask.completedDate)).to.be.eql(getTrimmedISODate(testDate));

            const completedDateSet = new Date();
            pimTask.completedDate = completedDateSet;
            expect(getTrimmedISODate(pimTask.completedDate)).to.be.eql(getTrimmedISODate(completedDateSet));

            pimObject = {};
            pimTask = PimItemFactory.newPimTask(pimObject);
            expect(pimTask.completedDate).to.be.undefined();
        });

        it('Test start date setter/getter', () => {
            let pimObject: any = {
            }

            let pimTask = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            pimTask.start = "1990-09-01T23:00:03Z";
            expect(compareDateStrings(pimTask.start, "1990-09-01T23:00:03Z")).to.be.equal(0);

            const startDate = new Date();
            pimTask.start = startDate.toISOString();
            expect(getTrimmedISODate(pimTask.start)).to.be.eql(getTrimmedISODate(startDate));

            pimObject = {};
            pimTask = PimItemFactory.newPimTask(pimObject);
            expect(pimTask.start).to.be.undefined();
        });

        it('Test priority setter/getter', () => {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.priority).to.be.equal(PimTaskPriority.NONE);

            for (let i = 0; i < 10; i++) {
                pimObject.priority = i;
                pimItem = PimItemFactory.newPimTask(pimObject);
                switch (true) {
                    case (i === 0):
                        expect(pimItem.priority).to.be.equal(PimTaskPriority.NONE);
                        break;
                    case (i <= 3):
                        expect(pimItem.priority).to.be.equal(PimTaskPriority.HIGH);
                        break;
                    case (i <= 6):
                        expect(pimItem.priority).to.be.equal(PimTaskPriority.MEDIUM);
                        break;
                    case (i <= 9):
                        expect(pimItem.priority).to.be.equal(PimTaskPriority.LOW);
                        break;
                    default:
                        expect(pimItem.priority).to.be.equal(PimTaskPriority.NONE);
                }
            }

            pimItem.priority = PimTaskPriority.HIGH;
            expect(pimItem.priority).to.be.equal(PimTaskPriority.HIGH);
            pimItem.priority = PimTaskPriority.MEDIUM;
            expect(pimItem.priority).to.be.equal(PimTaskPriority.MEDIUM);
            pimItem.priority = PimTaskPriority.LOW;
            expect(pimItem.priority).to.be.equal(PimTaskPriority.LOW);
            pimItem.priority = PimTaskPriority.NONE;
            expect(pimItem.priority).to.be.equal(PimTaskPriority.NONE);

        });

        it('Test statusLabel setter/getter', () => {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.statusLabel).to.be.undefined();

            let testValue = "TestTaskType";
            pimItem.statusLabel = testValue;
            expect(pimItem.statusLabel).to.be.equal(testValue);

            pimItem.statusLabel = undefined;
            expect(pimItem.statusLabel).to.be.undefined();

            testValue = 'statusLabelAdditionalField';
            pimObject.AdditionalFields = {};
            pimObject.AdditionalFields[KeepPimConstants.EXT_ADDITIONAL_STATUS_LABEL] = testValue;
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.statusLabel).to.be.equal(testValue);
        });

        it('PimTask.progress', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.progress).to.be.undefined();

            pimObject.progress = PimTaskProgress.CANCELLED;
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.progress).to.be.equal(PimTaskProgress.CANCELLED);

            pimObject.progress = PimTaskProgress.COMPLETED;
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.progress).to.be.equal(PimTaskProgress.COMPLETED);

            pimObject.progress = PimTaskProgress.FAILED;
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.progress).to.be.equal(PimTaskProgress.FAILED);

            pimObject.progress = PimTaskProgress.IN_PROCESS;
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.progress).to.be.equal(PimTaskProgress.IN_PROCESS);

            pimObject.progress = PimTaskProgress.NEEDS_ACTION;
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.progress).to.be.equal(PimTaskProgress.NEEDS_ACTION);


            pimItem.progress = PimTaskProgress.CANCELLED;
            expect(pimItem.progress).to.be.equal(PimTaskProgress.CANCELLED);

            pimItem.progress = PimTaskProgress.COMPLETED;
            expect(pimItem.progress).to.be.equal(PimTaskProgress.COMPLETED);

            pimItem.progress = PimTaskProgress.FAILED;
            expect(pimItem.progress).to.be.equal(PimTaskProgress.FAILED);

            pimItem.progress = PimTaskProgress.IN_PROCESS;
            expect(pimItem.progress).to.be.equal(PimTaskProgress.IN_PROCESS);

            pimItem.progress = PimTaskProgress.NEEDS_ACTION;
            expect(pimItem.progress).to.be.equal(PimTaskProgress.NEEDS_ACTION);

            pimItem.progress = undefined;
            expect(pimItem.progress).to.be.undefined();
        });

        it('PimTask.isInProgress', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.isInProgress).to.be.false();

            const participant: any = {
                type: "Participant",
                roles: {
                    "attendee": true
                }
            }
            pimObject.participants = {
                "abcdef": participant
            }

            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.isInProgress).to.be.false();

            participant.progress = PimTaskProgress.IN_PROCESS;
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.isInProgress).to.be.true();

            participant.progress = PimTaskProgress.NEEDS_ACTION;
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.isInProgress).to.be.false();
        });

        it('PimTask.isOverDue', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            const pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.isOverDue).to.be.false();

            pimItem.due = "2020-12-25T15:00:00Z";
            expect(pimItem.isOverDue).to.be.true();
            pimItem.isComplete = true;
            expect(pimItem.isOverDue).to.be.false();

            // Due date should still be set
            pimItem.isComplete = false;
            expect(pimItem.isOverDue).to.be.true();

            pimItem.completedDate = new Date("2020-12-25T15:00:00Z");
            expect(pimItem.isOverDue).to.be.false();
        });

        it('PimTask.isComplete', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.isComplete).to.be.false();

            pimItem.completedDate = new Date("2020-12-25T15:00:00Z");
            expect(pimItem.isComplete).to.be.true();

            pimItem.isComplete = false;
            expect(pimItem.isComplete).to.be.false();


            const participant: any = {
                type: "Participant",
                roles: {
                    "attendee": true
                }
            }
            pimObject.participants = {
                "abcdef": participant
            }

            // Due date should still be set
            pimItem.isComplete = false;
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.isComplete).to.be.false();

            participant.progress = PimTaskProgress.COMPLETED;
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.isComplete).to.be.true();

            participant.progress = PimTaskProgress.CANCELLED;
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.isComplete).to.be.false();
        });

        it('PimTask.isNotStarted', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.isNotStarted).to.be.true();

            pimItem.isNotStarted = false;
            expect(pimItem.isNotStarted).to.be.false();

            pimItem.isNotStarted = true;
            expect(pimItem.isNotStarted).to.be.true();

            const participant: any = {
                type: "Participant",
                roles: {
                    "attendee": true
                }
            }
            pimObject.participants = {
                "abcdef": participant
            }

            participant.progress = PimTaskProgress.NEEDS_ACTION;
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.isNotStarted).to.be.true();

            participant.progress = PimTaskProgress.IN_PROCESS;
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.isNotStarted).to.be.false();

            participant.progress = PimTaskProgress.COMPLETED;
            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.isNotStarted).to.be.false();

        });

        it('PimTask.isRejected', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.isRejected).to.be.false();

            pimItem.isRejected = true;
            expect(pimItem.isRejected).to.be.true();

            pimItem.isRejected = false;
            expect(pimItem.isRejected).to.be.false();

            const participant: any = {
                type: "Participant",
                roles: {
                    "attendee": true
                }
            }
            pimObject.participants = {
                "abcdef": participant
            }

            pimItem = PimItemFactory.newPimTask(pimObject);
            expect(pimItem.isRejected).to.be.false();

            participant.progress = PimTaskProgress.FAILED;
            expect(pimItem.isRejected).to.be.true();

            participant.progress = PimTaskProgress.IN_PROCESS;
            expect(pimItem.isRejected).to.be.false();
        });

        it('Test alarm setter/getter', () => {
            let pimObject: any = {
            }

            let pimTask = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            pimTask.alarm = 10;
            expect(pimTask.alarm).to.be.equal(10);

            pimTask.alarm = 0;
            expect(pimTask.alarm).to.be.equal(0);
            pimTask.alarm = 1;
            expect(pimTask.alarm).to.be.equal(1);

            pimObject = {};
            pimTask = PimItemFactory.newPimTask(pimObject);
            expect(pimTask.alarm).to.be.undefined();

            pimObject.alerts = {};
            let alert = new JmapAlert();
            let trigger: OffsetTrigger = new OffsetTrigger();
            trigger.offset = 'PT3S';
            alert.trigger = trigger;
            pimObject.alerts[uuidv4()] = alert;
            pimTask = PimItemFactory.newPimTask(pimObject);
            expect(pimTask.alarm).to.be.equal(0);  // alarm is in minutes

            pimObject.alerts = {};
            alert = new JmapAlert();
            trigger = new OffsetTrigger();
            trigger.offset = '-PT3S';
            alert.trigger = trigger;
            pimObject.alerts[uuidv4()] = alert;
            pimTask = PimItemFactory.newPimTask(pimObject);
            expect(pimTask.alarm).to.be.equal(0);  // alarm is in minutes

            pimObject.alerts = {};
            alert = new JmapAlert();
            trigger = new OffsetTrigger();
            trigger.offset = '-PT63S';
            alert.trigger = trigger;
            pimObject.alerts[uuidv4()] = alert;
            pimTask = PimItemFactory.newPimTask(pimObject);
            expect(pimTask.alarm).to.be.equal(-1);  // alarm is in minutes

            pimObject.alerts = {};
            alert = new JmapAlert();
            trigger = new OffsetTrigger();
            trigger.offset = 'PT63S';
            alert.trigger = trigger;
            pimObject.alerts[uuidv4()] = alert;
            pimTask = PimItemFactory.newPimTask(pimObject);
            expect(pimTask.alarm).to.be.equal(1);  // alarm is in minutes

            pimObject.alerts = {};
            alert = new JmapAlert();
            trigger = new OffsetTrigger();
            trigger.offset = 'PT63M';
            alert.trigger = trigger;
            pimObject.alerts[uuidv4()] = alert;
            pimTask = PimItemFactory.newPimTask(pimObject);
            expect(pimTask.alarm).to.be.equal(63);  // alarm is in minutes

            pimObject.alerts = {};
            alert = new JmapAlert();
            trigger = new OffsetTrigger();
            trigger.offset = '-PT63M';
            alert.trigger = trigger;
            pimObject.alerts[uuidv4()] = alert;
            pimTask = PimItemFactory.newPimTask(pimObject);
            expect(pimTask.alarm).to.be.equal(-63);  // alarm is in minutes

        });

        it('Test task state setter/getter', () => {
            //In-progress
            const pimObject: any = {
            }

            let pimTask = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            pimTask.isInProgress = true;
            expect(pimTask.isInProgress).to.be.equal(true);

            pimTask.isInProgress = false;
            expect(pimTask.isInProgress).to.be.equal(false);
            pimTask.isInProgress = true;
            expect(pimTask.isInProgress).to.be.equal(true);

            //isNotStarted
            pimTask = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            pimTask.isNotStarted = true;
            expect(pimTask.isNotStarted).to.be.equal(true);

            pimTask.isNotStarted = false;
            expect(pimTask.isNotStarted).to.be.equal(false);
            pimTask.isOverDue = true;
            pimTask.isNotStarted = false;
            expect(pimTask.isNotStarted).to.be.equal(false);
            pimTask.isNotStarted = true;
            expect(pimTask.isNotStarted).to.be.equal(true);

            //isOverdue
            pimTask = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            pimTask.due = "1990-09-05T23:00:03Z";
            pimTask.isOverDue = true;
            expect(pimTask.isOverDue).to.be.equal(true);

            pimTask.isOverDue = false;
            expect(pimTask.isOverDue).to.be.equal(false);
            pimTask.isComplete = true;
            pimTask.isOverDue = false;
            expect(pimTask.isOverDue).to.be.equal(false);
            pimTask.isOverDue = true;
            expect(pimTask.isOverDue).to.be.equal(true);

            //isCompleted
            pimTask = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            pimTask.isComplete = true;
            expect(pimTask.isComplete).to.be.equal(true);

            pimTask.isComplete = false;
            expect(pimTask.isComplete).to.be.equal(false);
            pimTask.isNotStarted = true;
            pimTask.isComplete = false;
            expect(pimTask.isComplete).to.be.equal(false);
            pimTask.isComplete = true;
            expect(pimTask.isComplete).to.be.equal(true);

            //isRejected
            pimTask = PimItemFactory.newPimTask(pimObject, PimItemFormat.DOCUMENT);
            pimTask.isRejected = true;
            expect(pimTask.isRejected).to.be.equal(true);

            pimTask.isRejected = false;
            expect(pimTask.isRejected).to.be.equal(false);
            pimTask.isComplete = true;
            pimTask.isRejected = false;
            expect(pimTask.isRejected).to.be.equal(false);
            pimTask.isRejected = true;
            expect(pimTask.isRejected).to.be.equal(true);
        });

    });

})

