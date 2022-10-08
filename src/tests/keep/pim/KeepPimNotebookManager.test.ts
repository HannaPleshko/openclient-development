import { KeepPimNotebookManager } from '../../../keep/pim/KeepPimNotebookManager';
import { KeepPim } from '../../../services';
import { createObjectFromFile, setupTransportManagerStub, setupUserManagerEmptyTokenStub, setupUserManagerStub } from '../../test-helper';
import { expect, sinon } from '@loopback/testlab';
import { PimItemFactory } from '../../../keep';

describe('KeepPimNotebookManager tests', function () {
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

    it('getNotes success without folderId', async function () {
        const note = createObjectFromFile("note.list.document.json");
        keepPimStub.getNotes.resolves(note); 
       
        const results = await KeepPimNotebookManager.getInstance().getNotes(userInfo);
        expect(results).to.be.Array();
        expect(results.length).to.be.equal(note.length);
    });

    it('getNotes success with folderId', async function () {
        const note = createObjectFromFile("note.list.document.json");
        keepPimStub.getMessages.resolves(note); 
       
        const results = await KeepPimNotebookManager.getInstance().getNotes(userInfo, true, undefined, undefined, "testid");
        expect(results).to.be.Array();
        expect(results.length).to.be.equal(note.length);
    });

    it('getNotes returning array of single item', async function () {
        const note = createObjectFromFile("note.json");
        keepPimStub.getNotes.resolves(note); 
       
        const results = await KeepPimNotebookManager.getInstance().getNotes(userInfo);
        expect(results.length).to.be.equal(1);
    });

    it('getNotes user access token', async function () {
        const note = createObjectFromFile("note.json");

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimNotebookManager.getInstance().getNotes(userInfo, note);
        }
        catch (err) {
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('getNote success', async function () {
        const note = createObjectFromFile("note.json");
        keepPimStub.getNote.resolves(note); 

        const results = await KeepPimNotebookManager.getInstance().getNote(userInfo, note["@unid"]);
        expect(results?.unid).to.be.equal(note["@unid"]);
    });
    
    it('getNote user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimNotebookManager.getInstance().getNote(userInfo, "913874D5EC9A905D002586BD00560681" );
        }
        catch (err) {
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('getNote failure', async function() {
        const unid = "";
        const error = new Error("No unid for PIM note");
        keepPimStub.getNote.rejects(error);

        await expect(KeepPimNotebookManager.getInstance().getNote(userInfo, unid)).to.be.rejectedWith(error);
    });

    it('createNote success', async function () {
        const note = createObjectFromFile("note.json");
        const pimNote = PimItemFactory.newPimNote(note);
        
        const createResponse = {
            "statusText": "OK",
            "status": 200,
            "message": "creation complete",
            "unid": note["@unid"]
        }
        keepPimStub.createNote.resolves(createResponse); 
        
        const results = await KeepPimNotebookManager.getInstance().createNote(pimNote,userInfo);
        expect(results).to.be.equal(note["@unid"]);
    });

    it('createNote user access token', async function () {
        const note = createObjectFromFile("note.json");

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        const pimNote = PimItemFactory.newPimNote(note);
        setupUserManagerEmptyTokenStub();
        
        let errMessage: string | undefined;
        try {
            await KeepPimNotebookManager.getInstance().createNote(pimNote, userInfo);
        }
        catch (err) {
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('updateNote success', async function () {
        const note = createObjectFromFile("note.json");
        keepPimStub.updateNote.resolves(note);

        const pimNote = PimItemFactory.newPimNote(note);
        
        const results: any = await KeepPimNotebookManager.getInstance().updateNote(pimNote,userInfo);
        expect(results["@unid"]).to.be.equal(note["@unid"]);
    });


    it('updateNote user access token', async function () {
        const note = createObjectFromFile("note.json");
        
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        const pimNote = PimItemFactory.newPimNote(note);
        setupUserManagerEmptyTokenStub();
        
        let errMessage: string | undefined;
        try {
            await KeepPimNotebookManager.getInstance().updateNote(pimNote,userInfo);
        }
        catch (err) {
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('deleteNote success without hard delete', async function () {
        const unid = "B837018C6E549346002586F50055019A";
        const deleteResponse = {
            "statusText": "OK",
            "status": 200,
            "message": "deletion complete",
            "unid": unid
        }
        keepPimStub.deleteNote.resolves(deleteResponse);

        const results = await KeepPimNotebookManager.getInstance().deleteNote(unid, userInfo);
        expect(results.unid).to.be.equal(unid);
        expect(results.status).to.be.equal(200);
    });

    it('deleteNote success with hard delete', async function () {
        const noteHardDelete = {
            "statusText": "OK",
            "status": 200,
            "message": "Document permanently deleted: E78A9910A5826D90002586F00075145F"
        }
        keepPimStub.deleteItemFromTrash.resolves(noteHardDelete);
      
        const results = await KeepPimNotebookManager.getInstance().deleteNote("UNID", userInfo, true);
        expect(results.status).to.be.equal(200);
    });

    it('deleteNote user access token', async function () {
        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();
        let errMessage: string | undefined;
        try {
            await KeepPimNotebookManager.getInstance().deleteNote("UNID", userInfo, false);
        }
        catch (err) {
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

});
