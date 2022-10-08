import { expect, sinon } from '@loopback/testlab';
import { KeepDeleteLabelResults, KeepMoveLabelResults, KeepPimBaseResults, KeepPimLabelManager, PimLabelTypes, designTypeForLabelType, PimLabelDesignTypes, PimItemFactory, PimItemFormat, KeepPimConstants } from "../../../keep";
import { KeepPim } from '../../../services';
import { setupTransportManagerStub, setupUserManagerEmptyTokenStub, setupUserManagerStub } from "../../test-helper";


describe('KeepPimLabelManager tests', function () {
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

        // Clear label cache
        KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);
    });

    it('getLabels', async function () {
        
        const labels = [
            { "FolderId": "A4D87D90E1B19842852564FF006DED4E", "View": "($All)", "isFolder": "false", "DocumentCount": 20, "Type": "Mail", "DisplayName": "All Documents" },
            { "FolderId": "738CB93AE2E1B7F8852564B5001283E2", "View": "($Calendar)", "isFolder": "false", "Alias": ["Calendar"], "DocumentCount": 7, "Type": "Calendar", "DisplayName": "Calendar" },
            { "FolderId": "21D822802DA4AA14852567D6005BD9EB", "View": "($Contacts)", "isFolder": "false", "Alias": ["People"], "DocumentCount": 0, "Type": "Contacts", "DisplayName": "Contacts" }
        ];
        keepPimStub.getLabels.resolves(labels);

        // Test default ignore just the All view
        let results = await KeepPimLabelManager.getInstance().getLabels(userInfo);
        expect(results).to.be.an.Array();
        expect(results.length).to.be.equal(2); 

        KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);

        // Test ignore types
        results = await KeepPimLabelManager.getInstance().getLabels(userInfo, true, {types: [PimLabelTypes.CALENDAR]});
        expect(results).to.be.an.Array();
        expect(results.length).to.be.equal(2);

        KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);

        // Test ignore views and types
        results = await KeepPimLabelManager.getInstance().getLabels(userInfo, true, {views: [KeepPimConstants.CONTACTS], types: [PimLabelTypes.CALENDAR]});
        expect(results).to.be.an.Array();
        expect(results.length).to.be.equal(1);

        KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);

        // Test ignore all labels
        results = await KeepPimLabelManager.getInstance().getLabels(userInfo, true, {views: [KeepPimConstants.ALL, KeepPimConstants.CONTACTS], types: [PimLabelTypes.CALENDAR]});
        expect(results).to.be.an.Array();
        expect(results.length).to.be.equal(0);

        KeepPimLabelManager.getInstance().invalidateCacheForUser(userInfo);

        // Test ignore none
        results = await KeepPimLabelManager.getInstance().getLabels(userInfo, true, {});
        expect(results).to.be.an.Array();
        expect(results.length).to.be.equal(3);

    });

    it('getLabel success', async function () {
        const FolderId = "DABA975B9FB113EB852564B5001283EA";
        const label = {
            "FolderId": FolderId,
            "View": "($Sent)",
            "isFolder": "false",
            "DocumentCount": 10,
            "DisplayName": "Sent"
        };
        keepPimStub.getLabel.resolves(label);

        const results = await KeepPimLabelManager.getInstance().getLabel(userInfo, FolderId);

        expect(results.documentCount).to.be.equal(10);
        expect(results.folderId).to.be.equal(FolderId);

    });

    it('getLabel user access Token', async function () {
        const FolderId = "DABA975B9FB113EB852564B5001283EA";
        const label = {
            "FolderId": FolderId,
            "View": "($Sent)",
            "isFolder": "false",
            "DocumentCount": 10,
            "DisplayName": "Sent"
        };
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        keepPimStub.getLabel.resolves(label);
        let errMessage: string | undefined;
        try {
            await KeepPimLabelManager.getInstance().getLabel(userInfo, FolderId);
        }
        catch (error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });


    it('getLabel failure', async function () {
        const FolderId = "DABA975B9FB113EB852564B5001283EA";
        const error = new Error("getLabel fails");
        keepPimStub.getLabel.rejects(error);

        await expect(KeepPimLabelManager.getInstance().getLabel(userInfo, FolderId)).to.be.rejectedWith(error);
    });

    it('moveLabel success', async function () {
        const label = {
            "FolderId": "TEST_FOLDER_ID",
            "View": "test",
            "isFolder": "true",
            "DocumentCount": 10,
            "DisplayName": "Test"
        };
        const targetLabel = "F98381D592E3C0B80025869B0061759B";
        const labelToMove = "69D93138451B7EFA0025869B006176BD";

        // Configure stub to return the test data for the Keep call
        const moveResults: KeepMoveLabelResults = {
            "Move Status": `Successful move of 1 folders to label ${targetLabel}`,
            "movedFolderIds": [
                {
                    "statusText": "OK",
                    "status": 200,
                    "message": "move folder successful",
                    "unid": labelToMove
                }
            ]
        };
        keepPimStub.moveLabel.resolves(moveResults);
        keepPimStub.getLabel.resolves(label);

        const results = await KeepPimLabelManager.getInstance().moveLabel(userInfo, targetLabel, [labelToMove]);
        expect(results.movedFolderIds.length).to.be.equal(1);
        expect(results.movedFolderIds[0].status).to.be.equal(200);
        expect(results.movedFolderIds[0].unid).to.be.equal(labelToMove);

    });

    it('moveLabel failed', async function () {
        const label = {
            "FolderId": "TEST_FOLDER_ID",
            "View": "test",
            "isFolder": "true",
            "DocumentCount": 10,
            "DisplayName": "Test"
        };
        const targetLabel = "F98381D592E3C0B80025869B0061759B";
        const labelToMove = "69D93138451B7EFA0025869B006176BD";
        const error = new Error("moveLabel failed");

        // Configure stub to throw an error
        keepPimStub.moveLabel.rejects(error);
        keepPimStub.getLabel.resolves(label);

        await expect(KeepPimLabelManager.getInstance().moveLabel(userInfo, targetLabel, [labelToMove])).to.be.rejectedWith(error);

    });

    it('createLabel', async function () {
        const createLabel = {
            "FolderId": "50F87530A578D6C8002586BE004F2450",
            "View": "TestMessages",
            "DocumentCount": 0,
            "DisplayName": "TestMessages"
        };

        keepPimStub.createLabel.resolves(createLabel);
        const pimLabel = PimItemFactory.newPimLabel({}, PimItemFormat.DOCUMENT);
        pimLabel.displayName = "TestMessages";

        const results = await KeepPimLabelManager.getInstance().createLabel(userInfo, pimLabel)
        expect(results.folderId).to.be.equal(createLabel.FolderId);

        pimLabel.type = PimLabelTypes.CONTACTS;
        pimLabel.parentFolderId = "1234"

        const results2 = await KeepPimLabelManager.getInstance().createLabel(userInfo, pimLabel, PimLabelTypes.CONTACTS)
        expect(results2.folderId).to.be.equal(createLabel.FolderId);

        pimLabel.type = PimLabelTypes.TASKS;
        pimLabel.parentFolderId = "5678"

        const results3 = await KeepPimLabelManager.getInstance().createLabel(userInfo, pimLabel, PimLabelTypes.TASKS)
        expect(results3.folderId).to.be.equal(createLabel.FolderId);

    });


    it('updateLabel success', async function () {
        const label = PimItemFactory.newPimLabel({ "@unid": "69D93138451B7EFA0025869B006176BD", "DisplayName": "UnitTest" }, PimItemFormat.DOCUMENT);

        // Configure stub to return the test data for the Keep call
        const updateResults: KeepPimBaseResults = {
            "statusText": "OK",
            "status": 200,
            "message": "update complete",
            "unid": label.folderId
        };
        keepPimStub.updateLabel.resolves(updateResults);

        const results = await KeepPimLabelManager.getInstance().updateLabel(userInfo, label);
        expect(results.status).to.be.equal(200);
        expect(results.unid).to.be.equal(label.folderId);
    });

    it('updateLabel failed', async function () {
        const label = PimItemFactory.newPimLabel({ "@unid": "69D93138451B7EFA0025869B006176BD", "DisplayName": "UnitTest" }, PimItemFormat.DOCUMENT);

        const error = new Error("updateLabel failed");

        // Configure stub to throw an error
        keepPimStub.updateLabel.rejects(error);

        await expect(KeepPimLabelManager.getInstance().updateLabel(userInfo, label)).to.be.rejectedWith(error);

    });
    it('deleteLabel success', async function () {
        const labelId = "1F842965A1C015650025869B0060A606";
        const deleteResults: KeepDeleteLabelResults = {
            "deletedDocuments": 10,
            "statusText": "OK",
            "status": 200,
            "message": "deletion complete",
            "unid": labelId
        };
        keepPimStub.deleteLabel.resolves(deleteResults);

        const results = await KeepPimLabelManager.getInstance().deleteLabel(userInfo, labelId);
        expect(results.deletedDocuments).to.be.equal(10);
        expect(results.status).to.be.equal(200);
        expect(results.unid).to.be.equal(labelId);
    });

    it('deleteLabel failed', async function () {
        const labelId = "1F842965A1C015650025869B0060A606";
        const error = new Error("deleteLabel fails")
        keepPimStub.deleteLabel.rejects(error);

        await expect(KeepPimLabelManager.getInstance().deleteLabel(userInfo, labelId)).to.be.rejectedWith(error);
    });

    it('getPimLabelsFromJson', async function () {

        const jsonData = '[ { "FolderId": "A4D87D90E1B19842852564FF006DED4E",' +
            ' "View": "($All)",' +
            ' "isFolder": "false",' +
            ' "DocumentCount": 18,' +
            ' "Type": "Mail",' +
            ' "DisplayName": "All Documents"' +
            ' },' +
            ' { ' +
            '"FolderId": "738CB93AE2E1B7F8852564B5001283E2",' +
            '"View": "($Calendar)",' +
            '"isFolder": "false",' +
            '"Alias": [' +
            '"Calendar"' +
            '],' +
            '"DocumentCount": 7,' +
            '"Type": "Calendar",' +
            '"DisplayName": "Calendar"' +
            '},' +
            '{' +
            '"FolderId": "21D822802DA4AA14852567D6005BD9EB",' +
            '"View": "($Contacts)",' +
            '"isFolder": "false",' +
            '"Alias": [' +
            '"People"' +
            '],' +
            '"DocumentCount": 0,' +
            '"Type": "Contacts",' +
            '"DisplayName": "Contacts"' +
            '}' +
            ']';
        const pimlabel = KeepPimLabelManager.getInstance().getPimLabelsFromJson(jsonData);
        expect(pimlabel).to.be.an.Array();
        expect(pimlabel.length).to.equal(3);

        const jsonData2 = ' { "FolderId": "A4D87D90E1B19842852564FF006DED4E",' +
            ' "View": "($All)",' +
            ' "isFolder": "false",' +
            ' "DocumentCount": 18,' +
            ' "Type": "Mail",' +
            ' "DisplayName": "All Documents"' +
            ' }';
        const pimlabel2 = KeepPimLabelManager.getInstance().getPimLabelsFromJson(jsonData2);
        expect(pimlabel2).to.be.an.Array();
        expect(pimlabel2.length).to.equal(1);

    });

    it('designTypeForLabelType', async function () {

        const labeltype = PimLabelTypes.CONTACTS;
        const designtype = PimLabelDesignTypes.CONTACTS;

        const types = designTypeForLabelType(labeltype);
        expect(types).to.be.equal(designtype);

        const labeltype2 = PimLabelTypes.JOURNAL;
        const designtype2 = PimLabelDesignTypes.JOURNAL;

        const types2 = designTypeForLabelType(labeltype2);
        expect(types2).to.be.equal(designtype2);

        const labeltype3 = PimLabelTypes.TASKS;
        const designtype3 = PimLabelDesignTypes.TASKS;

        const types3 = designTypeForLabelType(labeltype3);
        expect(types3).to.be.equal(designtype3);

        const labeltype4 = PimLabelTypes.MAIL;
        const designtype4 = PimLabelDesignTypes.MAIL;

        const types4 = designTypeForLabelType(labeltype4);
        expect(types4).to.be.equal(designtype4);

    });
});

