/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from '@loopback/testlab';
import { JmapAlert, JmapParticipant, PimCommonEventsJmap } from '../../../../internal';
import { OffsetTrigger } from '../../../../keep/pim/jmap/PimCommonEventsJmap';
import { KeepPimConstants } from '../../../../keep/pim/KeepPimConstants';
import { v4 as uuidv4 } from 'uuid';
import { compareDateStrings, deepcopy } from '../../../test-helper';
import { PimRecurrenceRule } from '../../../../keep/pim/jmap/PimRecurrenceRule';

/**
 * Unit tests for the PimCommonEventsJmap class
 */

// Mock PimCommonEventsJmap subclass to expose protected functions
class MockPimCommonEventsJmap extends PimCommonEventsJmap {
    getParticipants(): JmapParticipant[] {
        return super.getParticipants();
    }

    removeParticipants(email?: string, role?: string): void {
        super.removeParticipants(email, role);
    }

    removeParticipantRole(email: string, role: string): void {
        super.removeParticipantRole(email, role);
    }

    getParticipantsWithRole(role: string): JmapParticipant[] {
        return super.getParticipantsWithRole(role);
    }

    getParticipantsWithEmail(email: string): JmapParticipant[] {
        return super.getParticipantsWithEmail(email);
    }

    isParticipantRequired(participant: JmapParticipant): boolean {
        return super.isParticipantRequired(participant);
    }

    getParticipantId(email: string): string | undefined {
        return super.getParticipantId(email);
    }

    get endDates(): Date[] {
        return [];
    }

    set endDates(eDates: Date[]) {
        // Do nothing as a default
    }
}

