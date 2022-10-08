import { expect } from '@loopback/testlab';
import { PimItemClassic, PimItemFactory, PimItemFormat } from '../../../keep';

/**
 * Unit tests for the PimItem class
 */

// Mock PimItem subclass to expose protected functions
class MockPimItem extends PimItemClassic {
    public getNextExtPropertyIndex(): number {
        return super.getNextExtPropertyIndex();
    }

    public setProp(key: string, value: any): void {
        this.props[key] = value;
    }

    public removeProp(key: string): void {
        delete this.props[key];
    }
}

describe("PimItem tests", function () {

    // Commonly used objects
    const pimObjectWithExtendedProperties = {
        "@unid": "unit-test-contact",
        "FirstName": "Unit",
        "LastName": "Test",
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

    describe("Test getters and setters", function () {

        it('PimItem with unid', function () {
            const pimObject = {
                "@unid": "unit-test-contact",
                "FirstName": "Unit",
                "LastName": "Test"
            };

            const pimItem = new PimItemClassic(pimObject);
            expect(pimItem.unid).to.be.equal("unit-test-contact");
            pimItem.unid = "updated-unid";
            expect(pimItem.unid).to.be.equal("updated-unid");
        });

        it('PimItem with no unid', function () {
            const pimObject = {
                "FirstName": "Unit",
                "LastName": "Test"
            };

            const pimItem = new PimItemClassic(pimObject);
            expect(pimItem.unid).to.be.undefined();
            pimItem.unid = "unid";
            expect(pimItem.unid).to.be.equal("unid");
        });

        it('PimItem with ApptUNID', function () {
            const pimObject = {
                "ApptUNID": "unid",
                "FirstName": "Unit",
                "LastName": "Test"
            };

            const pimItem = new PimItemClassic(pimObject);
            expect(pimItem.unid).to.be.equal("unid");
        });

        it('PimItem with uid', function () {
            const pimObject = {
                "uid": "unid",
                "FirstName": "Unit",
                "LastName": "Test"
            };

            const pimItem = new PimItemClassic(pimObject);
            expect(pimItem.unid).to.be.equal("unid");
        });

        it('noteid', function () {
            const pimObject = {
                "uid": "unid",
                "@noteid": 1244,
                "FirstName": "Unit",
                "LastName": "Test"
            };

            let pimItem = new PimItemClassic(pimObject);
            expect(pimItem.noteId).to.be.equal(1244);

            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.noteId).to.be.equal(1244);

            pimItem = new PimItemClassic({});
            expect(pimItem.noteId).to.be.equal(0);
            pimItem.noteId = 5;
            expect(pimItem.noteId).to.be.equal(5);
        });

        it('createdDate', function () {
            const pimObject: any = {
                "uid": "unid",
                "FirstName": "Unit",
                "LastName": "Test"
            };

            let pimItem = new PimItemClassic(pimObject);
            expect(pimItem.createdDate).to.be.undefined();

            const created = new Date();
            pimItem.createdDate = created;
            expect(pimItem.createdDate).to.be.equal(created);

            pimItem.createdDate = undefined;
            expect(pimItem.createdDate).to.be.undefined();

            pimObject["@created"] = "2020-12-25T15:00:00.000Z";
            const createdDate = new Date("2020-12-25T15:00:00.000Z");
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.createdDate).to.be.eql(createdDate);

        });

        it('lastModifiedDate', function () {
            const pimObject: any = {
                "uid": "unid",
                "FirstName": "Unit",
                "LastName": "Test"
            };

            let pimItem = new PimItemClassic(pimObject);
            expect(pimItem.lastModifiedDate).to.be.undefined();

            const modified = new Date();
            pimItem.lastModifiedDate = modified;
            expect(pimItem.lastModifiedDate).to.be.equal(modified);

            pimItem.lastModifiedDate = undefined;
            expect(pimItem.lastModifiedDate).to.be.undefined();

            pimObject["@lastmodified"] = "2020-12-25T15:00:00.000Z";
            const modifiedDate = new Date("2020-12-25T15:00:00.000Z");
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.lastModifiedDate).to.be.eql(modifiedDate);
        });

        it('isConfidential', function () {
            const pimObject = {
                "uid": "unid",
                "FirstName": "Unit",
                "LastName": "Test"
            };

            const mockItem = new MockPimItem(pimObject);
            expect(mockItem.isConfidential).to.be.false();

            // confidential cannot be updated except when initializing some subclasses
            mockItem.setProp("confidential", true);
            expect(mockItem.isConfidential).to.be.true();

            mockItem.setProp("confidential", false);
            expect(mockItem.isConfidential).to.be.false();

            // Test setter
            mockItem.isConfidential = true;
            expect(mockItem.isConfidential).to.be.true();
            mockItem.isConfidential = false;
            expect(mockItem.isConfidential).to.be.false();

        });

        it('view', function () {
            const pimObject: any = {
                "uid": "unid",
                "FirstName": "Unit",
                "LastName": "Test"
            };

            let pimItem = new PimItemClassic(pimObject);
            expect(pimItem.view).to.be.equal('');

            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT, "ViewName");
            expect(pimItem.view).to.be.equal("ViewName");

            pimObject["viewname"] = "Another ViewName";
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.view).to.be.equal("Another ViewName");
        });

        it('parentFolderIds', function () {
            const pimObject: any = {
                "uid": "unid",
                "FirstName": "Unit",
                "LastName": "Test"
            };

            let pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.undefined();

            pimItem.parentFolderIds = ["ParentId"];
            expect(pimItem.parentFolderIds).to.be.deepEqual(["ParentId"]);

            pimItem.parentFolderIds = undefined;
            expect(pimItem.parentFolderIds).to.be.undefined();

            pimObject["ParentFolder"] = "ParentFolder";
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.deepEqual(["ParentFolder"]);

            delete pimObject["ParentFolder"];
            pimObject["$FolderRef"] = "FolderRef";
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.deepEqual(["FolderRef"]);

            pimObject["$FolderRef"] = "FolderRef";
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.deepEqual(["FolderRef"]);

            const parents = ["parent1", "parent2"];
            pimObject["$FolderRef"] = parents;
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.deepEqual(parents);

            pimObject["$FolderRef"] = [];
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.deepEqual([]);

            pimObject["$FolderRef"] = 5;
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.undefined();

            delete pimObject["$FolderRef"];
            pimObject["referenceFolder"] = "RefFolder";
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.deepEqual(["RefFolder"]);

            pimObject["referenceFolder"] = "RefFolder";
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.deepEqual(["RefFolder"]);

            pimObject["referenceFolder"] = parents;
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.deepEqual(parents);

            pimObject["referenceFolder"] = [];
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.deepEqual([]);

            pimObject["referenceFolder"] = 5;
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.parentFolderIds).to.be.undefined();

            const mockItem = new MockPimItem({});
            mockItem.setProp('parentFolderIds', 'test');
            expect(mockItem.parentFolderIds).to.be.eql(['test']);


        });

        it('body', function () {
            const pimObject: any = {
                "uid": "unid",
                "FirstName": "Unit",
                "LastName": "Test"
            };

            const pimItem = new PimItemClassic(pimObject);
            expect(pimItem.body).to.be.equal("");

            pimItem.body = "Body of item"
            expect(pimItem.body).to.be.equal("Body of item");

            pimItem.body = "";
            expect(pimItem.body).to.be.equal("");
        });

        it('bodyType', function () {
            const pimObject: any = {
                "uid": "unid",
                "FirstName": "Unit",
                "LastName": "Test"
            };

            const pimItem = new PimItemClassic(pimObject);
            expect(pimItem.bodyType).to.be.undefined();

            pimItem.bodyType = "text"
            expect(pimItem.bodyType).to.be.equal("text");

            pimItem.bodyType = undefined;
            expect(pimItem.bodyType).to.be.undefined();
        });

        it('subject', function () {
            const pimObject: any = {
                "uid": "unid",
                "FirstName": "Unit",
                "LastName": "Test"
            };

            const pimItem = new PimItemClassic(pimObject);
            expect(pimItem.subject).to.be.equal("");

            pimItem.subject = "A subject"
            expect(pimItem.subject).to.be.equal("A subject");

            pimItem.subject = "";
            expect(pimItem.subject).to.be.equal("");
        });

        it('isRead', function () {
            const pimObject: any = {
                "uid": "unid",
                "FirstName": "Unit",
                "LastName": "Test"
            };

            let mockItem = new MockPimItem(pimObject, PimItemFormat.DOCUMENT);
            expect(mockItem.isRead).to.be.false();

            mockItem.isRead = true;
            expect(mockItem.isRead).to.be.true();

            mockItem.isRead = false;
            expect(mockItem.isRead).to.be.false();

            pimObject["@unread"] = false;
            mockItem = new MockPimItem(pimObject, PimItemFormat.DOCUMENT);
            expect(mockItem.isRead).to.be.true();

            pimObject["@unread"] = 0;
            mockItem = new MockPimItem(pimObject, PimItemFormat.DOCUMENT);
            expect(mockItem.isRead).to.be.true();

            pimObject["@unread"] = true;
            mockItem = new MockPimItem(pimObject, PimItemFormat.DOCUMENT);
            expect(mockItem.isRead).to.be.false();

            mockItem.setProp("unread", undefined);
            expect(mockItem.isRead).to.be.false();
        });

        it('isPrivate', function () {
            const pimObject: any = {
                "uid": "unid",
                "FirstName": "Unit",
                "LastName": "Test"
            };

            let pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.isPrivate).to.be.false();

            pimItem.isPrivate = true;
            expect(pimItem.isPrivate).to.be.true();

            pimItem.isPrivate = false;
            expect(pimItem.isPrivate).to.be.false();

            pimObject["$PublicAccess"] = "1";
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.isPrivate).to.be.false();

            pimObject["$PublicAccess"] = "0";
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.isPrivate).to.be.true();

            delete pimObject["$PublicAccess"];

            pimObject["Public"] = "1";
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.isPrivate).to.be.false();

            pimObject["Public"] = "0";
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.isPrivate).to.be.true();

            delete pimObject["Public"];

            pimObject["privacy"] = "public";
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.isPrivate).to.be.false();

            pimObject["privacy"] = "private";
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.isPrivate).to.be.true();

            // This does not initialize the props.private property
            pimItem = new PimItemClassic(pimObject);
            expect(pimItem.isPrivate).to.be.true();
        });

        it('categories', function () {
            const pimObject: any = {
                "uid": "unid",
                "FirstName": "Unit",
                "LastName": "Test"
            };

            let pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.categories).to.be.an.Array();
            expect(pimItem.categories.length).to.be.equal(0);

            pimObject["Categories"] = "Not Categorized";
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.categories).to.be.an.Array();
            expect(pimItem.categories.length).to.be.equal(0);

            pimObject["Categories"] = ["red", "green", "blue"];
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.categories).to.be.an.Array();
            let cats = pimItem.categories;
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

            // This causes props.categoies to not be initialized
            pimItem = new PimItemClassic(pimObject);
            expect(pimItem.categories).to.be.an.Array();
            expect(pimItem.categories.length).to.be.equal(0);

        });

        it('attachments', function () {
            const pimObject: any = {
                "uid": "unid",
                "FirstName": "Unit",
                "LastName": "Test"
            };

            let pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.attachments).to.be.an.Array();
            expect(pimItem.attachments.length).to.be.equal(0);

            pimObject["$FILES"] = ["file1", "file2", "file3"];
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.attachments).to.be.an.Array();
            let atts = pimItem.attachments;
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

            pimObject["$FILES"] = "this is not an array!";
            pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            expect(pimItem.attachments).to.be.an.Array();
            expect(pimItem.attachments.length).to.be.equal(0);
        });

        it('extendedProperties empty and setter', function () {
            const pimObject = {
                "@unid": "unit-test-contact",
                "FirstName": "Unit",
                "LastName": "Test"
            }

            // Test empty AdditionalFields
            const pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
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

            const pimItem = new PimItemClassic(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
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

    describe("PimItem.getNextExtPropertyIndex", function () {

        it('With existing extended properties', function () {
            const mockItem = new MockPimItem(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            expect(mockItem.getNextExtPropertyIndex()).to.be.equal(2);
        });

        it('No existing extended properties', function () {
            const pimObject = {
                "@unid": "unit-test-contact",
                "FirstName": "Unit",
                "LastName": "Test",
            };
            const mockItem = new MockPimItem(pimObject, PimItemFormat.DOCUMENT);
            expect(mockItem.getNextExtPropertyIndex()).to.be.equal(0);
        });

        it('Extended properties with empty property', function () {
            const pimObject = {
                "@unid": "unit-test-contact",
                "FirstName": "Unit",
                "LastName": "Test",
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
            const mockItem = new MockPimItem(pimObject, PimItemFormat.DOCUMENT);
            expect(mockItem.getNextExtPropertyIndex()).to.be.equal(1);

            mockItem.setProp("AdditionalFields", {
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
                "@unid": "unit-test-contact",
                "FirstName": "Unit",
                "LastName": "Test",
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
            const mockItem = new MockPimItem(pimObject, PimItemFormat.DOCUMENT);
            expect(mockItem.getNextExtPropertyIndex()).to.be.equal(6);
        });
    });

    describe("PimItem.deleteExtendedProperty", function () {
        it('Delete first property', function () {
            const pimItem = new PimItemClassic(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
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
            const pimItem = new PimItemClassic(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
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
            const pimItem = new PimItemClassic(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            pimItem.deleteExtendedProperty([{ "PropertyId": 32896, "PropertyType": "Number" }]);
            const extFields = pimItem.extendedProperties;
            expect(extFields).to.be.an.Array();
            expect(extFields.length).to.be.equal(2);
        });
    });

    describe("PimItem.findExtendedProperty", function () {

        it('Find first property', function () {
            const pimItem = new PimItemClassic(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            const field = pimItem.findExtendedProperty({ "PropertyId": 32899 });
            expect(field["PropertyId"]).to.be.equal(32899);
            expect(field["Value"]).to.be.equal("fozzy.bear@fakemail.com");
            expect(field["PropertyType"]).to.be.equal("String");
            expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");
        });

        it('Find last property', function () {
            const pimItem = new PimItemClassic(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            const field = pimItem.findExtendedProperty({ "PropertyId": 32896 });
            expect(field["PropertyId"]).to.be.equal(32896);
            expect(field["Value"]).to.be.true();
            expect(field["PropertyType"]).to.be.equal("Boolean");
            expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");
        });

        it('Find with no hits', function () {
            const pimItem = new PimItemClassic(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            const field = pimItem.findExtendedProperty({ "PropertyId": "text", "PropertyType": "String" });
            expect(field).to.be.undefined();
        });

        it('Find with bogus criteria', function () {
            const pimItem = new PimItemClassic(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            const field = pimItem.findExtendedProperty(["bogus"]);
            expect(field).to.be.undefined();
        });

        it('Find with non-object property', function () {
            const pimObject = {
                "@unid": "unit-test-contact",
                "FirstName": "Unit",
                "LastName": "Test",
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
            const pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
            let field = pimItem.findExtendedProperty({ "some_key": "value2" });
            expect(field).to.not.be.undefined();
            field = pimItem.findExtendedProperty({ "some_key": "not found" });
            expect(field).to.be.undefined();
        });
    });

    describe("PimItem.updateExtendedProperty", function () {

        const newValue = {
            DistinguishedPropertySetId: 'Address',
            PropertyId: 32899,
            PropertyType: 'String',
            Value: 'kermit.frog@fakemail.com'
        }

        it('Update first property', function () {
            const pimItem = new PimItemClassic(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            pimItem.updateExtendedProperty({ "PropertyId": 32899 }, newValue);
            const field = pimItem.findExtendedProperty({ "PropertyId": 32899 });
            expect(field["PropertyId"]).to.be.equal(32899);
            expect(field["Value"]).to.be.equal("kermit.frog@fakemail.com");
            expect(field["PropertyType"]).to.be.equal("String");
            expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");
        });

        it('Update missing property', function () {
            const pimItem = new PimItemClassic(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
            newValue["PropertyId"] = 12345;
            pimItem.updateExtendedProperty({ "PropertyId": 12345 }, newValue);
            const field = pimItem.findExtendedProperty({ "PropertyId": 12345 });
            expect(field["PropertyId"]).to.be.equal(12345);
            expect(field["Value"]).to.be.equal("kermit.frog@fakemail.com");
            expect(field["PropertyType"]).to.be.equal("String");
            expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");
        });

        it('Update with no existing properties', function () {
            const pimItem = new PimItemClassic({ "unid": "test" }, PimItemFormat.DOCUMENT);
            newValue["PropertyId"] = 12345;
            pimItem.updateExtendedProperty({ "PropertyId": 12345 }, newValue);
            const field = pimItem.findExtendedProperty({ "PropertyId": 12345 });
            expect(field["PropertyId"]).to.be.equal(12345);
            expect(field["Value"]).to.be.equal("kermit.frog@fakemail.com");
            expect(field["PropertyType"]).to.be.equal("String");
            expect(field["DistinguishedPropertySetId"]).to.be.equal("Address");
        });

    });

    describe("PimItem.addExtendedProperty", function () {

        const newValue = {
            DistinguishedPropertySetId: 'Address',
            PropertyId: 32899,
            PropertyType: 'String',
            Value: 'kermit.frog@fakemail.com'
        }

        it('Add first property', function () {
            const pimObject = {
                "@unid": "unit-test-contact",
                "FirstName": "Unit",
                "LastName": "Test",
            };
            const pimItem = new PimItemClassic(pimObject, PimItemFormat.DOCUMENT);
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
            const pimItem = new PimItemClassic(pimObjectWithExtendedProperties, PimItemFormat.DOCUMENT);
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


    describe("PimItem.getAdditionalProperty", function () {

        it('Add first property', function () {
            const pimObject: any = {
                "@unid": "unit-test-contact",
                "FirstName": "Unit",
                "LastName": "Test",
            };
            const pimItem = new MockPimItem(pimObject);
            let prop = pimItem.getAdditionalProperty("bogus");
            expect(prop).to.be.undefined();
            prop = pimItem.getAdditionalProperty("xHCL-bogus");
            expect(prop).to.be.undefined();

            pimItem.setProp("AdditionalFields", { "xHCL-key1": "value" });
            prop = pimItem.getAdditionalProperty("xHCL-key1");
            expect(prop).to.be.equal("value");

            prop = pimItem.getAdditionalProperty("key1");
            expect(prop).to.be.equal("value");
        });
    });

    describe("PimItem.setAdditionalProperty", function () {

        it('Add first property', function () {
            const pimObject: any = {
                "@unid": "unit-test-contact",
                "FirstName": "Unit",
                "LastName": "Test",
            };
            const pimItem = new PimItemClassic(pimObject);
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

    describe("PimItem.deleteAdditionalProperty", function () {

        it('Delete first property', function () {
            const pimObject: any = {
                "@unid": "unit-test-contact",
                "FirstName": "Unit",
                "LastName": "Test",
                "AdditionalFields": {
                    "xHCL-Key": "value"
                }
            };
            const pimItem = new MockPimItem(pimObject, PimItemFormat.DOCUMENT);
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

            pimItem.removeProp("AdditionalFields");
            pimItem.deleteAdditionalProperty("Key123");
            prop = pimItem.getAdditionalProperty("Key123");
            expect(prop).to.be.equal(undefined);

        });
    });

    describe("PimItem.removeAdditionalProperty", function () {

        it('Add first property', function () {
            const pimObject: any = {
                "@unid": "unit-test-contact",
                "FirstName": "Unit",
                "LastName": "Test",
                "AdditionalFields": {
                    "xHCL-Key": "value"
                }
            };
            const pimItem = new MockPimItem(pimObject, PimItemFormat.DOCUMENT);
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

            pimItem.removeProp("AdditionalFields");
            pimItem.removeAdditionalProperty("Key123");
            prop = pimItem.getAdditionalProperty("Key123");
            expect(prop).to.be.equal(undefined);

        });
    });

    describe("PimItem.toPimStructure", function () {

        it('Add first property', function () {
            const pimObject: any = {
                "@unid": "unit-test-contact",
                "FirstName": "Unit",
                "LastName": "Test",
            };

            const pimItem = new MockPimItem(pimObject, PimItemFormat.DOCUMENT);
            let pimStructure = pimItem.toPimStructure();
            expect(pimStructure).to.be.eql({ "@unread": true });

            pimItem.removeProp("unread");
            pimStructure = pimItem.toPimStructure();
            expect(pimStructure).to.be.eql({});

            pimItem.categories = ["one"];
            pimStructure = pimItem.toPimStructure();
            expect(pimStructure).to.be.eql({ "Categories": "one" });

            pimItem.categories = ["one", "two"];
            pimStructure = pimItem.toPimStructure();
            expect(pimStructure).to.be.eql({ "Categories": ["one", "two"] });

            pimItem.removeProp("categories");
            pimItem.setProp("AdditionalFields", {
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
            expect(pimStructure).to.be.eql({
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

            pimItem.setProp("AdditionalFields", {
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
            expect(pimStructure).to.be.eql({
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
                    }
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


