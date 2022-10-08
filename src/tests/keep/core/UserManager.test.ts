import { expect, sinon } from '@loopback/testlab';
import { KeepCore, UserManager } from '../../../internal';
import { setupCoreTransportManager } from '../../test-helper';

describe('UserManager tests', () => {
    describe('Test getUserAccessToken', () => {

        const userId = 'test.user@test.com';
        const userIdNgrok = 'test.user@xxx.ngrok.io';
        const authResults = {
            "bearer": "test-token",
            "claims": {
                "iss": "Domino Keep RANDOM",
                "sub": "CN=Test User/O=ProjectKeep",
                "scopes": "MAIL $DATA $DECRYPT"
            },
            "leeway": 5,
            "expSeconds": 3600,
            "issueDate": new Date().toISOString()
        };

        let keepCoreStub: sinon.SinonStubbedInstance<KeepCore>;
        let savedEnv: string | undefined;

        beforeEach(() => {
            keepCoreStub = setupCoreTransportManager();
            savedEnv = process.env.NODE_ENV;
        });

        afterEach(() => {
            UserManager.getInstance().clearToken(userId);
            UserManager.getInstance().clearToken(userIdNgrok);
            sinon.restore();

            process.env.NODE_ENV = savedEnv;
        });

        it('development mode', async () => {
            process.env.NODE_ENV = 'development';
            keepCoreStub.getJWTToken.resolves(authResults);

            // With regular user
            let token = await UserManager.getInstance().getUserAccessToken({ userId: userId, password: 'password' });
            expect(keepCoreStub.getJWTToken.calledWith(userId, sinon.match.string)).to.be.true();
            expect(token).to.be.equal('test-token');

            // With ngrok user
            token = await UserManager.getInstance().getUserAccessToken({ userId: userIdNgrok, password: 'password' });
            expect(keepCoreStub.getJWTToken.calledWith('Test User', sinon.match.string)).to.be.true(); // With ngrok user, should authenticate with Domino Name
            expect(token).to.be.equal('test-token');
        });

        it('no userid domain with dot', async () => {
            process.env.NODE_ENV = 'development';
            keepCoreStub.getJWTToken.resolves(authResults);
            let testUserId = "test.id";

            // With regular user
            let token = await UserManager.getInstance().getUserAccessToken({ userId: testUserId, password: 'password' });
            expect(keepCoreStub.getJWTToken.calledWith("Test Id", sinon.match.string)).to.be.true();
            expect(token).to.be.equal('test-token');

            // With no dot
            testUserId = "testid";
            token = await UserManager.getInstance().getUserAccessToken({ userId: testUserId, password: 'password' });
            expect(keepCoreStub.getJWTToken.calledWith(testUserId, sinon.match.string)).to.be.true();
            expect(token).to.be.equal('test-token');
        });

        it('ngrok with non-development mode', async () => {
            process.env.NODE_ENV = 'production';
            const err: any = new Error('Unit test failure');
            err.status = 401;
            keepCoreStub.getJWTToken.rejects(err); // ngrok userid would be rejected by Keep

            await expect(UserManager.getInstance().getUserAccessToken({ userId: userIdNgrok, password: 'password' })).to.be.rejectedWith({ status: 401, message: 'Authorization failure' });
            expect(keepCoreStub.getJWTToken.calledWith(userIdNgrok, sinon.match.string)).to.be.true(); // With ngrok user, will not use domino name

        });

        it('regular user with non-development mode', async () => {
            process.env.NODE_ENV = undefined;
            keepCoreStub.getJWTToken.resolves(authResults);

            // With regular user
            const token = await UserManager.getInstance().getUserAccessToken({ userId: userId, password: 'password' });
            expect(keepCoreStub.getJWTToken.calledWith(userId, sinon.match.string)).to.be.true();
            expect(token).to.be.equal('test-token');

        });

        it('getUserSubject', async () => {
            keepCoreStub.getJWTToken.resolves(authResults);
            
            await UserManager.getInstance().getUserAccessToken({ userId: userId, password: 'password' });
            const subject = UserManager.getInstance().getUserSubject({ userId: userId, password: 'password' });
            expect(subject).to.be.equal(authResults.claims.sub);
        });

        it('getUserSubject is undefined', async () => {
            keepCoreStub.getJWTToken.resolves(authResults);
            
            const subject = UserManager.getInstance().getUserSubject({ userId: userId, password: 'password' });
            expect(subject).to.be.undefined();
        });

        it('getUserAccessToken check for token in registry', async() => {
            keepCoreStub.getJWTToken.resolves(authResults);

            // With regular user
            await UserManager.getInstance().getUserAccessToken({ userId: userId, password: 'password' });
            const token = await UserManager.getInstance().getUserAccessToken({ userId: userId, password: 'password' });
            expect(token).to.be.equal(authResults.bearer);
        });

        it('getUserAccessToken check for token is expired and deleting', async() => {
            const date = new Date();
            const milliseconds = date.getTime();
            const issueDate = new Date(milliseconds - (3600*1000));
            authResults.issueDate = issueDate.toISOString();
            keepCoreStub.getJWTToken.resolves(authResults);

            // With regular user
            await UserManager.getInstance().getUserAccessToken({ userId: userId, password: 'password' });
            await UserManager.getInstance().getUserAccessToken({ userId: userId, password: 'password' });
            expect(keepCoreStub.getJWTToken.callCount).to.be.equal(2);
            
        });
        
        it('password not provided', async() => {
            const err: any = new Error('Authorization failure');
            err.status = 401;
            keepCoreStub.getJWTToken.rejects(err);
            await expect (UserManager.getInstance().getUserAccessToken({ userId: userId, password: undefined })).to.be.rejectedWith(err);
        });
    });
});
