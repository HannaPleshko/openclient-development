import { expect, sinon } from '@loopback/testlab';
import { KeepTransportManager } from '../../keep/KeepTransportManager';
import { MockKeepPim } from '../MockKeepPim';
import { MockKeepCore } from '../test-helper';
import { OpenClientKeepComponent } from '../../internal';

describe('KeepTransportManager tests', () => {

    afterEach(() => {
        sinon.restore();
    });
    
    it('getKeepPimTransport ', async function () {

        const keepPimStub = sinon.stub(new MockKeepPim());

        sinon.stub(OpenClientKeepComponent, 'getKeepPimProvider').callsFake(() => {
            return Promise.resolve(keepPimStub);
        });

        const results = await KeepTransportManager.getInstance().getKeepPimTransport();
        expect(results).to.be.equal(keepPimStub);
    });

    it('getKeepCoreTransport ', async function () {

        const keepCoreStub = sinon.stub(new MockKeepCore());

        sinon.stub(OpenClientKeepComponent, 'getKeepCoreProvider').callsFake(() => {
            return Promise.resolve(keepCoreStub);
        });

        const results = await KeepTransportManager.getInstance().getKeepCoreTransport();
        expect(results).to.be.equal(keepCoreStub);
    });
});