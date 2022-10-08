import { expect } from "@loopback/testlab";
import { PimLabelClassic, PimLabelTypes, KeepPimConstants, PimItemFactory } from "../../../keep";

class MockPimLabel extends PimLabelClassic {
    public typeFromView(view: string): PimLabelTypes {
        return super.typeFromView(view);
    }
    public itemFromDocument(labelObject: any): PimLabelClassic {
        return super.itemFromDocument(labelObject);
    }
}

describe('PimLabel tests', () => {

    // This is a typical folder entry we get back from the /labels/all Keep API
    // {
    //     "FolderId": "A6637EBFCD4FCC2E002586880047ACDB",
    //     "ParentId": "21D822802DA4AA14852567D6005BD9EB",
    //     "View": "(NotesContacts)\\Friends",
    //     "isFolder": "true",
    //     "DocumentCount": 0,
    //     "UnreadCount": 0,
    //     "Type": "Contacts",
    //     "DisplayName": "Friends"
    // }

    describe('Test getters and setters', () => {
        it('Test folderId getter/setter', () => {
            let pimObject: any = {
                "FolderId": "folder-id"
            }

            let pimLabel = new PimLabelClassic(pimObject);

            expect(pimLabel.folderId).to.be.equal("folder-id");
            pimLabel.folderId = "updated-folder-id";
            expect(pimLabel.folderId).to.be.equal("updated-folder-id");

            pimObject = {};
            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.folderId).to.be.undefined();

        });

        it('Test displayName getter/setter', () => {
            let pimObject: any = {
                "DisplayName": "name"
            }

            let pimLabel = new PimLabelClassic(pimObject);

            expect(pimLabel.displayName).to.be.equal("name");
            pimLabel.displayName = "updated-name";
            expect(pimLabel.displayName).to.be.equal("updated-name");

            pimObject = {};
            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.displayName).to.be.undefined();

        });


        it('Test view getter/setter', () => {
            let pimObject: any = {
                "View": "test-view"
            }

            let pimLabel = new PimLabelClassic(pimObject);

            expect(pimLabel.view).to.be.equal("test-view");
            pimLabel.view = "updated-view";
            expect(pimLabel.view).to.be.equal("updated-view");

            pimObject = {};
            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.view).to.be.undefined();

        });

        it('Test documentCount getter/setter', () => {
            let pimObject: any = {
                "DocumentCount": 5
            }

            let pimLabel = new PimLabelClassic(pimObject);

            expect(pimLabel.documentCount).to.be.equal(5);
            pimLabel.documentCount = 3;
            expect(pimLabel.documentCount).to.be.equal(3);

            pimObject = {};
            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.documentCount).to.be.equal(0);

        });

        it('Test unreadCount getter/setter', () => {
            let pimObject: any = {
                "UnreadCount": 5
            }

            let pimLabel = new PimLabelClassic(pimObject);

            expect(pimLabel.unreadCount).to.be.equal(5);
            pimLabel.unreadCount = 3;
            expect(pimLabel.unreadCount).to.be.equal(3);

            pimObject = {};
            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.unreadCount).to.be.equal(0);

        });

        it('Test type getter/setter', () => {
            let pimObject: any = {
                "Type": PimLabelTypes.CALENDAR
            }

            let pimLabel = new PimLabelClassic(pimObject);

            expect(pimLabel.type).to.be.equal(PimLabelTypes.CALENDAR);
            pimLabel.type = PimLabelTypes.JOURNAL;
            expect(pimLabel.type).to.be.equal(PimLabelTypes.JOURNAL);

            // If no type, we default to MAIL
            pimObject = {};
            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.type).to.be.equal(PimLabelTypes.MAIL);

            // For an invalid type, we log a warning and default to MAIL
            pimObject = {
                'Type': 'Invalid'
            };

            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.type).to.be.equal(PimLabelTypes.MAIL);
        });

        it('Test parentFolderId getter/setter', function () {
            const pimObject: any = {
                "FolderId": "folder-id"
            }

            let pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.parentFolderId).to.be.undefined();

            pimLabel.parentFolderId = "ParentId" 
            expect(pimLabel.parentFolderId).to.be.equal("ParentId");

            pimLabel.parentFolderId = undefined;
            expect(pimLabel.parentFolderId).to.be.undefined();

            pimObject["ParentFolder"] = "ParentFolder";
            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.parentFolderId).to.be.undefined();  // PimLabel overrides PimItem looking only for ParentId

            delete pimObject["ParentFolder"];
            pimObject["$FolderRef"] = "FolderRef";
            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.parentFolderId).to.be.undefined(); // PimLabel overrides PimItem looking only for ParentId

            pimObject["$FolderRef"] = ["FolderRef"];
            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.parentFolderIds).to.be.undefined(); // PimLabel overrides PimItem looking only for ParentId
            expect(pimLabel.parentFolderId).to.be.undefined(); // PimLabel overrides PimItem looking only for ParentId

            const parents = ["parent1","parent2"];
            pimObject["$FolderRef"] = parents;
            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.parentFolderIds).to.be.undefined(); // PimLabel overrides PimItem looking only for ParentId
            expect(pimLabel.parentFolderId).to.be.undefined(); // PimLabel overrides PimItem looking only for ParentId

            pimObject["$FolderRef"] = [];
            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.parentFolderIds).to.be.undefined(); // PimLabel overrides PimItem looking only for ParentId
            expect(pimLabel.parentFolderId).to.be.undefined(); // PimLabel overrides PimItem looking only for ParentId

            delete pimObject["$FolderRef"];
            pimObject["referenceFolder"] = "RefFolder";
            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.parentFolderId).to.be.undefined(); // PimLabel overrides PimItem looking only for ParentId

            pimObject["referenceFolder"] = ["RefFolder"];
            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.parentFolderIds).to.be.undefined(); // PimLabel overrides PimItem looking only for ParentId
            expect(pimLabel.parentFolderId).to.be.undefined(); // PimLabel overrides PimItem looking only for ParentId

            pimObject["referenceFolder"] = parents;
            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.parentFolderIds).to.be.undefined(); // PimLabel overrides PimItem looking only for ParentId
            expect(pimLabel.parentFolderId).to.be.undefined(); // PimLabel overrides PimItem looking only for ParentId

            pimObject["referenceFolder"] = [];
            pimLabel = new PimLabelClassic(pimObject);
            expect(pimLabel.parentFolderIds).to.be.undefined(); // PimLabel overrides PimItem looking only for ParentId
            expect(pimLabel.parentFolderId).to.be.undefined(); // PimLabel overrides PimItem looking only for ParentId
        });

        it('Test calendarName', function () {
            const calendarObject = {
                "FolderId": "738CB93AE2E1B7F8852564B5001283E2",
                "View": "($Calendar)",
                "isFolder": "false",
                "Alias": [
                    "Calendar"
                ],
                "DocumentCount": 1,
                "Type": "Calendar",
                "DisplayName": "Calendar"
            };

            const calendarObject2 = {
                "FolderId": "738CB93AE2E1B7F8852564B5001283E2",
                "View": "(NotesCalendar)\\Team",
                "isFolder": "false",
                "DocumentCount": 1,
                "DisplayName": "Team"
            };

            const contactsObject = {
                "FolderId": "21D822802DA4AA14852567D6005BD9EB",
                "View": "($Contacts)",
                "isFolder": "false",
                "Alias": [
                    "People"
                ],
                "DocumentCount": 0,
                "Type": "Contacts",
                "DisplayName": "Contacts"
            };

            let label = PimItemFactory.newPimLabel(contactsObject);
            expect(label.calendarName).to.be.undefined(); 

            label = PimItemFactory.newPimLabel(calendarObject);
            expect(label.calendarName).to.be.equal(KeepPimConstants.DEFAULT_CALENDAR_NAME);

            label = PimItemFactory.newPimLabel(calendarObject2);
            expect(label.calendarName).to.be.equal("Team");
            
        });

    });

    describe('test toPimStructure', () => {
        it('Test with missing fields', () => {
            const pimLabel: PimLabelClassic = new PimLabelClassic({});
            const pimStructure: any = pimLabel.toPimStructure();

            expect(pimStructure['DisplayName']).to.be.undefined();
            expect(pimStructure['ParentId']).to.be.undefined();
        });

        it('Test with properties set', () => {
            const pimLabel: PimLabelClassic = new PimLabelClassic({});
            pimLabel.displayName = 'Label Name';
            pimLabel.parentFolderId = 'parent';

            const pimStructure: any = pimLabel.toPimStructure();

            expect(pimStructure['DisplayName']).to.be.equal('Label Name');
            expect(pimStructure['ParentId']).to.be.equal('parent');
        });
    });

    describe('test typeFromView', () => {
        it('Test typeFromView', () => {
            const mockLabel = new MockPimLabel({});
            expect(mockLabel.typeFromView(KeepPimConstants.CALENDAR)).to.be.equal(PimLabelTypes.CALENDAR);
            expect(mockLabel.typeFromView(KeepPimConstants.CONTACTS)).to.be.equal(PimLabelTypes.CONTACTS);
            expect(mockLabel.typeFromView(KeepPimConstants.TASKS)).to.be.equal(PimLabelTypes.TASKS);
            expect(mockLabel.typeFromView(KeepPimConstants.JOURNAL)).to.be.equal(PimLabelTypes.JOURNAL);
            expect(mockLabel.typeFromView(KeepPimConstants.INBOX)).to.be.equal(PimLabelTypes.MAIL);
            expect(mockLabel.typeFromView(KeepPimConstants.SENT)).to.be.equal(PimLabelTypes.MAIL);
            expect(mockLabel.typeFromView('Anything')).to.be.equal(PimLabelTypes.MAIL);

            // Secondary labels
            expect(mockLabel.typeFromView('(NotesCalendar)\\Team')).to.be.equal(PimLabelTypes.CALENDAR); // TODO: Verify this when LABS-530 is complete
            expect(mockLabel.typeFromView('(NotesContacts)\\My Contacts')).to.be.equal(PimLabelTypes.CONTACTS);
            expect(mockLabel.typeFromView('(NotesTasks)\\My Tasks')).to.be.equal(PimLabelTypes.TASKS);
            expect(mockLabel.typeFromView('(NotesJournal)\\Thoughts')).to.be.equal(PimLabelTypes.JOURNAL);
        });
    });

    describe('test fromJson', () => {
        it('Test fromJson', () => {
            const jsonString = '{ "FolderId": "C82CD0A7E61B2866852564B5001283EB", "View": "($ToDo)", "isFolder": "false", "Alias": [ "Tasks" ], "DocumentCount": 0, "DisplayName": "Tasks" }';
            const pimLabel = PimLabelClassic.fromJson(jsonString);

            expect(pimLabel.displayName).to.be.equal("Tasks");
            expect(pimLabel.documentCount).to.be.equal(0);
            expect(pimLabel.view).to.be.equal('($ToDo)');
            expect(pimLabel.folderId).to.be.equal('C82CD0A7E61B2866852564B5001283EB');

        });
    });

    describe('test itemFromDocument', () => {
        it('Test full content', () => {
            let mockLabel = new MockPimLabel({});
            const pimObject: any = {
                "FolderId": "A6637EBFCD4FCC2E002586880047ACDB",
                "ParentId": "21D822802DA4AA14852567D6005BD9EB",
                "View": "(NotesContacts)\\Friends",
                "isFolder": "true",
                "DocumentCount": 4,
                "UnreadCount": 1,
                "Type": "Contacts",
                "DisplayName": "Friends"
            };

            let pimLabel = mockLabel.itemFromDocument(pimObject);
            expect(pimLabel.displayName).to.be.equal("Friends");
            expect(pimLabel.documentCount).to.be.equal(4);
            expect(pimLabel.unreadCount).to.be.equal(1);
            expect(pimLabel.view).to.be.equal('(NotesContacts)\\Friends');
            expect(pimLabel.folderId).to.be.equal('A6637EBFCD4FCC2E002586880047ACDB');
            expect(pimLabel.parentFolderId).to.be.equal('21D822802DA4AA14852567D6005BD9EB');
            expect(pimLabel.type).to.be.equal(PimLabelTypes.CONTACTS);

            // Try with bogus label type, but good View
            pimObject["View"] = KeepPimConstants.JOURNAL;
            pimObject['Type'] = 'bogus';
            pimLabel = mockLabel.itemFromDocument(pimObject);
            expect(pimLabel.type).to.be.equal(PimLabelTypes.JOURNAL);

            // Try with empty view and type
            delete pimObject['View'];
            delete pimObject['Type'];
            mockLabel = new MockPimLabel({});
            pimLabel = mockLabel.itemFromDocument(pimObject);
            expect(pimLabel.type).to.be.equal(PimLabelTypes.MAIL);

        });
    });
});