describe("PimCommonEventJmap tests", function () {
    describe("Test getters and setters", function () {

        it('PimCommonEventsJmap.start', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.start).to.be.undefined();

            const dateString = "2020-12-25T15:00:00Z";
            pimObject.start = dateString;
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(compareDateStrings(pimItem.start!, dateString)).to.be.eql(0);

            pimItem.start = undefined;
            expect(pimItem.start).to.be.eql(undefined);
        });

        it('PimCommonEventsJmap.alarm', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.alarm).to.be.undefined();

            pimObject.alerts = {};
            let alert = new JmapAlert();
            let trigger: OffsetTrigger = new OffsetTrigger();
            trigger.offset = 'PT3S';
            alert.trigger = trigger;
            pimObject.alerts[uuidv4()] = alert;
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.alarm).to.be.equal(0);  // alarm is in minutes

            pimObject.alerts = {};
            alert = new JmapAlert();
            trigger = new OffsetTrigger();
            trigger.offset = '-PT3S';
            alert.trigger = trigger;
            pimObject.alerts[uuidv4()] = alert;
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.alarm).to.be.equal(0);  // alarm is in minutes

            pimObject.alerts = {};
            alert = new JmapAlert();
            trigger = new OffsetTrigger();
            trigger.offset = '-PT63S';
            alert.trigger = trigger;
            pimObject.alerts[uuidv4()] = alert;
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.alarm).to.be.equal(-1);  // alarm is in minutes

            pimObject.alerts = {};
            alert = new JmapAlert();
            trigger = new OffsetTrigger();
            trigger.offset = 'PT63S';
            alert.trigger = trigger;
            pimObject.alerts[uuidv4()] = alert;
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.alarm).to.be.equal(1);  // alarm is in minutes

            pimObject.alerts = {};
            alert = new JmapAlert();
            trigger = new OffsetTrigger();
            trigger.offset = 'PT63M';
            alert.trigger = trigger;
            pimObject.alerts[uuidv4()] = alert;
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.alarm).to.be.equal(63);  // alarm is in minutes

            pimObject.alerts = {};
            alert = new JmapAlert();
            trigger = new OffsetTrigger();
            trigger.offset = '-PT63M';
            alert.trigger = trigger;
            pimObject.alerts[uuidv4()] = alert;
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.alarm).to.be.equal(-63);  // alarm is in minutes

            pimItem.alarm = 5;
            expect(pimItem.alarm).to.be.equal(5);

            pimItem.alarm = undefined;
            expect(pimItem.alarm).to.be.undefined();
        });

        it('PimCommonEventsJmap.recurrenceId', () => {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.recurrenceId).to.be.undefined();

            pimObject.recurrenceId = "2022-07-14T15:00:00";
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.recurrenceId).to.be.equal(pimObject.recurrenceId);

            pimItem.recurrenceId = undefined;
            expect(pimItem.recurrenceId).to.be.undefined();

            // Having recurrenceId and recurrenceRules is invalid. Can't set recurrenceId when 
            // recurrenceRules are set. 
            pimObject.recurrenceId = undefined;
            pimObject.recurrenceRules = [{
                "@type": "RecurrenceRule",
                "frequency": "daily",
                "count": 10
            }];
            pimItem = new MockPimCommonEventsJmap(pimObject);
            pimItem.recurrenceId = "2022-07-14T15:00:00";
            expect(pimItem.recurrenceId).to.be.undefined();

        });

        it('PimCommonEventsJmap.recurrenceRules', () => {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.recurrenceRules).to.be.undefined();

            pimObject.recurrenceRules = [{
                "@type": "RecurrenceRule",
                "frequency": "daily",
                "count": 10
            },
            {
                "@type": "RecurrenceRule",
                "frequency": "yearly",
                "byMonthDay": [14],
                "byMonth": ["7"]
            }];
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.recurrenceRules!.length).to.be.equal(2);

            pimItem.recurrenceRules = [];
            expect(pimItem.recurrenceRules).to.be.undefined();

            const rule = new PimRecurrenceRule({
                "@type": "RecurrenceRule",
                "frequency": "daily",
                "count": 10
            });
            pimItem.recurrenceRules = [rule];
            expect(pimItem.recurrenceRules.length).to.be.equal(1);

            pimItem.recurrenceRules = undefined;
            expect(pimItem.recurrenceRules).to.be.undefined();

            // Having recurrenceId and recurrenceRules is invalid. Can't set recurrenceRules when 
            // recurrenceId is set. 
            pimItem.recurrenceId = "2022-07-14T15:00:00";
            pimItem.recurrenceRules = [rule];
            expect(pimItem.recurrenceRules).to.be.undefined();

        });

        it('PimCommonEventsJmap.excludedRecurrenceRules', () => {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.excludedRecurrenceRules).to.be.undefined();

            pimObject.excludedRecurrenceRules = [{
                "@type": "RecurrenceRule",
                "frequency": "daily",
                "count": 10
            },
            {
                "@type": "RecurrenceRule",
                "frequency": "yearly",
                "byMonthDay": [14],
                "byMonth": ["7"]
            }];
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.excludedRecurrenceRules!.length).to.be.equal(2);

            pimItem.excludedRecurrenceRules = [];
            expect(pimItem.excludedRecurrenceRules).to.be.undefined();

            const rule = new PimRecurrenceRule({
                "@type": "RecurrenceRule",
                "frequency": "daily",
                "count": 10
            });
            pimItem.excludedRecurrenceRules = [rule];
            expect(pimItem.excludedRecurrenceRules.length).to.be.equal(1);

            pimItem.excludedRecurrenceRules = undefined;
            expect(pimItem.excludedRecurrenceRules).to.be.undefined();

        });

        it('PimCommonEventsJmap.recurrenceOverrides', () => {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.recurrenceOverrides).to.be.undefined();

            pimObject.recurrenceOverrides = {
                "2020-01-07T14:00:00": {
                    "title": "Introduction to Calculus I (optional)"
                },
                "2020-04-01T09:00:00": {
                    "excluded": true
                }
            };

            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.recurrenceOverrides).to.not.be.undefined();
            expect(pimItem.recurrenceOverrides["2020-04-01T09:00:00"]["excluded"]).to.be.true();

            pimItem.recurrenceOverrides = undefined; 
            expect(pimItem.recurrenceOverrides).to.be.undefined();

            pimItem.recurrenceOverrides = {
                "2020-01-07T14:00:00": {
                    "title": "My Title"
                }
            };
            expect(pimItem.recurrenceOverrides).to.not.be.undefined();
            expect(pimItem.recurrenceOverrides["2020-01-07T14:00:00"]["title"]).to.be.equal("My Title");

            // Having recurrenceId and recurrenceOverrides is invalid. Can't set recurrenceOverrides when 
            // recurrenceId is set. 
            pimItem.recurrenceOverrides = undefined; 
            pimItem.recurrenceId = "2022-07-14T15:00:00";
            pimItem.recurrenceOverrides = {
                "2020-01-07T14:00:00": {
                    "title": "My Title"
                }
            };
            expect(pimItem.recurrenceOverrides).to.be.undefined();
        });

    });

    describe("Test participant helpers", function () {
        it('PimCommonEventsJmap.getParticipants', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipants()).to.be.eql([]);

            const participant: any = {
                type: "Participant",
                roles: {
                    "attendee": true
                }
            }
            const participant2: any = {
                type: "Participant",
                roles: {
                    "attendee": true
                }
            }
            pimObject.participants = {
                "abcdef": participant,
                "ghi": participant2
            }

            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipants()).to.be.deepEqual(Object.values(pimObject.participants));

        });

        it('PimCommonEventsJmap.removeParticipants', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = new MockPimCommonEventsJmap(pimObject);
            pimItem.removeParticipants();
            expect(pimItem.getParticipants()).to.be.eql([]);

            const part1Email = "part1@test.com";
            const participant: any = {
                type: "Participant",
                email: part1Email,
                roles: {
                    "attendee": true
                }
            }
            const part2Email = "part2@test.com";
            const participant2: any = {
                type: "Participant",
                email: part2Email,
                roles: {
                    "chair": true
                }
            }
            pimObject.participants = {
                "abcdef": participant,
                "ghi": participant2
            }

            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipants()).to.be.deepEqual(Object.values(pimObject.participants));
            pimItem.removeParticipants();
            expect(pimItem.getParticipants()).to.be.eql([]);

            pimObject.participants = {
                "abcdef": participant,
                "ghi": participant2
            }
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipants()).to.be.deepEqual(Object.values(pimObject.participants));
            pimItem.removeParticipants(part2Email);
            expect(pimItem.getParticipants()).to.be.deepEqual([participant]);

            pimObject.participants = {
                "abcdef": participant,
                "ghi": participant2
            }
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipants()).to.be.deepEqual(Object.values(pimObject.participants));
            pimItem.removeParticipants(part1Email);
            expect(pimItem.getParticipants()).to.be.deepEqual([participant2]);

            pimObject.participants = {
                "abcdef": participant,
                "ghi": participant2
            }
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipants()).to.be.deepEqual(Object.values(pimObject.participants));
            pimItem.removeParticipants(undefined, "chair");
            expect(pimItem.getParticipants()).to.be.deepEqual([participant]);

            pimObject.participants = {
                "abcdef": participant,
                "ghi": participant2
            }
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipants()).to.be.deepEqual(Object.values(pimObject.participants));
            pimItem.removeParticipants(undefined, "attendee");
            expect(pimItem.getParticipants()).to.be.deepEqual([participant2]);

            pimObject.participants = {
                "abcdef": participant,
                "ghi": participant2
            }
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipants()).to.be.deepEqual(Object.values(pimObject.participants));
            pimItem.removeParticipants(part1Email, "attendee");
            expect(pimItem.getParticipants()).to.be.deepEqual([participant2]);

            pimObject.participants = {
                "abcdef": participant,
                "ghi": participant2
            }
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipants()).to.be.deepEqual(Object.values(pimObject.participants));
            pimItem.removeParticipants(part2Email, "attendee");
            expect(pimItem.getParticipants()).to.be.deepEqual(Object.values(pimObject.participants));
        });

        it('PimCommonEventsJmap.removeParticipantRole', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            const part1Email = "part1@test.com";
            const participant: any = {
                type: "Participant",
                email: part1Email,
                roles: {
                    "attendee": true
                }
            }
            const part2Email = "part2@test.com";
            const participant2: any = {
                type: "Participant",
                email: part2Email,
                roles: {
                    "chair": true
                }
            }
            const part3Email = "part3@test.com";
            const participant3: any = {
                type: "Participant",
                email: part3Email,
                roles: {
                    "optional": true,
                    "contact": true
                }
            }
            const part4Email = "part4@test.com";
            const participant4: any = {
                type: "Participant",
                email: part4Email,
                roles: {
                    "informational": true,
                    "contact": true
                }
            }
            pimObject.participants = {
                "abc": participant,
                "def": participant2,
                "ghi": participant3,
                "jkl": participant4
            }

            let pimItem = new MockPimCommonEventsJmap(deepcopy(pimObject));
            expect(pimItem.getParticipants()).to.be.deepEqual(Object.values(pimObject.participants));
            pimItem.removeParticipantRole("bademail@error.com", KeepPimConstants.ROLE_ATTENDEE);
            expect(pimItem.getParticipants()).to.be.deepEqual(Object.values(pimObject.participants));

            pimItem = new MockPimCommonEventsJmap(deepcopy(pimObject));
            pimItem.removeParticipantRole(part1Email, KeepPimConstants.ROLE_ATTENDEE);
            expect(pimItem.getParticipants().filter(part => part.email === part1Email)).to.be.eql([]);
            expect(pimItem.getParticipants().length).to.be.equal(3);

            pimItem = new MockPimCommonEventsJmap(deepcopy(pimObject));
            pimItem.removeParticipantRole(part2Email, KeepPimConstants.ROLE_CHAIR);
            expect(pimItem.getParticipants().filter(part => part.email === part2Email)).to.be.eql([]);
            expect(pimItem.getParticipants().length).to.be.equal(3);

            pimItem = new MockPimCommonEventsJmap(deepcopy(pimObject));
            pimItem.removeParticipantRole(part3Email, KeepPimConstants.ROLE_OPTIONAL);
            expect(pimItem.getParticipants().length).to.be.equal(4);
            let parts = pimItem.getParticipants().filter(part => part.email === part3Email);
            expect(parts.length).to.be.equal(1);
            expect(Object.keys(parts[0].roles)).to.be.eql([KeepPimConstants.ROLE_CONTACT]);

            pimItem = new MockPimCommonEventsJmap(deepcopy(pimObject));
            pimItem.removeParticipantRole(part3Email, KeepPimConstants.ROLE_CONTACT);
            expect(pimItem.getParticipants().length).to.be.equal(4);
            parts = pimItem.getParticipants().filter(part => part.email === part3Email);
            expect(parts.length).to.be.equal(1);
            expect(Object.keys(parts[0].roles)).to.be.eql([KeepPimConstants.ROLE_OPTIONAL]);

            pimItem = new MockPimCommonEventsJmap(deepcopy(pimObject));
            pimItem.removeParticipantRole(part4Email, KeepPimConstants.ROLE_INFORMATIONAL);
            expect(pimItem.getParticipants().length).to.be.equal(4);
            parts = pimItem.getParticipants().filter(part => part.email === part4Email);
            expect(parts.length).to.be.equal(1);
            expect(Object.keys(parts[0].roles)).to.be.eql([KeepPimConstants.ROLE_CONTACT]);

            pimItem = new MockPimCommonEventsJmap(deepcopy(pimObject));
            pimItem.removeParticipantRole(part4Email, KeepPimConstants.ROLE_CONTACT);
            expect(pimItem.getParticipants().length).to.be.equal(4);
            parts = pimItem.getParticipants().filter(part => part.email === part4Email);
            expect(parts.length).to.be.equal(1);
            expect(Object.keys(parts[0].roles)).to.be.eql([KeepPimConstants.ROLE_INFORMATIONAL]);

        });

        it('PimCommonEventsJmap.getParticipantsWithRole', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipantsWithRole(KeepPimConstants.ROLE_OWNER)).to.be.eql([]);

            const part1Email = "part1@test.com";
            const participant: any = {
                type: "Participant",
                email: part1Email,
                roles: {
                    "attendee": true
                }
            }
            const part2Email = "part2@test.com";
            const participant2: any = {
                type: "Participant",
                email: part2Email,
                roles: {
                    "chair": true
                }
            }
            const part3Email = "part3@test.com";
            const participant3: any = {
                type: "Participant",
                email: part3Email,
                roles: {
                    "attendee": true
                }
            }

            pimObject.participants = {
                "abcdef": participant,
                "ghi": participant2
            }
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipants()).to.be.deepEqual(Object.values(pimObject.participants));
            expect(pimItem.getParticipantsWithRole(KeepPimConstants.ROLE_CONTACT)).to.be.eql([]);
            expect(pimItem.getParticipantsWithRole(KeepPimConstants.ROLE_ATTENDEE)).to.be.eql([participant]);
            expect(pimItem.getParticipantsWithRole(KeepPimConstants.ROLE_CHAIR)).to.be.eql([participant2]);
            expect(pimItem.getParticipantsWithRole(KeepPimConstants.ROLE_INFORMATIONAL)).to.be.eql([]);
            pimObject.participants = {
                "abcdef": participant,
                "ghi": participant2,
                "jkl": participant3
            }
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipantsWithRole(KeepPimConstants.ROLE_ATTENDEE)).to.be.eql([participant, participant3]);
        });

        it('PimCommonEventsJmap.getParticipantsWithEmail', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipantsWithEmail('test@invalid.com')).to.be.eql([]);

            const part1Email = "part1@test.com";
            const participant: any = {
                type: "Participant",
                email: part1Email,
                roles: {
                    "attendee": true
                }
            }
            const part2Email = "part2@test.com";
            const participant2: any = {
                type: "Participant",
                email: part2Email,
                roles: {
                    "chair": true
                }
            }
            const part3Email = "part3@test.com";
            const participant3: any = {
                type: "Participant",
                email: part3Email,
                roles: {
                    "attendee": true
                }
            }

            pimObject.participants = {
                "abcdef": participant,
                "ghi": participant2
            }
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipants()).to.be.deepEqual(Object.values(pimObject.participants));
            expect(pimItem.getParticipantsWithEmail(part1Email)).to.be.eql([participant]);
            expect(pimItem.getParticipantsWithEmail(part2Email)).to.be.eql([participant2]);
            expect(pimItem.getParticipantsWithRole(part3Email)).to.be.eql([]);
            pimObject.participants = {
                "abcdef": participant,
                "ghi": participant2,
                "jkl": participant3
            }
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipantsWithEmail(part3Email)).to.be.eql([participant3]);
        });
        
        it('PimCommonEventsJmap.isParticipantRequired', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.isParticipantRequired(new JmapParticipant())).to.be.false();

            const part1Email = "part1@test.com";
            const participant: JmapParticipant = {
                type: "Participant",
                email: part1Email,
                roles: {
                    "attendee": true
                }
            }
            const part2Email = "part2@test.com";
            const participant2: JmapParticipant = {
                type: "Participant",
                email: part2Email,
                roles: {
                    "chair": true
                }
            }
            const part3Email = "part3@test.com";
            const participant3: JmapParticipant = {
                type: "Participant",
                email: part3Email,
                roles: {
                    "attendee": true
                }
            }
            const part4Email = "part4@test.com";
            const participant4: JmapParticipant = {
                type: "Participant",
                email: part4Email,
                roles: {
                    "informational": true,
                    "contact": true
                }
            }
            const part5Email = "part5@test.com";
            const participant5: JmapParticipant = {
                type: "Participant",
                email: part5Email,
                roles: {
                    "contact": true
                }
            }
            const part6Email = "part6@test.com";
            const participant6: JmapParticipant = {
                type: "Participant",
                email: part6Email,
                roles: {
                    "owner": true
                }
            }

            const part7Email = "part7@test.com";
            const participant7: JmapParticipant = {
                type: "Participant",
                email: part7Email,
                roles: {
                    "optional": true
                }
            }
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.isParticipantRequired(participant)).to.be.true();
            expect(pimItem.isParticipantRequired(participant2)).to.be.true();
            expect(pimItem.isParticipantRequired(participant3)).to.be.true();
            expect(pimItem.isParticipantRequired(participant4)).to.be.false();
            expect(pimItem.isParticipantRequired(participant5)).to.be.false();
            expect(pimItem.isParticipantRequired(participant6)).to.be.false();
            expect(pimItem.isParticipantRequired(participant7)).to.be.false();
        });

        it('PimCommonEventsJmap.getParticipantId', function () {
            const pimObject: any = {
                "uid": "unid",
            };

            let pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipantId('')).to.be.undefined();

            const part1Email = "part1@test.com";
            const participant: JmapParticipant = {
                type: "Participant",
                email: part1Email,
                roles: {
                    "attendee": true
                }
            }
            const part2Email = "part2@test.com";
            const participant2: JmapParticipant = {
                type: "Participant",
                email: part2Email,
                roles: {
                    "chair": true
                }
            }
            const part3Email = "part3@test.com";
            const participant3: JmapParticipant = {
                type: "Participant",
                email: part3Email,
                roles: {
                    "attendee": true
                }
            }
            const part4Email = "part4@test.com";
            const participant4: JmapParticipant = {
                type: "Participant",
                email: part4Email,
                roles: {
                    "informational": true,
                    "contact": true
                }
            }
            const part5Email = "part5@test.com";
            const participant5: JmapParticipant = {
                type: "Participant",
                email: part5Email,
                roles: {
                    "contact": true
                }
            }
            const part6Email = "part6@test.com";

            const part7Email = "part7@test.com";
            const participant7: JmapParticipant = {
                type: "Participant",
                email: part7Email,
                roles: {
                    "optional": true
                }
            }
            pimObject.participants = {
                "abcdef": participant,
                "ghi": participant2,
                "jkl": participant3,
                "mno": participant4,
                "pqr": participant5,
                "stu": participant7
            }
            pimItem = new MockPimCommonEventsJmap(pimObject);
            expect(pimItem.getParticipants()).to.be.deepEqual(Object.values(pimObject.participants));
            expect(pimItem.getParticipantId(part1Email)).to.be.eql("abcdef");
            expect(pimItem.getParticipantId(part2Email)).to.be.eql("ghi");
            expect(pimItem.getParticipantId(part3Email)).to.be.eql("jkl");
            expect(pimItem.getParticipantId(part4Email)).to.be.eql("mno");
            expect(pimItem.getParticipantId(part5Email)).to.be.eql("pqr");

            // Not a participant
            expect(pimItem.getParticipantId(part6Email)).to.be.undefined();

            expect(pimItem.getParticipantId(part7Email)).to.be.eql("stu");
        });

    });

});


