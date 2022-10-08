import { expect } from "@loopback/testlab";
import { PimCalendar } from '../../../keep';

describe('pimCalendar Test', () => {

    const calendars = {
        "default": {
            "CN=Bert Muppet/O=ProjectKeep": "MANAGER",
            "CN=Ernie Muppet/O=ProjectKeep": "AUTHOR"
        },
        "Teams": {
            "CN=Bert Muppet/O=ProjectKeep": "MANAGER"
        }
    }
    describe('test for setter and getter', () => {
        it('displayName', () => {
            const pimCalendar = new PimCalendar("default", calendars["default"]);
            expect(pimCalendar.displayName).to.be.equal('Calendar')

            pimCalendar.displayName = "display-name";
            expect(pimCalendar.displayName).to.be.equal("display-name");

            pimCalendar.displayName = "";
            expect(pimCalendar.displayName).to.be.equal("");
        });

        it("calendarName", () => {
            const pimCalendar = new PimCalendar("Teams", calendars["Teams"]);
            expect(pimCalendar.calendarName).to.be.equal("Teams");

            pimCalendar.calendarName = "name";
            expect(pimCalendar.calendarName).to.be.equal("name");
        });

        it('acl', () => {
            const pimCalendar = new PimCalendar("default", calendars["default"]);
            expect(pimCalendar.acl).to.be.deepEqual(calendars["default"]);

            pimCalendar.acl = {}
            expect(pimCalendar.acl).to.be.eql({});

        })

        it('managers', () => {
            const pimObject: any = {
                "user1": "MANAGER",
                "user2": "MANAGER",
                "user3": "AUTHOR"

            }
            const pimCalendar = new PimCalendar("default", pimObject);
            const managers = pimCalendar.managers;
            expect(managers).to.be.deepEqual(['user1', 'user2']);

            pimCalendar.managers = ["manager1", "manager2"];
            expect(pimCalendar.managers).to.be.deepEqual(["manager1", "manager2"]);

            pimCalendar.managers = [];
            expect(pimCalendar.managers).to.be.eql([]);


        })

        it('authors', () => {
            const pimObject: any = {
                "user1": "AUTHOR",
                "user2": "AUTHOR",
                "user3": "MANAGER"

            }
            const pimCalendar = new PimCalendar("default", pimObject);
            const authors = pimCalendar.authors;
            expect(authors).to.be.deepEqual(['user1','user2'])

            pimCalendar.authors = ["author1", "author2"];
            expect(pimCalendar.authors).to.be.deepEqual(["author1", "author2"]);

            pimCalendar.authors = [];
            expect(pimCalendar.authors).to.be.eql([]);
        })
    });
});