import { expect, sinon } from '@loopback/testlab';
import { KeepPimBaseResults } from '../../../internal';
import { KeepPimSubscriptionManager } from '../../../keep/pim/KeepPimSubscriptionManager';
import { PimEventType, PimSubscription, PimSubscriptionType } from '../../../keep/pim/PimSubscription';
import { KeepPim } from '../../../services';
import { setupTransportManagerStub, setupUserManagerStub } from '../../test-helper';


describe('KeepPimSubscriptionManager tests', function(){

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

    it('getSubscription success', async function() {
        const uuid = "123";
        const expectedSubscription: any = {
                "id": uuid,
                "eventTypes": [PimEventType.CREATE, PimEventType.DELETE, PimEventType.UPDATE],
                "expiry": 60,        
                "folders": ["ade1343"],
                "type": PimSubscriptionType.PULL
        };

        keepPimStub.getSubscription.resolves(expectedSubscription);
        const results = await (KeepPimSubscriptionManager.getInstance().getSubscription(uuid,userInfo));
        expect(results).to.be.eql(expectedSubscription);
    })

    it("getSubscription failed", async function() {
        const uuid = "123";
        const error = new Error("getSubscription Failed");

        keepPimStub.getSubscription.rejects(error);
        await expect(KeepPimSubscriptionManager.getInstance().getSubscription(uuid,userInfo)).to.be.rejectedWith(error);
    });

    it('deleteSubscription success', async function() {
        const uuid = "123";
        const results = {} as KeepPimBaseResults;
        results.status = 200;
        results.message = "Subscription has been removed";

        keepPimStub.deleteSubscription.resolves(results);
        const delResults = await KeepPimSubscriptionManager.getInstance().deleteSubscription(uuid,userInfo);
        expect(delResults).to.be.eql(results);
    })

    it("deleteSubscription failed", async function() {
        const uuid = "123";
        const error = new Error("deleteSubscription Failed");

        keepPimStub.deleteSubscription.rejects(error);
        await expect(KeepPimSubscriptionManager.getInstance().deleteSubscription(uuid,userInfo)).to.be.rejectedWith(error);
    });

    it('createSubscription success', async function() {
        const uuid = "123";
        const expectedSubscription: any = {
                "id": uuid,
                "eventTypes": [PimEventType.CREATE, PimEventType.DELETE, PimEventType.UPDATE],
                "expiry": 60,        
                "folders": ["ade1343"],
                "type": PimSubscriptionType.PULL
        };

        keepPimStub.createSubscription.resolves(expectedSubscription);
        const results = await KeepPimSubscriptionManager.getInstance().createSubscription(userInfo, expectedSubscription);
        expect(results).to.be.eql(uuid);
    })

    it("createSubscription failed", async function() {
        const error = new Error("createSubscription Failed");
        const pSubscription = new PimSubscription();

        keepPimStub.createSubscription.rejects(error);
        await expect(KeepPimSubscriptionManager.getInstance().createSubscription(userInfo, pSubscription)).to.be.rejectedWith(error);
    });

});