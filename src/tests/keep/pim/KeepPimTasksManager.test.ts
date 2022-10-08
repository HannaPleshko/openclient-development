import { expect, sinon } from '@loopback/testlab';
import { PimItemFactory } from '../../../keep';
import { KeepPimTasksManager } from '../../../keep/pim/KeepPimTasksManager';
import { KeepPim } from '../../../services';
import { createObjectFromFile, setupTransportManagerStub, setupUserManagerEmptyTokenStub, setupUserManagerStub } from '../../test-helper';

describe('KeepPimTasksManager tests', function () {
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

    it('getTasks success without folderId', async function () {
        const task = createObjectFromFile("task.list.document.json");
        keepPimStub.getTasks.resolves(task);

        const results = await KeepPimTasksManager.getInstance().getTasks(userInfo);
        expect(results).to.be.Array();
        expect(results.length).to.be.equal(task.length);
    });

    it('getTasks success with folderId', async function () {
        const task = createObjectFromFile("task.list.document.json");
        keepPimStub.getMessages.resolves(task);

        const results = await KeepPimTasksManager.getInstance().getTasks(userInfo, true, undefined, undefined, "testid");
        expect(results).to.be.Array();
        expect(results.length).to.be.equal(task.length);
    });

    it('getTasks user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();
        setupUserManagerEmptyTokenStub();

        await expect(KeepPimTasksManager.getInstance().getTasks(userInfo)).to.be.rejectedWith({message: 'User is unauthenticated'});
    });

    it('getTasks returning array of single item', async function () {
        const task = createObjectFromFile("task.json");
        keepPimStub.getTasks.resolves(task);

        const results = await KeepPimTasksManager.getInstance().getTasks(userInfo);
        expect(results.length).to.be.equal(1);
    });

    it('getTask success', async function () {
        const task = createObjectFromFile("task.json");
        keepPimStub.getTask.resolves(task);

        const results = await KeepPimTasksManager.getInstance().getTask(task.uid, userInfo);
        expect(results?.title).to.be.equal("Created in Postman");
        expect(results?.unid).to.be.equal(task.uid);
    });

    it('getTask user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();
        setupUserManagerEmptyTokenStub();

        await expect(KeepPimTasksManager.getInstance().getTask("testid", userInfo)).to.be.rejectedWith({message: 'User is unauthenticated'});
    });

    it('getTask failure', async function () {
        const unid = "";
        const error = new Error("No unid for PIM task");
        keepPimStub.getTask.rejects(error);

        await expect(KeepPimTasksManager.getInstance().getTask(unid, userInfo)).to.be.rejectedWith(error);
    });

    it('createTask success', async function () {
        const task = createObjectFromFile("task.json");
        const pimTask = PimItemFactory.newPimTask(task);

        const createResponse = {
            "statusText": "OK",
            "status": 200,
            "message": "creation complete",
            "unid": task.uid
        }
        keepPimStub.createTaskEntry.resolves(createResponse);

        const results = await KeepPimTasksManager.getInstance().createTask(pimTask, userInfo);
        expect(results).to.be.equal(task.uid);
    });

    it('createTask user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();
        setupUserManagerEmptyTokenStub();

        const task = createObjectFromFile("task.json");

        await expect(KeepPimTasksManager.getInstance().createTask(task, userInfo)).to.be.rejectedWith({message: 'User is unauthenticated'});
    });


    it('updateTask success', async function () {
        const task = createObjectFromFile("task.json");
        keepPimStub.updateTaskEntry.resolves(task);

        const pimTask = PimItemFactory.newPimTask(task);

        const results: any = await KeepPimTasksManager.getInstance().updateTask(pimTask, userInfo);
        expect(results["@unid"]).to.be.equal(task["uid"]);
    });

    it('updateTask user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();
        setupUserManagerEmptyTokenStub();

        const task = createObjectFromFile("task.json");
        await expect(KeepPimTasksManager.getInstance().updateTask(task, userInfo)).to.be.rejectedWith({message: 'User is unauthenticated'});
    });

    it('deleteTask success without hard delete', async function () {
        const task = createObjectFromFile("task.json");
        keepPimStub.deleteTaskEntry.resolves(task);

        const results = await KeepPimTasksManager.getInstance().deleteTask(task.uid, userInfo);
        expect(results?.uid).to.be.equal(task.uid);
    });


    it('deleteTask success with hard delete', async function () {
        const unid = "E78A9910A5826D90002586F00075145F";
        const taskHardDelete = {
            "statusText": "OK",
            "status": 200,
            "message": `Document permanently deleted: ${unid}`
        }
        keepPimStub.deleteItemFromTrash.resolves(taskHardDelete);

        const results = await KeepPimTasksManager.getInstance().deleteTask(unid, userInfo, true);
        expect(results.status).to.be.equal(200);
    });

    it('deleteTask user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();
        setupUserManagerEmptyTokenStub();

        await expect(KeepPimTasksManager.getInstance().deleteTask("UNID", userInfo, false)).to.be.rejectedWith({message: 'User is unauthenticated'});
    });

});


