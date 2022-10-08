import { expect, sinon } from '@loopback/testlab';
import { KeepPimAttachmentManager } from '../../../keep';
import { OpenClientKeepComponent } from '../../../OpenClientKeepComponent';
import { KeepPim } from '../../../services';
import { setupTransportManagerStub, setupUserManagerEmptyTokenStub, setupUserManagerStub } from '../../test-helper';


describe('KeepPimAttachmentManager tests', function () {
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

    it('deleteAttachment success', async function () {

        const response = {
            "statusText": "OK",
            "status": 200,
            "message": "deletion complete",
        };
        keepPimStub.deleteAttachment.resolves(response);

        const result = await KeepPimAttachmentManager.getInstance().deleteAttachment(userInfo, "1234", "testname");
        expect(result).to.be.equal(response);

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try {
            await KeepPimAttachmentManager.getInstance().deleteAttachment(userInfo, "1234", "testname");
        }
        catch (err) {
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('deleteAttachment fails', async function () {
        const error = new Error('deleteAttachment has failed');
        keepPimStub.deleteAttachment.rejects(error);

        await expect(KeepPimAttachmentManager.getInstance().deleteAttachment(userInfo, "1234", "testname")).to.be.rejectedWith(error);
    });

    it('createAttachment success', async function () {
        const response = {
            "status": 200,
            "filename": "AndroidSession.txt"
        }

        const managerStub = sinon.stub(KeepPimAttachmentManager.getInstance(), 'sendAttachment');
        managerStub.resolves(response);

        const result = await KeepPimAttachmentManager.getInstance().createAttachment(userInfo, "1234", "testname");
        expect(result).to.be.equal(response)

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try {
            await KeepPimAttachmentManager.getInstance().createAttachment(userInfo, "1234", "testname");
        }
        catch (err) {
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('createAttachment fails', async function () {
        const error = new Error('createAttachment has failed');
        const managerStub = sinon.stub(KeepPimAttachmentManager.getInstance(), 'sendAttachment');

        managerStub.rejects(error);

        await expect(KeepPimAttachmentManager.getInstance().createAttachment(userInfo, "1234", "testname")).to.be.rejectedWith(error);
    });

    it('sendAttachment success', async function () {
        const response = {
            statusCode: 200,
            statusMessage: "Success",
            headers: {},
            body: '{ "status": 200, "filename": "AndroidSession.txt" }'
        }
        sinon.stub(KeepPimAttachmentManager.getInstance(), "callRequest").yields(undefined, response);
        sinon.stub(OpenClientKeepComponent, 'getKeepBaseUrl').callsFake(() => {
            return "https://testserver";
        });

        const result = await KeepPimAttachmentManager.getInstance().sendAttachment("testToken", "testID", "testAttachment", "attachmentName", "content-type");
        expect(result).to.be.deepEqual(JSON.parse(response.body));
    });

    it('sendAttachment non-json body', async function () {
        const response = {
            statusCode: 200,
            statusMessage: "Success",
            headers: {},
            body: 'THIS IS NOT JSON'
        }
        sinon.stub(KeepPimAttachmentManager.getInstance(), "callRequest").yields(undefined, response);
        sinon.stub(OpenClientKeepComponent, 'getKeepBaseUrl').callsFake(() => {
            return "https://testserver";
        });

        const result = await KeepPimAttachmentManager.getInstance().sendAttachment("testToken", "testID", "testAttachment", "attachmentName", "content-type");
        expect(result).to.be.equal('THIS IS NOT JSON');
    });

    it('sendAttachment fails with bad status code', async function () {
        const response = {
            statusCode: 403,
            statusMessage: "Failed"
        }

        sinon.stub(KeepPimAttachmentManager.getInstance(), "callRequest").yields(undefined, response);

        sinon.stub(OpenClientKeepComponent, 'getKeepBaseUrl').callsFake(() => {
            return "https://testserver";
        });

        await expect(KeepPimAttachmentManager.getInstance().sendAttachment("testToken", "testID", "testAttachment", "attachmentName", "content-type")).to.be.rejected();
    });

    it('sendAttachment fails with error', async function () {

        const error = new Error('sendAttachment has failed');
        sinon.stub(KeepPimAttachmentManager.getInstance(), "callRequest").yields(error, undefined);

        sinon.stub(OpenClientKeepComponent, 'getKeepBaseUrl').callsFake(() => {
            return "https://testserver";
        });

        await expect(KeepPimAttachmentManager.getInstance().sendAttachment("testToken", "testID", "testAttachment", "attachmentName", "content-type")).to.be.rejectedWith(error);
    });

    it('getAttachment success', async function () {

        const response = {
            headers: {
                'content-type': 'application/json',
            },
            body: "testName"
        }
        keepPimStub.getAttachment.resolves(response);

        const result = await KeepPimAttachmentManager.getInstance().getAttachment(userInfo, "testid", "testName");
        expect(result.attachmentName).to.be.equal(response.body);
        expect(result.contentType).to.be.equal(response.headers['content-type']);
        expect(result.attachmentBuffer).to.be.equal("testName");

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try {
            await KeepPimAttachmentManager.getInstance().getAttachment(userInfo, "1234", "testname");
        }
        catch (err) {
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('getAttachment fails', async function () {
        const error = new Error('getAttachment has failed');
        keepPimStub.getAttachment.rejects(error);

        await expect(KeepPimAttachmentManager.getInstance().getAttachment(userInfo, "1234", "testname")).to.be.rejectedWith(error);
    });

});