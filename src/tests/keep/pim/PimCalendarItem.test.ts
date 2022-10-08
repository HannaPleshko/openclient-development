/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PimCalendarItem, PimImportance, PimItemFactory } from '../../../internal';
import { expect } from '@loopback/testlab';
import { PimItemFormat, PimParticipationStatus } from '../../../keep';
import { compareDateStrings } from '../../test-helper';
import { addTimeZone } from '../../..';

describe('PimCalendarItem tests', () => {

    let chairParticipant: any;
    let ownerParticipant: any;
    let optionalParticipant: any;
    let fyiParticipant: any;
    let attendeeParticipant: any;


    beforeEach(function () {
        chairParticipant = {
            email: 'chair@hcl.com',
            type: 'Participant',
            roles: {
                chair: true
            }
        }

        // contactParticipant = {
        //     email: 'contacdt@hcl.com',
        //     type: 'Participant',
        //     roles: {
        //         contact: true
        //     }
        // }

        ownerParticipant = {
            email: 'owner@hcl.com',
            type: 'Participant',
            roles: {
                owner: true
            }
        }

        optionalParticipant = {
            email: 'optional@hcl.com',
            type: 'Participant',
            roles: {
                optional: true
            },
            participationStatus: 'declined'
        }

        fyiParticipant = {
            email: 'fyi@hcl.com',
            type: 'Participant',
            roles: {
                informational: true
            },
            participationStatus: 'tentative'
        }

        attendeeParticipant = {
            email: 'attendee@hcl.com',
            type: 'Participant',
            roles: {
                attendee: true
            },
            participationStatus: 'accepted'
        }
    });


    describe('Test getter and setter', () => {

        it('isPimCalendarItem', () => {
            const pimObject = {
                uid: "testunid"
            }

            const pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "CalendarName", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isPimCalendarItem()).to.be.true();
        });

        it('calendarName', () => {
            const pimObject = {
                uid: "testunid"
            }

            const pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "CalendarName", PimItemFormat.DOCUMENT);

            expect(pimCalendarItem.calendarName).to.be.equal('CalendarName');
            pimCalendarItem.calendarName = 'updated-calendername';
            expect(pimCalendarItem.calendarName).to.be.equal('updated-calendername');
            pimCalendarItem.calendarName = "";
            expect(pimCalendarItem.calendarName).to.be.equal("");
        });

        it('importance', () => {
            const pimObject = {
                priority: 1
            }

            let pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "Importance", PimItemFormat.DOCUMENT);

            expect(pimCalendarItem.importance).to.be.equal(PimImportance.HIGH);
            pimCalendarItem.importance = PimImportance.MEDIUM;
            expect(pimCalendarItem.importance).to.be.equal(PimImportance.MEDIUM);
            pimCalendarItem.importance = PimImportance.LOW;
            expect(pimCalendarItem.importance).to.be.equal(PimImportance.LOW);
            pimCalendarItem.importance = PimImportance.NONE;
            expect(pimCalendarItem.importance).to.be.equal(PimImportance.NONE);
            pimCalendarItem.importance = PimImportance.HIGH;
            expect(pimCalendarItem.importance).to.be.equal(PimImportance.HIGH);

            pimObject.priority = 22;
            pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "Importance", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.importance).to.be.equal(PimImportance.NONE);

            pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "Importance", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.importance).to.be.equal(PimImportance.NONE);
        });

        it('isPrivate', () => {

            const pimObject = {
                privacy: 'public'
            }

            let pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isPrivate).to.be.false();
            pimCalendarItem.isPrivate = true;
            expect(pimCalendarItem.isPrivate).to.be.true();
            pimCalendarItem.isPrivate = false;
            expect(pimCalendarItem.isPrivate).to.be.false();

            pimCalendarItem = PimItemFactory.newPimCalendarItem({ "@unid": "testunid" }, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isPrivate).to.be.false();

            pimObject.privacy = 'private';

            pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isPrivate).to.be.true();

            pimCalendarItem = PimItemFactory.newPimCalendarItem({}, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isPrivate).to.be.false();

        });

        it('location', () => {
            let pimObject: any = {
                "locations": {
                    "0dfb8ace-aad1-4734-b3b4-a2fe3d6ae1c5": {
                        "@type": "Location",
                        "name": "Conference room A",
                        "description": "Math Lab I, Department of Mathematics"
                    },
                    "0dfb8ace-aaas-4734-b3b4-a2fe3d6ae1c5": {
                        "@type": "Location",
                        "name": "",
                        "description": "Cafe"
                    },
                    "0dfb8ace-aaas-4734-12b4-a2fe3d6ae1c5": {
                        "@type": "Location",
                        "name": "",
                        "description": ""
                    }
                }
            }

            let pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "Location", PimItemFormat.DOCUMENT);

            expect(pimCalendarItem.location).to.be.equal('Conference room A; Cafe');
            pimCalendarItem.location = 'updated-location';
            expect(pimCalendarItem.location).to.be.equal('updated-location; Cafe');
            pimCalendarItem.location = "";
            expect(pimCalendarItem.location).to.be.equal("Cafe");

            pimCalendarItem = PimItemFactory.newPimCalendarItem({}, "Location", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.location).to.be.undefined();
            pimCalendarItem.location = "Raleigh";
            expect(pimCalendarItem.location).to.be.equal("Raleigh");

            pimCalendarItem = PimItemFactory.newPimCalendarItem({ locations: {} }, "Location", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.location).to.be.undefined();

            pimObject = {
                "locations": {
                    "0dfb8ace-aad1-4734-b3b4-a2fe3d6ae1c5": {
                        "@type": "Location",
                        "name": "",
                        'description': ""
                    },
                }
            }
            pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "Location", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.location).to.be.undefined();

        });

        // FIXME:  Do we need to factor in timeZone?
        it('createdDate', () => {
            const pimObject = {
                created: "2020-12-25T15:00:00.000Z",
            }

            const pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "CreatedDate", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.createdDate).to.be.eql(new Date("2020-12-25T15:00:00.000Z"));

            pimCalendarItem.createdDate = new Date("2021-01-25T15:00:00.000Z");
            expect(pimCalendarItem.createdDate.getTime() - new Date("2021-01-25T15:00:00.000Z").getTime()).to.be.equal(0);

            pimCalendarItem.createdDate = undefined;
            expect(pimCalendarItem.createdDate).to.be.undefined();
        });

        it('start', () => {
            let expectedStart = "2021-01-25T15:00:00.000Z";
            const pimObject = {
                start: expectedStart
            }

            let pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "StartDate", PimItemFormat.DOCUMENT);
            expect(compareDateStrings(pimCalendarItem.start!, expectedStart)).to.be.eql(0);

            expectedStart = "2021-03-25T15:00:00.000Z";
            pimCalendarItem.start = expectedStart;
            expect(pimCalendarItem.startTimeZone).to.be.equal('Etc/UTC');
            expect(compareDateStrings(pimCalendarItem.start, expectedStart)).to.be.equal(0);

            // Above would set start time zone to UTC
            expectedStart = "2021-04-25T10:00:00.000-05:00";
            pimCalendarItem.start = expectedStart;
            expect(pimCalendarItem.startTimeZone).to.be.equal('Etc/UTC');
            expect(compareDateStrings(pimCalendarItem.start, expectedStart)).to.be.equal(0);

            // Test with no start time zone set and time zone in start string
            pimCalendarItem.startTimeZone = undefined; 
            pimCalendarItem.start = expectedStart;
            expect(pimCalendarItem.startTimeZone).to.be.equal('Etc/GMT+5');
            expect(compareDateStrings(pimCalendarItem.start, expectedStart)).to.be.eql(0);

            // Test with no start time zone set and no time zone in start string
            expectedStart = "2021-04-25T10:00:00.000";
            pimCalendarItem.startTimeZone = undefined; 
            pimCalendarItem.start = expectedStart;
            expect(pimCalendarItem.startTimeZone).to.be.undefined(); 
            expect(compareDateStrings(pimCalendarItem.start, expectedStart)).to.be.eql(0);

            pimCalendarItem.start = undefined;
            expect(pimCalendarItem.start).to.be.undefined();

            pimCalendarItem = PimItemFactory.newPimCalendarItem({}, "StartDate", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.start).to.be.undefined();
        });

        it('end', () => {
            const startString = "2021-01-25T15:00:00.000Z";
            let expectedEnd = "2021-01-25T16:00:00.000Z";
            const pimObject = {
                start: startString,
                duration: "PT1H"
            }

            let pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.end).to.not.be.undefined();
            expect(compareDateStrings(pimCalendarItem.end!, expectedEnd)).to.be.equal(0);

            // With exact timezone
            expectedEnd = "2021-01-25T09:00:00.000-08:00";
            pimCalendarItem.end = expectedEnd;
            expect(pimCalendarItem.duration).to.be.equal("PT2H");
            expect(pimCalendarItem.end).to.not.be.undefined();
            expect(compareDateStrings(pimCalendarItem.end, expectedEnd)).to.be.equal(0);


            // With UTC time
            expectedEnd = "2021-01-25T17:00:00.000Z";
            pimCalendarItem.end = expectedEnd;
            expect(pimCalendarItem.duration).to.be.equal("PT2H");
            expect(pimCalendarItem.end).to.not.be.undefined();
            expect(compareDateStrings(pimCalendarItem.end, expectedEnd)).to.be.equal(0);

            // Set end before start
            pimCalendarItem = PimItemFactory.newPimCalendarItem({}, "default", PimItemFormat.DOCUMENT);
            pimCalendarItem.end = expectedEnd;
            expect(pimCalendarItem.end).to.not.be.undefined();
            expect(compareDateStrings(pimCalendarItem.end, expectedEnd)).to.be.equal(0);
            expect(pimCalendarItem.start).to.be.undefined();
            expect(pimCalendarItem.duration).to.be.undefined();
            pimCalendarItem.start = startString; // setting start should cause duration to be set based on previous end setting
            expect(pimCalendarItem.duration).to.be.equal("PT2H");
            expect(pimCalendarItem.end).to.not.be.undefined();
            expect(compareDateStrings(pimCalendarItem.end, expectedEnd)).to.be.equal(0);

            /**
             * With different start/end timezones
             * 
             * The event starts time is 3pm Eastern Time, (12pm Pacific time)
             * The event end date is 2pm Pacific time, which should be 2 hour duration. 
             */
            pimCalendarItem.startTimeZone = "America/New_York";
            pimCalendarItem.start = "2021-01-25T15:00:00.000";
            pimCalendarItem.endTimeZone = "America/Los_Angeles";
            pimCalendarItem.end = "2021-01-25T14:00:00.000"; 
            expect(pimCalendarItem.duration).to.be.equal("PT2H");
            expect(pimCalendarItem.end).to.not.be.undefined();
            expect(compareDateStrings(pimCalendarItem.end, "2021-01-25T14:00:00.000-08:00")).to.be.equal(0);

        });

        it('Validate start/end with and without timezone', () => {
            // Use a string with the timezone and time  zone set
            let expectedStart = '2020-03-18T13:58:51-04:00';
            let expectedEnd = '2020-03-18T14:58:51-04:00';
            let pimCalendarItem = PimItemFactory.newPimCalendarItem({}, "default", PimItemFormat.DOCUMENT);
            pimCalendarItem.startTimeZone = 'America/Los_Angeles';
            pimCalendarItem.endTimeZone = 'America/Los_Angeles';
            pimCalendarItem.start = expectedStart;
            pimCalendarItem.duration = 'PT1H'
            expect(compareDateStrings(pimCalendarItem.start, expectedStart)).to.be.eql(0);
            expect(compareDateStrings(pimCalendarItem.end!, expectedEnd)).to.be.eql(0);

            // Use start time without the timezone and time zone set
            expectedStart = '2020-09-20T09:58:51';
            expectedEnd = '2020-09-20T10:58:51';
            pimCalendarItem = PimItemFactory.newPimCalendarItem({}, "default", PimItemFormat.DOCUMENT);
            pimCalendarItem.startTimeZone = 'Europe/Minsk';
            pimCalendarItem.endTimeZone = 'Europe/Minsk';
            pimCalendarItem.start = expectedStart;
            pimCalendarItem.duration = 'PT1H'
            expect(compareDateStrings(pimCalendarItem.start, addTimeZone(expectedStart, pimCalendarItem.startTimeZone))).to.be.eql(0);
            expect(compareDateStrings(pimCalendarItem.end!, addTimeZone(expectedEnd, pimCalendarItem.endTimeZone))).to.be.eql(0);

            // Use start time without the timezone and no time zone set
            expectedStart = '2020-04-10T16:58:51';
            expectedEnd = '2020-04-10T17:58:51';
            pimCalendarItem = PimItemFactory.newPimCalendarItem({}, "default", PimItemFormat.DOCUMENT);
            pimCalendarItem.start = expectedStart;
            pimCalendarItem.duration = 'PT1H'
            expect(compareDateStrings(pimCalendarItem.start, expectedStart)).to.be.eql(0);
            expect(compareDateStrings(pimCalendarItem.end!, expectedEnd)).to.be.eql(0);

        });

        it('startTimeZone', () => {
            let tz = "America/New_York";
            const pimObject: any = {
                timeZone: tz
            }

            const pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "StartTimeZone", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.startTimeZone).to.be.equal(tz);

            tz = "Asia/Manila"
            pimCalendarItem.startTimeZone = tz;
            expect(pimCalendarItem.startTimeZone).to.be.equal(tz);

            tz = "UTC"
            pimCalendarItem.startTimeZone = tz;
            expect(pimCalendarItem.startTimeZone).to.be.equal('Etc/UTC');

            tz = "UTC-5"
            pimCalendarItem.startTimeZone = tz;
            expect(pimCalendarItem.startTimeZone).to.be.equal('Etc/GMT+5');

            tz = "UTC+8"
            pimCalendarItem.startTimeZone = tz;
            expect(pimCalendarItem.startTimeZone).to.be.equal('Etc/GMT-8');

            tz = "";
            pimCalendarItem.startTimeZone = tz;
            expect(pimCalendarItem.startTimeZone).to.be.equal(tz);
        });

        it('endTimeZone', () => {

            let tz = "America/New_York";
            const pimObject: any = {
                locations: {
                    'ABCD': {
                        '@type': 'Location',
                        'relativeTo': 'end',
                        'timeZone': tz
                    }
                }
            }

            let pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "EndTimeZone", PimItemFormat.DOCUMENT);

            expect(pimCalendarItem.endTimeZone).to.be.equal(tz);

            tz = "Asia/Manila"
            pimCalendarItem.endTimeZone = tz;
            expect(pimCalendarItem.endTimeZone).to.be.equal(tz);

            tz = "";
            pimCalendarItem.endTimeZone = tz;
            expect(pimCalendarItem.endTimeZone).to.be.equal(tz);

            tz = "UTC";
            pimCalendarItem.endTimeZone = tz;
            expect(pimCalendarItem.endTimeZone).to.be.equal('Etc/UTC');

            tz = "UTC-5";
            pimCalendarItem.endTimeZone = tz;
            expect(pimCalendarItem.endTimeZone).to.be.equal('Etc/GMT+5');

            tz = "UTC+8";
            pimCalendarItem.endTimeZone = tz;
            expect(pimCalendarItem.endTimeZone).to.be.equal('Etc/GMT-8');

            pimCalendarItem = new PimCalendarItem({}, "test");
            expect(pimCalendarItem.endTimeZone).to.be.undefined();
            tz = 'Asia/Manila';
            pimCalendarItem.endTimeZone = tz;
            expect(pimCalendarItem.endTimeZone).to.be.equal(tz);


            pimObject.locations.ABCD.relativeTo = 'start';
            pimCalendarItem = new PimCalendarItem(pimObject, "EndTimeZone");
            expect(pimCalendarItem.endTimeZone).to.be.undefined();
            pimCalendarItem.endTimeZone = tz;
            expect(pimCalendarItem.endTimeZone).to.be.equal(tz);
        });

        it("isAppointment", () => {
            let pimObject: any = {
                start: new Date(),
                duration: "PT1H",
                participants: {
                    "ABC": ownerParticipant,
                    "DEF": attendeeParticipant
                }
            }

            let pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isAppointment).to.be.false();


            delete pimObject.participants;
            pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isAppointment).to.be.true();

            // Try an all day event
            pimObject = {
                start: new Date(),
                duration: 'P1D',
                showWithoutTime: true
            }
            pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isAppointment).to.be.false();

            // Try a reminder (no duration)
            pimCalendarItem = PimItemFactory.newPimCalendarItem({ start: new Date() }, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isAppointment).to.be.false();
        });

        it("isAllDayEvent", () => {

            let pimObject: any = {
                start: new Date(),
                duration: 'P1D'
            }

            // Duration is 1 day but does not have showWithoutTime set.
            let pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isAllDayEvent).to.be.false();

            // Set to true
            pimCalendarItem.isAllDayEvent = true;
            let jmap: any = pimCalendarItem.toPimStructure();
            expect(jmap.showWithoutTime).to.be.true();
            expect(pimCalendarItem.isAllDayEvent).to.be.true();

            // Set to false
            pimCalendarItem.isAllDayEvent = false;
            jmap = pimCalendarItem.toPimStructure();
            expect(jmap.showWithoutTime).to.be.false();
            expect(pimCalendarItem.isAllDayEvent).to.be.false();

            // Multiple day all day event.
            pimObject.start = new Date("2021-04-25T00:00:00");
            pimObject.duration = 'P2D';
            pimObject.showWithoutTime = true;
            pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isAllDayEvent).to.be.true();

            // No start time
            pimCalendarItem = PimItemFactory.newPimCalendarItem({}, "default", PimItemFormat.DOCUMENT);
            expect(() => { pimCalendarItem.isAllDayEvent = true }).to.throw();

            // All day event with participants. Domino does not support this as an all day event.
            pimObject = {
                start: new Date(),
                duration: 'P1D',
                showWithoutTime: true,
                "participants": {
                    "dG9tQGZvb2Jhci5xlLmNvbQ": {
                        "@type": "Participant",
                        "name": "Tom Tool",
                        "email": "tom@foobar.example.com",
                        "sendTo": {
                            "imip": "mailto:tom@calendar.example.com"
                        },
                        "participationStatus": "accepted",
                        "roles": {
                            "attendee": true
                        }
                    }
                }
            };

            pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isAllDayEvent).to.be.false();

            // Exception should be thrown if attempt to set as all day event
            expect(() => { pimCalendarItem.isAllDayEvent = true }).to.throw();


        });

        it("isMeeting", () => {
            const pimObject: any = {
                start: new Date(),
                duration: 'P1D',
                participants: {
                    "ABC": ownerParticipant,
                    "DEF": attendeeParticipant
                }
            }

            let pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isMeeting).to.be.true();

            // Remove attendees
            delete pimObject.participants;
            pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isMeeting).to.be.false();

        });

        it("isReminder", () => {
            const pimCalendarItem = PimItemFactory.newPimCalendarItem({}, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.duration).to.be.undefined();
            const start = new Date();
            pimCalendarItem.start = start.toISOString();
            // End date should not be set so it should be a reminder
            expect(pimCalendarItem.isReminder).to.be.true();

            // End date has been set so it should not be a reminder
            pimCalendarItem.duration = 'PT1H';
            expect(pimCalendarItem.isReminder).to.be.false();

        });

        it("isTask", () => {
            const pimObject: any = {
                start: new Date(),
                duration: 'P1D',
                participants: {
                    "ABC": ownerParticipant,
                    "DEF": attendeeParticipant
                }
            }

            const pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isTask).to.be.false();
        });

        it("isDraft", () => {

            const pimCalendarItem = PimItemFactory.newPimCalendarItem({}, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.isDraft).to.be.false();

            pimCalendarItem.isDraft = true;
            expect(pimCalendarItem.isDraft).to.be.true()

            pimCalendarItem.isDraft = false;
            expect(pimCalendarItem.isDraft).to.be.false()
        });

        it("organizer", () => {
            const pimObject: any = {
                start: new Date(),
                duration: 'P1D',
                participants: {
                    "ABC": ownerParticipant,
                    "DEF": attendeeParticipant,
                    "GHI": optionalParticipant,
                    "JKL": chairParticipant
                }
            }
            let pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.organizer).to.be.equal("owner@hcl.com");

            pimCalendarItem.organizer = 'xyz@hcl.com';
            expect(pimCalendarItem.organizer).to.be.equal('xyz@hcl.com');

            pimCalendarItem.organizer = "";
            expect(pimCalendarItem.organizer).to.be.equal("");

            pimCalendarItem = new PimCalendarItem({}, "test");
            expect(pimCalendarItem.organizer).to.be.equal('');
        });

        it("requiredAttendees", () => {
            let pimObject: any = {
                start: new Date(),
                duration: 'P1D',
                participants: {
                    "ABC": ownerParticipant,
                    "DEF": attendeeParticipant,
                    "GHI": optionalParticipant,
                    "JKL": chairParticipant
                }
            }
            let pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);

            expect(pimCalendarItem.requiredAttendees).to.be.an.Array();
            expect(pimCalendarItem.requiredAttendees.length).to.be.equal(2);

            pimCalendarItem.requiredAttendees = []; // Should remove all attendees and chairs, but not the owner
            expect(pimCalendarItem.requiredAttendees).to.be.an.Array();
            expect(pimCalendarItem.requiredAttendees.length).to.be.equal(0);

            pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            pimCalendarItem.requiredAttendees = ["test1@gmail.com", "optional@hcl.com"];
            expect(pimCalendarItem.requiredAttendees).to.be.an.Array();
            expect(pimCalendarItem.requiredAttendees.length).to.be.equal(2);

            pimCalendarItem = PimItemFactory.newPimCalendarItem({}, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.requiredAttendees).to.be.eql([]);

            // Attendeess for All day event
            pimObject = {
                start: new Date(),
                duration: 'P1D',
                showWithoutTime: true
            }
            pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            // Can set an empty attendee array
            pimCalendarItem.requiredAttendees = [];
            // Can't set attendees for an all day event
            expect(() => { pimCalendarItem.requiredAttendees = ["test1@gmail.com", "attendee@hcl.com"] }).to.throw();

        });

        it("optionalAttendees", () => {
            let pimObject: any = {
                start: new Date(),
                duration: 'P1D',
                participants: {
                    "ABC": ownerParticipant,
                    "DEF": attendeeParticipant,
                    "GHI": optionalParticipant,
                    "JKL": chairParticipant,
                    'MNO': fyiParticipant
                }
            }

            let pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);

            expect(pimCalendarItem.fyiAttendees).to.be.an.Array();
            expect(pimCalendarItem.fyiAttendees.length).to.be.equal(1);

            pimCalendarItem.optionalAttendees = [];
            expect(pimCalendarItem.optionalAttendees).to.be.an.Array();
            expect(pimCalendarItem.optionalAttendees.length).to.be.equal(0);

            pimCalendarItem.requiredAttendees = ['attendee@hcl.com'];
            pimCalendarItem.optionalAttendees = ["test1@gmail.com", "attendee@hcl.com"];
            expect(pimCalendarItem.optionalAttendees).to.be.an.Array();
            expect(pimCalendarItem.optionalAttendees.length).to.be.equal(2);

            pimCalendarItem = PimItemFactory.newPimCalendarItem({}, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.optionalAttendees).to.be.eql([]);

            pimCalendarItem.optionalAttendees = ['test1@gmail.com'];
            expect(pimCalendarItem.optionalAttendees).to.be.an.Array();
            expect(pimCalendarItem.optionalAttendees.length).to.be.equal(1);

            // Attendeess for All day event
            pimObject = {
                start: new Date(),
                duration: 'P1D',
                showWithoutTime: true
            }
            pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            // Can set an empty attendee array
            pimCalendarItem.optionalAttendees = [];
            // Can't set attendees for an all day event
            expect(() => { pimCalendarItem.optionalAttendees = ["test1@gmail.com", "attendee@hcl.com"] }).to.throw();

        });

        it("fyiAttendees", () => {
            let pimObject: any = {
                start: new Date(),
                duration: 'P1D',
                participants: {
                    "ABC": ownerParticipant,
                    "DEF": attendeeParticipant,
                    "GHI": optionalParticipant,
                    "JKL": fyiParticipant
                }
            }
            let pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);

            expect(pimCalendarItem.fyiAttendees).to.be.an.Array();
            expect(pimCalendarItem.fyiAttendees.length).to.be.equal(1);

            pimCalendarItem.fyiAttendees = [];
            expect(pimCalendarItem.fyiAttendees).to.be.an.Array();
            expect(pimCalendarItem.fyiAttendees.length).to.be.equal(0);

            pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            pimCalendarItem.fyiAttendees = ["test1@gmail.com", 'optional@hcl.com'];
            expect(pimCalendarItem.fyiAttendees).to.be.an.Array();
            expect(pimCalendarItem.fyiAttendees.length).to.be.equal(2);

            pimCalendarItem = PimItemFactory.newPimCalendarItem({}, "default", PimItemFormat.DOCUMENT);
            expect(pimCalendarItem.fyiAttendees).to.be.eql([]);
            pimCalendarItem.fyiAttendees = ["test1@gmail.com", 'optional@hcl.com'];
            expect(pimCalendarItem.fyiAttendees.length).to.be.equal(2);

            // Attendeess for All day event
            pimObject = {
                start: new Date(),
                duration: 'P1D',
                showWithoutTime: true
            }
            pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);
            // Can set an empty attendee array
            pimCalendarItem.fyiAttendees = [];
            // Can't set attendees for an all day event
            expect(() => { pimCalendarItem.fyiAttendees = ["test1@gmail.com", "attendee@hcl.com"] }).to.throw();

        });
    });

    describe('Test getParticipationStatus', () => {

        it('different status types', () => {
            const pimObject: any = {
                start: new Date(),
                duration: 'P1D',
                participants: {
                    "ABC": ownerParticipant,
                    "DEF": attendeeParticipant,
                    "GHI": optionalParticipant,
                    "JKL": fyiParticipant
                }
            }
            const pimCalendarItem = PimItemFactory.newPimCalendarItem(pimObject, "default", PimItemFormat.DOCUMENT);

            expect(pimCalendarItem.getParticipationStatus(ownerParticipant.email)).to.eql(PimParticipationStatus.NEEDS_ACTION);
            expect(pimCalendarItem.getParticipationStatus(attendeeParticipant.email)).to.eql(PimParticipationStatus.ACCEPTED);
            expect(pimCalendarItem.getParticipationStatus(optionalParticipant.email)).to.eql(PimParticipationStatus.DECLINED);
            expect(pimCalendarItem.getParticipationStatus(fyiParticipant.email)).to.eql(PimParticipationStatus.TENTATIVE);
        });
    });
});