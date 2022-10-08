import { expect } from '@loopback/testlab';
import { PimItemJmap } from '../../../../internal';
import { PimItemFormat } from '../../../../keep/pim/KeepPimConstants';
import { PimItemFactory } from '../../../../keep/pim/PimItemFactory';
import { getTrimmedISODate } from '../../../../utils/common';

/**
 * Unit tests for the PimItemJmap class
 */

// Mock PimItemJmap subclass to expose protected functions
class MockPimItemJmap extends PimItemJmap {
    public getNextExtPropertyIndex(): number {
        return super.getNextExtPropertyIndex();
    }

    public setJmapProp(key: string, value: any): void {
        this.jmapObject[key] = value;
    }

    public removeJmapProp(key: string): void {
        delete this.jmapObject[key];
    }
}

describe("PimItemJmap tests", function () {


    // Commonly used objects
    let pimObjectWithExtendedProperties: any;
    beforeEach(() => {
        pimObjectWithExtendedProperties = {
            "uid": "unit-test-contact",
            "AdditionalFields": {
                'xHCL-extProp_0': {
                    DistinguishedPropertySetId: 'Address',
                    PropertyId: 32899,
                    PropertyType: 'String',
                    Value: 'fozzy.bear@fakemail.com'
                },
                'xHCL-extProp_1': {
                    DistinguishedPropertySetId: 'Address',
                    PropertyId: 32896,
                    PropertyType: 'Boolean',
                    Value: true
                }
            }
        }
    });

    describe("Test getters and setters", function () {

        it('PimItemJmap with uid', function () {
            const pimObject = {
                "uid": "unit-test-contact"
            };

            const pimItem = new MockPimItemJmap(pimObject);
            expect(pimItem.unid).to.be.equal("unit-test-contact");
            pimItem.unid = "updated-unid";
            expect(pimItem.unid).to.be.equal("updated-unid");
        });

        it('PimItemJmap with no unid', function () {
            const pimObject = {
            };

            const pimItem = new MockPimItemJmap(pimObject);
            expect(pimItem.unid).to.be.undefined();
            pimItem.unid = "bogusunid";
            expect(pimItem.unid).to.be.equal("bogusunid");
        });

        it('PimItemJmap with ApptUNID', function () {
            const pimObject = {
                "ApptUNID": "unid"
            };

            const pimItem = new MockPimItemJmap(pimObject);
            expect(pimItem.unid).to.be.undefined();
        });

        it('noteid', function () {
            const pimObject = {
                "uid": "unid",
                "AdditionalFields": {
                    "xHCL-com.domino.noteid": 1244
                }
            };

            let pimItem = new MockPimItemJmap(pimObject);
            expect(pimItem.noteId).to.be.equal(1244);

            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.noteId).to.be.equal(1244);

            pimItem = new MockPimItemJmap({});
            expect(pimItem.noteId).to.be.equal(0);
            pimItem.noteId = 5;
            expect(pimItem.noteId).to.be.equal(5);
        });

        it('createdDate', function () {
            const pimObject: any = {
                "uid": "unid"
            };

            let pimItem = new MockPimItemJmap(pimObject);
            expect(pimItem.createdDate).to.be.undefined();

            const created = new Date();
            pimItem.createdDate = created;
            expect(getTrimmedISODate(pimItem.createdDate)).to.be.equal(getTrimmedISODate(created));

            pimItem.createdDate = undefined;
            expect(pimItem.createdDate).to.be.undefined();

            pimObject["created"] = "2020-12-25T15:00:00";
            const createdDate = new Date("2020-12-25T15:00:00");
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.createdDate).to.not.be.undefined();
            expect(pimItem.createdDate ? getTrimmedISODate(pimItem.createdDate) : 'createdDate was not defined').to.be.eql(getTrimmedISODate(createdDate));

        });

        it('lastModifiedDate', function () {
            const pimObject: any = {
                "uid": "unid"
            };

            let pimItem = new MockPimItemJmap(pimObject);
            expect(pimItem.lastModifiedDate).to.be.undefined();

            const modified = new Date();
            pimItem.lastModifiedDate = modified;
            expect(getTrimmedISODate(pimItem.lastModifiedDate)).to.be.equal(getTrimmedISODate(modified));

            pimItem.lastModifiedDate = undefined;
            expect(pimItem.lastModifiedDate).to.be.undefined();

            pimObject["updated"] = "2020-12-25T15:00:00";
            const modifiedDate = new Date("2020-12-25T15:00:00");
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.lastModifiedDate ? getTrimmedISODate(pimItem.lastModifiedDate) : 'error: pimItem.lastModifiedDate is undefined').to.be.eql(getTrimmedISODate(modifiedDate));
        });

        it('isConfidential', function () {
            const pimObject: any  = {
                "uid": "unid"
            };

            let mockItem = new MockPimItemJmap(pimObject);
            expect(mockItem.isConfidential).to.be.false();

            // confidential cannot be updated except when initializing some subclasses
            pimObject.privacy = "private";
            mockItem = new MockPimItemJmap(pimObject);
            expect(mockItem.isConfidential).to.be.true();

            pimObject.privacy = "public";
            mockItem = new MockPimItemJmap(pimObject);
            expect(mockItem.isConfidential).to.be.false();

            // Test setter
            mockItem.isConfidential = true;
            expect(mockItem.isConfidential).to.be.true();
            mockItem.isConfidential = false;
            expect(mockItem.isConfidential).to.be.false();

        });

        it('view', function () {
            const pimObject: any = {
                "uid": "unid"
            };

            let pimItem = new MockPimItemJmap(pimObject);
            expect(pimItem.view).to.be.equal('');

            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT, "ViewName");
            expect(pimItem.view).to.be.equal("ViewName");

            pimObject["AdditionalFields"] = {
                "xHCL-com.domino.view": "Another ViewName"
            };
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.view).to.be.equal("Another ViewName");
        });

        it('parentFolderIds', function () {
            const pimObject: any = {
                "uid": "unid"
            };

            let pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.undefined();

            pimItem.parentFolderIds = ["ParentId"];
            expect(pimItem.parentFolderIds).to.be.deepEqual(["ParentId"]);

            pimItem.parentFolderIds = undefined;
            expect(pimItem.parentFolderIds).to.be.undefined();

            pimObject["ParentFolder"] = "ParentFolder";
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.undefined();

            delete pimObject["ParentFolder"];
            pimObject["$FolderRef"] = "FolderRef";
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.undefined();

            pimObject["$FolderRef"] = "FolderRef";
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.undefined();

            const parents = ["parent1", "parent2"];
            pimObject["$FolderRef"] = parents;
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.undefined();

            pimObject["$FolderRef"] = [];
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.undefined();

            pimObject["$FolderRef"] = 5;
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.undefined();

            delete pimObject["$FolderRef"];
            pimObject["referenceFolder"] = "RefFolder";
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.deepEqual(["RefFolder"]);

            pimObject["referenceFolder"] = "RefFolder";
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.deepEqual(["RefFolder"]);

            pimObject["referenceFolder"] = parents;
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.deepEqual(parents);

            pimObject["referenceFolder"] = [];
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.deepEqual([]);

            pimObject["referenceFolder"] = 5;
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.undefined();

        });

        it('body', function () {
            const pimObject: any = {
                "uid": "unid"
            };

            const pimItem = new MockPimItemJmap(pimObject);
            expect(pimItem.body).to.be.equal("");

            pimItem.body = "Body of item"
            expect(pimItem.body).to.be.equal("Body of item");

            pimItem.body = "";
            expect(pimItem.body).to.be.equal("");
        });

        it('bodyType', function () {
            const pimObject: any = {
                "uid": "unid"
            };

            const pimItem = new MockPimItemJmap(pimObject);
            expect(pimItem.bodyType).to.be.undefined();

            pimItem.bodyType = "text"
            expect(pimItem.bodyType).to.be.equal("text");

            pimItem.bodyType = undefined;
            expect(pimItem.bodyType).to.be.undefined();
        });

        it('subject', function () {
            let pimObject: any = {
            };

            let pimItem = new MockPimItemJmap(pimObject);
            expect(pimItem.subject).to.be.equal("");

            pimItem.subject = "A subject"
            expect(pimItem.subject).to.be.equal("A subject");

            pimItem.subject = "";
            expect(pimItem.subject).to.be.equal("");

            const titleVal = "subject as title";
            pimObject = {
                title: titleVal
            };

            pimItem = new MockPimItemJmap(pimObject);
            expect(pimItem.subject).to.be.equal(titleVal);
        });

        it('isRead', function () {
            const pimObject: any = {
            };

            let mockItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(mockItem.isRead).to.be.false();

            mockItem.isRead = true;
            expect(mockItem.isRead).to.be.true();

            mockItem.isRead = false;
            expect(mockItem.isRead).to.be.false();

            pimObject["unread"] = false;
            mockItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(mockItem.isRead).to.be.true();

            pimObject["unread"] = 0;
            mockItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(mockItem.isRead).to.be.true();

            pimObject["unread"] = true;
            mockItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(mockItem.isRead).to.be.false();
        });

        it('isPrivate', function () {
            const pimObject: any = {
                "uid": "unid"
            };

            let pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.isPrivate).to.be.false();

            pimItem.isPrivate = true;
            expect(pimItem.isPrivate).to.be.true();

            pimItem.isPrivate = false;
            expect(pimItem.isPrivate).to.be.false();

            pimObject["$PublicAccess"] = "1";
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.isPrivate).to.be.false();

            pimObject["$PublicAccess"] = "0";
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.isPrivate).to.be.false();

            delete pimObject["$PublicAccess"];

            pimObject["Public"] = "0";
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.isPrivate).to.be.false();

            delete pimObject["Public"];

            pimObject["privacy"] = "public";
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.isPrivate).to.be.false();

            pimObject["privacy"] = "private";
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.isPrivate).to.be.true();

            // This does not initialize the private property
            delete pimObject["privacy"];
            pimItem = new MockPimItemJmap(pimObject);
            expect(pimItem.isPrivate).to.be.false();
        });

        it('categories', function () {
            const pimObject: any = {
                "uid": "unid"
            };

            let pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.categories).to.be.an.Array();
            expect(pimItem.categories.length).to.be.equal(0);

            pimObject["categories"] = "Not Categorized";
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.categories).to.be.an.Array();
            expect(pimItem.categories.length).to.be.equal(0);

            pimObject["categories"] = ["red", "green", "blue"];
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.categories).to.be.an.Array();
            expect(pimItem.categories.length).to.be.equal(0);

            pimObject["categories"] = [{"red": true}, {"green": true}, {"blue": true}];
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.categories).to.be.an.Array();
            let cats = pimItem.categories;
            expect(cats.length).to.be.equal(0);

            pimObject["categories"] = {"red": true, "green": true, "blue": true};
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            cats = pimItem.categories;
            expect(cats).to.be.an.Array();
            expect(cats.length).to.be.equal(3);
            expect(cats.indexOf("red")).to.be.above(-1);
            expect(cats.indexOf("green")).to.be.above(-1);
            expect(cats.indexOf("blue")).to.be.above(-1);


            pimItem.categories = [];
            expect(pimItem.categories).to.be.an.Array();
            expect(pimItem.categories.length).to.be.equal(0);

            pimItem.categories = ["orange", "blue"];
            cats = pimItem.categories;
            expect(cats.length).to.be.equal(2);
            expect(cats.indexOf("orange")).to.be.above(-1);
            expect(cats.indexOf("blue")).to.be.above(-1);

            // This causes props.categories to not be initialized
            delete pimObject["categories"];
            pimItem = new MockPimItemJmap(pimObject);
            expect(pimItem.categories).to.be.an.Array();
            expect(pimItem.categories.length).to.be.equal(0);

        });

        it('attachments', function () {
            const pimObject: any = {
                "uid": "unid"
            };

            let pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.attachments).to.be.an.Array();
            expect(pimItem.attachments.length).to.be.equal(0);

            pimObject["$FILES"] = ["file1", "file2", "file3"];
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.attachments).to.be.an.Array();
            let atts = pimItem.attachments;
            expect(atts.length).to.be.equal(0);

            pimObject["attachments"] = [{name: "file1"}, {name: "file2"}, {name: "file3"}];
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.attachments).to.be.an.Array();
            atts = pimItem.attachments;
            expect(atts.length).to.be.equal(3);
            expect(atts.indexOf("file1")).to.be.above(-1);
            expect(atts.indexOf("file2")).to.be.above(-1);
            expect(atts.indexOf("file3")).to.be.above(-1);


            pimItem.attachments = [];
            expect(pimItem.attachments).to.be.an.Array();
            expect(pimItem.attachments.length).to.be.equal(0);

            pimItem.attachments = ["abc", "def"];
            atts = pimItem.attachments;
            expect(atts.length).to.be.equal(2);
            expect(atts.indexOf("abc")).to.be.above(-1);
            expect(atts.indexOf("def")).to.be.above(-1);

            delete pimObject["attachments"];
            pimObject["$FILES"] = "this is not an array!";
            pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.attachments).to.be.an.Array();
            expect(pimItem.attachments.length).to.be.equal(0);
        });

        it('extendedProperties empty and setter', function () {
            const pimObject = {
                "uid": "unit-test-contact"
            }

            // Test empty AdditionalFields
            const pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            let extFields = pimItem.extendedProperties;
            expect(extFields).to.be.an.Array();
            expect(extFields.length).to.be.equal(0);

            // Test set then get
            pimItem.extendedProperties = [{ "some_key": "value1", "Value": "Test value" },
            { "some_key": "value2", "Values": ["a", "b", "c"] }];
            pimItem.setAdditionalProperty('foo', 'bar');

            extFields = pimItem.extendedProperties;

            expect(extFields).to.be.an.Array();
            expect(extFields.length).to.be.equal(2);
            let found0 = false;
            let found1 = false;
            extFields.forEach(field => {
                if (field["some_key"] === "value1") {
                    found0 = true;
                    expect(field["Value"]).to.be.equal("Test value");
                }
                if (field["some_key"] === "value2") {
                    found1 = true;
                    const vals = field["Values"];
                    expect(vals).to.be.an.Array();
                    expect(vals[0]).to.be.equal("a");
                    expect(vals[1]).to.be.equal("b");
                    expect(vals[2]).to.be.equal("c");
                }
            });
            expect(found0).to.be.true();
            expect(found1).to.be.true();

        });

        it('extended properties', function () {

            const pimItem = new MockPimItemJmap(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            const extFields = pimItem.extendedProperties;
            expect(extFields).to.be.an.Array();
            expect(extFields.length).to.be.equal(2);
            let found0 = false;
            let found1 = false;
            extFields.forEach(field => {
                // Item_0
                if (field["PropertyId"] === 32899) {
                    found0 = true;
                    expect(field["Value"]).to.be.equal("fozzy.bear@fakemail.com");
                    expect(field["PropertyType"]).to.be.equal("String");
                    expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");
                }
                // Item_1
                if (field["PropertyId"] === 32896) {
                    found1 = true;
                    expect(field["Value"]).to.be.true();
                    expect(field["PropertyType"]).to.be.equal("Boolean");
                    expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");
                }
            });
            expect(found0).to.be.true();
            expect(found1).to.be.true();
        });
    });

    describe("PimItemJmap.getNextExtPropertyIndex", function () {

        it('With existing extended properties', function () {
            const mockItem = new MockPimItemJmap(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            expect(mockItem.getNextExtPropertyIndex()).to.be.equal(2);
        });

        it('No existing extended properties', function () {
            const pimObject = {
                "uid": "unit-test-contact"
            };
            const mockItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(mockItem.getNextExtPropertyIndex()).to.be.equal(0);
        });

        it('Extended properties with empty property', function () {
            const pimObject = {
                "uid": "unit-test-contact",
                "AdditionalFields": {
                    "xHCL-extProp_0": {
                        "some_key": "value1",
                        "Value": "Test value"
                    },
                    "xHCL-additional": { "key": "val" },
                    "bogusKey": "bogusVal",
                    "xHCL-extProp_1": "",
                    "xHCL-extProp_2": {
                        "some_key": "value2",
                        "Values": [
                            "a", "b", "c"
                        ]
                    }
                }
            };
            const mockItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(mockItem.getNextExtPropertyIndex()).to.be.equal(1);

            mockItem.setJmapProp("AdditionalFields", {
                "xHCL-extProp_10": {
                    "some_key": "value1",
                    "Value": "Test value"
                },
                "xHCL-extProp99": { "a": "b" },
                "xHCL-extProp_2": {
                    "some_key": "value2",
                    "Values": [
                        "a", "b", "c"
                    ]
                },
                "xHCL-additional": { "key": "val" },
                "bogusKey": "bogusVal"
            });
            expect(mockItem.getNextExtPropertyIndex()).to.be.equal(11);
        });


        it('Extended properties with skipped index and invalid index format', function () {
            const pimObject = {
                "uid": "unit-test-contact",
                "AdditionalFields": {
                    "xHCL-extProp_0": {
                        "some_key": "value1",
                        "Value": "Test value"
                    },
                    "xHCL-extProp_5": {
                        "some_key": "value2",
                        "Values": [
                            "a", "b", "c"
                        ]
                    },
                    "xHCL-extProp_abc": "abc",
                    "test": "bogus value"
                }
            };
            const mockItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            expect(mockItem.getNextExtPropertyIndex()).to.be.equal(6);
        });
    });

    describe("PimItemJmap.deleteExtendedProperty", function () {
        it('Delete first property', function () {
            const pimItem = new MockPimItemJmap(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            pimItem.deleteExtendedProperty({ "PropertyId": 32899 });
            const extFields = pimItem.extendedProperties;
            expect(extFields).to.be.an.Array();
            expect(extFields.length).to.be.equal(1);
            const field = extFields[0];
            expect(field["PropertyId"]).to.be.equal(32896);
            expect(field["Value"]).to.be.true();
            expect(field["PropertyType"]).to.be.equal("Boolean");
            expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");
        });

        it('Delete last property', function () {
            const pimItem = new MockPimItemJmap(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            pimItem.deleteExtendedProperty({ "PropertyId": 32896 });
            const extFields = pimItem.extendedProperties;
            expect(extFields).to.be.an.Array();
            expect(extFields.length).to.be.equal(1);
            const field = extFields[0];
            expect(field["PropertyId"]).to.be.equal(32899);
            expect(field["Value"]).to.be.equal("fozzy.bear@fakemail.com");
            expect(field["PropertyType"]).to.be.equal("String");
            expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");
        });

        it('Delete non-existant property', function () {
            const pimItem = new MockPimItemJmap(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            pimItem.deleteExtendedProperty([{ "PropertyId": 32896, "PropertyType": "Number" }]);
            const extFields = pimItem.extendedProperties;
            expect(extFields).to.be.an.Array();
            expect(extFields.length).to.be.equal(2);
        });
    });

    describe("PimItemJmap.findExtendedProperty", function () {

        it('Find first property', function () {
            const pimItem = new MockPimItemJmap(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            const field = pimItem.findExtendedProperty({ "PropertyId": 32899 });
            expect(field["PropertyId"]).to.be.equal(32899);
            expect(field["Value"]).to.be.equal("fozzy.bear@fakemail.com");
            expect(field["PropertyType"]).to.be.equal("String");
            expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");
        });

        it('Find last property', function () {
            const pimItem = new MockPimItemJmap(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            const field = pimItem.findExtendedProperty({ "PropertyId": 32896 });
            expect(field["PropertyId"]).to.be.equal(32896);
            expect(field["Value"]).to.be.true();
            expect(field["PropertyType"]).to.be.equal("Boolean");
            expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");
        });

        it('Find with no hits', function () {
            const pimItem = new MockPimItemJmap(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            const field = pimItem.findExtendedProperty({ "PropertyId": "text", "PropertyType": "String" });
            expect(field).to.be.undefined();
        });

        it('Find with bogus criteria', function () {
            const pimItem = new MockPimItemJmap(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            const field = pimItem.findExtendedProperty(["bogus"]);
            expect(field).to.be.undefined();
        });

        it('Find with non-object property', function () {
            const pimObject = {
                "uid": "unit-test-contact",
                "AdditionalFields": {
                    "xHCL-extProp_0": "abc",
                    "xHCL-extProp_1": {
                        "some_key": "value2",
                        "Values": [
                            "a", "b", "c"
                        ]
                    }
                }
            };
            const pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            let field = pimItem.findExtendedProperty({ "some_key": "value2" });
            expect(field).to.not.be.undefined();
            field = pimItem.findExtendedProperty({ "some_key": "not found" });
            expect(field).to.be.undefined();
        });
    });

    describe("PimItemJmap.updateExtendedProperty", function () {

        const newValue = {
            DistinguishedPropertySetId: 'Address',
            PropertyId: 32899,
            PropertyType: 'String',
            Value: 'kermit.frog@fakemail.com'
        }

        it('Update first property', function () {
            const pimItem = new MockPimItemJmap(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            pimItem.updateExtendedProperty({ "PropertyId": 32899 }, newValue);
            const field = pimItem.findExtendedProperty({ "PropertyId": 32899 });
            expect(field["PropertyId"]).to.be.equal(32899);
            expect(field["Value"]).to.be.equal("kermit.frog@fakemail.com");
            expect(field["PropertyType"]).to.be.equal("String");
            expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");
        });

        it('Update missing property', function () {
            const pimItem = new MockPimItemJmap(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            newValue["PropertyId"] = 12345;
            pimItem.updateExtendedProperty({ "PropertyId": 12345 }, newValue);
            const field = pimItem.findExtendedProperty({ "PropertyId": 12345 });
            expect(field["PropertyId"]).to.be.equal(12345);
            expect(field["Value"]).to.be.equal("kermit.frog@fakemail.com");
            expect(field["PropertyType"]).to.be.equal("String");
            expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");
        });

        it('Update with no existing properties', function () {
            const pimItem = new MockPimItemJmap({ "unid": "test" }, PimItemFormat.DOCUMENT);
            newValue["PropertyId"] = 12345;
            pimItem.updateExtendedProperty({ "PropertyId": 12345 }, newValue);
            const field = pimItem.findExtendedProperty({ "PropertyId": 12345 });
            expect(field["PropertyId"]).to.be.equal(12345);
            expect(field["Value"]).to.be.equal("kermit.frog@fakemail.com");
            expect(field["PropertyType"]).to.be.equal("String");
            expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");
        });

    });

    describe("PimItemJmap.addExtendedProperty", function () {

        const newValue = {
            DistinguishedPropertySetId: 'Address',
            PropertyId: 32899,
            PropertyType: 'String',
            Value: 'kermit.frog@fakemail.com'
        }

        it('Add first property', function () {
            const pimObject = {
                "uid": "unit-test-contact"
            };
            const pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            pimItem.addExtendedProperty(newValue);

            expect(pimItem.extendedProperties).to.be.an.Array();
            expect(pimItem.extendedProperties.length).to.be.equal(1);

            const field = pimItem.findExtendedProperty({ "PropertyId": 32899 });
            expect(field["PropertyId"]).to.be.equal(32899);
            expect(field["Value"]).to.be.equal("kermit.frog@fakemail.com");
            expect(field["PropertyType"]).to.be.equal("String");
            expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");
        });

        it('Update missing property', function () {
            const pimItem = new MockPimItemJmap(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            newValue["PropertyId"] = 12345;
            pimItem.addExtendedProperty(newValue);

            expect(pimItem.extendedProperties.length).to.be.equal(3);

            const field = pimItem.findExtendedProperty({ "PropertyId": 12345 });
            expect(field["PropertyId"]).to.be.equal(12345);
            expect(field["Value"]).to.be.equal("kermit.frog@fakemail.com");
            expect(field["PropertyType"]).to.be.equal("String");
            expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");

            // try adding the same value again...should be ok, but we will have a duplicate
            pimItem.addExtendedProperty(newValue);
            expect(pimItem.extendedProperties.length).to.be.equal(4);
        });
    });


    describe("PimItemJmap.getAdditionalProperty", function () {

        it('Add first property', function () {
            const pimObject: any = {
                "uid": "unit-test-contact"
            };
            const pimItem = new MockPimItemJmap(pimObject);
            let prop = pimItem.getAdditionalProperty("bogus");
            expect(prop).to.be.undefined();
            prop = pimItem.getAdditionalProperty("xHCL-bogus");
            expect(prop).to.be.undefined();

            pimItem.setJmapProp("AdditionalFields", { "xHCL-key1": "value" });
            prop = pimItem.getAdditionalProperty("xHCL-key1");
            expect(prop).to.be.equal("value");

            prop = pimItem.getAdditionalProperty("key1");
            expect(prop).to.be.equal("value");
        });
    });

    describe("PimItemJmap.setAdditionalProperty", function () {

        it('Add first property', function () {
            const pimObject: any = {
                "uid": "unit-test-contact"
            };
            const pimItem = new MockPimItemJmap(pimObject);
            pimItem.setAdditionalProperty("MyKey", "MyValue");
            let prop = pimItem.getAdditionalProperty("MyKey");
            expect(prop).to.be.equal("MyValue");

            prop = pimItem.getAdditionalProperty("xHCL-MyKey");
            expect(prop).to.be.equal("MyValue");

            pimItem.setAdditionalProperty("xHCL-Key2", "value2");
            prop = pimItem.getAdditionalProperty("xHCL-Key2");
            expect(prop).to.be.equal("value2");

            pimItem.setAdditionalProperty("MyKey", "MyUpdatedValue");
            prop = pimItem.getAdditionalProperty("MyKey");
            expect(prop).to.be.equal("MyUpdatedValue");

        });
    });

    describe("PimItemJmap.deleteAdditionalProperty", function () {

        it('Delete first property', function () {
            const pimObject: any = {
                "uid": "unit-test-contact",
                "AdditionalFields": {
                    "xHCL-Key": "value"
                }
            };
            const pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            let prop = pimItem.getAdditionalProperty("Key");
            expect(prop).to.be.equal("value");
            pimItem.deleteAdditionalProperty("Key")
            prop = pimItem.getAdditionalProperty("Key");
            expect(prop).to.be.equal(null);

            pimItem.setAdditionalProperty("Key22", "val22");
            prop = pimItem.getAdditionalProperty("Key22");
            expect(prop).to.not.be.undefined();
            pimItem.deleteAdditionalProperty("xHCL-Key22");
            prop = pimItem.getAdditionalProperty("Key22");
            expect(prop).to.be.equal(null);

            pimItem.removeJmapProp("AdditionalFields");
            pimItem.deleteAdditionalProperty("Key123");
            prop = pimItem.getAdditionalProperty("Key123");
            expect(prop).to.be.equal(undefined);

        });
    });

    describe("PimItemJmap.removeAdditionalProperty", function () {

        it('Add first property', function () {
            const pimObject: any = {
                "uid": "unit-test-contact",
                "AdditionalFields": {
                    "xHCL-Key": "value"
                }
            };
            const pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            let prop = pimItem.getAdditionalProperty("Key");
            expect(prop).to.be.equal("value");
            pimItem.removeAdditionalProperty("Key")
            prop = pimItem.getAdditionalProperty("Key");
            expect(prop).to.be.equal(undefined);

            pimItem.setAdditionalProperty("Key22", "val22");
            prop = pimItem.getAdditionalProperty("Key22");
            expect(prop).to.not.be.undefined();
            pimItem.removeAdditionalProperty("xHCL-Key22");
            prop = pimItem.getAdditionalProperty("Key22");
            expect(prop).to.be.equal(undefined);

            pimItem.removeJmapProp("AdditionalFields");
            pimItem.removeAdditionalProperty("Key123");
            prop = pimItem.getAdditionalProperty("Key123");
            expect(prop).to.be.equal(undefined);

        });
    });

    describe("PimItemJmap.toPimStructure", function () {

        it('Add first property', function () {
            const pimObject: any = {
                "uid": "unit-test-contact"
            };

            const pimItem = new MockPimItemJmap(pimObject, PimItemFormat.DOCUMENT);
            let pimStructure = pimItem.toPimStructure();
            expect(pimStructure).to.be.eql(pimObject);

            pimItem.categories = ["one"];
            pimStructure = pimItem.toPimStructure();
            expect(pimStructure).to.be.eql({ "uid": "unit-test-contact", "categories": {"one": true }});

            pimItem.categories = ["one", "two"];
            pimStructure = pimItem.toPimStructure();
            expect(pimStructure).to.be.eql({ "uid": "unit-test-contact", "categories": {"one": true, "two": true }});

            pimItem.removeJmapProp("categories");
            pimItem.setJmapProp("AdditionalFields", {
                'xHCL-extProp_0': {
                    DistinguishedPropertySetId: 'Address',
                    PropertyId: 32899,
                    PropertyType: 'String',
                    Value: 'fozzy.bear@fakemail.com'
                },
                'xHCL-extProp_1': {
                    DistinguishedPropertySetId: 'Address',
                    PropertyId: 32896,
                    PropertyType: 'Boolean',
                    Value: true
                }
            });
            pimStructure = pimItem.toPimStructure();
            expect(pimStructure).to.deepEqual({
                "uid": "unit-test-contact",
                "AdditionalFields": {
                    'xHCL-extProp_0': {
                        DistinguishedPropertySetId: 'Address',
                        PropertyId: 32899,
                        PropertyType: 'String',
                        Value: 'fozzy.bear@fakemail.com'
                    },
                    'xHCL-extProp_1': {
                        DistinguishedPropertySetId: 'Address',
                        PropertyId: 32896,
                        PropertyType: 'Boolean',
                        Value: true
                    }
                }
            });

            pimItem.setJmapProp("AdditionalFields", {
                'xHCL-extProp_0': {
                    DistinguishedPropertySetId: 'Address',
                    PropertyId: 32899,
                    PropertyType: 'String',
                    Value: 'fozzy.bear@fakemail.com'
                },
                'xHCL-additional': {
                    DistinguishedPropertySetId: 'Address',
                    PropertyId: 32896,
                    PropertyType: 'Boolean',
                    Value: true
                },
                'bogus': { "key": "value" }
            });
            pimStructure = pimItem.toPimStructure();
            expect(pimStructure).to.deepEqual({
                "uid": "unit-test-contact",
                "AdditionalFields": {
                    'xHCL-extProp_0': {
                        DistinguishedPropertySetId: 'Address',
                        PropertyId: 32899,
                        PropertyType: 'String',
                        Value: 'fozzy.bear@fakemail.com'
                    },
                    'xHCL-additional': {
                        DistinguishedPropertySetId: 'Address',
                        PropertyId: 32896,
                        PropertyType: 'Boolean',
                        Value: true
                    },
                    'bogus': { "key": "value" }
                }
            });

        });
    });

    describe('Test item type checkers', () => {

        it('isPimTask', () => {
            const pimItem = PimItemFactory.newPimTask();
            expect(pimItem.isPimTask()).to.be.true();
            expect(pimItem.isPimNote()).to.be.false();
        });

        it('isPimNote', () => {
            const pimItem = PimItemFactory.newPimNote({});
            expect(pimItem.isPimNote()).to.be.true();
            expect(pimItem.isPimMessage()).to.be.false();
        });

        it('isPimMessage', () => {
            const pimItem = PimItemFactory.newPimMessage({});
            expect(pimItem.isPimMessage()).to.be.true();
            expect(pimItem.isPimContact()).to.be.false();
        });

        it('isPimCalendarItem', () => {
            const pimItem = PimItemFactory.newPimCalendarItem({}, 'default', PimItemFormat.DOCUMENT);
            expect(pimItem.isPimCalendarItem()).to.be.true();
            expect(pimItem.isPimNote()).to.be.false();
        });

        it('isPimContact', () => {
            const pimItem = PimItemFactory.newPimContact({});
            expect(pimItem.isPimContact()).to.be.true();
            expect(pimItem.isPimThread()).to.be.false();
        });

        it('isPimThread', () => {
            const pimItem = PimItemFactory.newPimThread({}, PimItemFormat.PRIMITIVE);
            expect(pimItem.isPimThread()).to.be.true();
            expect(pimItem.isPimNote()).to.be.false();
        });

    });

});


