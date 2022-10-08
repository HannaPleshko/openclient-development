import { expect, sinon } from '@loopback/testlab';
import { KeepPimBaseResults, KeepPimRuleManager } from '../../../keep';
import { KeepPim } from '../../../services';
import { createObjectFromFile, setupTransportManagerStub, setupUserManagerEmptyTokenStub, setupUserManagerStub } from '../../test-helper';

describe("KeepPimRuleManager tests", function (){
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

    it('getRules success', async function() {

        const pimObject = createObjectFromFile("rule.list.document.json");
        keepPimStub.getRules.resolves(pimObject);

        const result = await KeepPimRuleManager.getInstance().getRules(userInfo);
        expect(result.length).to.be.equal(pimObject.length); 

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try{
            await KeepPimRuleManager.getInstance().getRules(userInfo);
        }
        catch(error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('getPimRules', function(){

        const pimObject: any = createObjectFromFile("rule.list.document.json");

        const expectedResults: any = [];
        expectedResults.push(pimObject[0]);

        const result = KeepPimRuleManager.getInstance().getPimRules(expectedResults);
        expect(result).to.be.an.Array();
        expect(result.length).to.be.equal(expectedResults.length); 
    })

    it('getRules Failed',async function() {
        const error = new Error("getRules fails");
        keepPimStub.getRules.rejects(error);

        await expect(KeepPimRuleManager.getInstance().getRules(userInfo)).to.be.rejectedWith(error);
    })

    it('getRule success', async function() {
        const ruleId = "DABA975B9FB113EB852564B5001283EA";

        const pimObject = createObjectFromFile("rule.json");
        keepPimStub.getRule.resolves(pimObject);

        const results: any = await KeepPimRuleManager.getInstance().getRule(userInfo, ruleId);
        expect(results["@unid"]).to.be.equal(pimObject["@unid"]);

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try{
            await KeepPimRuleManager.getInstance().getRule(userInfo,ruleId);
        }
        catch(error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('getRule Failed',async function() {
        const error = new Error("getRule fails");
        keepPimStub.getRule.rejects(error);

        await expect(KeepPimRuleManager.getInstance().getRule(userInfo,"testid")).to.be.rejectedWith(error);
    })

    it('deleteRule success', async function() {
        const expectedResults: KeepPimBaseResults = {
            statusText: "OK",
            status: 200,
            message: `Documet deleted`
        };
        keepPimStub.deleteRule.resolves(expectedResults);

        const results = await KeepPimRuleManager.getInstance().deleteRule(userInfo, "testid");
        expect(results.status).to.be.equal(200);

        sinon.restore();
        keepPimStub = setupTransportManagerStub();
    
        setupUserManagerEmptyTokenStub();
    
        let errMessage: string | undefined;
        try{
            await KeepPimRuleManager.getInstance().deleteRule(userInfo,"testid");
        }
        catch(error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('deleteRule Failed',async function() {
        const error = new Error("deleteRule fails");
        keepPimStub.deleteRule.rejects(error);

        await expect(KeepPimRuleManager.getInstance().deleteRule(userInfo,"testid")).to.be.rejectedWith(error);
    })

    it('createRule success', async function() {

        const pimObject = createObjectFromFile("rule.json");
        const response = {
            "statusText": "OK",
            "status": 200,
            "message": "creation complete",
            "unid": "8CE7525EDE588D7F002586EF004389D0"
        };

        keepPimStub.createRule.resolves(response);

        const result = await KeepPimRuleManager.getInstance().createRule(userInfo,pimObject);
        expect(result.unid).to.be.equal(pimObject.unid);

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try{
            await KeepPimRuleManager.getInstance().createRule(userInfo,pimObject);
        }
        catch(error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('createRule Failed',async function() {
        const error = new Error("createRule fails");
        keepPimStub.createRule.rejects(error);

        await expect(KeepPimRuleManager.getInstance().createRule(userInfo,"testid")).to.be.rejectedWith(error);
    });

    it('updateRule success', async function() {

        const pimObject = createObjectFromFile("rule.json");
        keepPimStub.updateRule.resolves(pimObject);

        const result: any = await KeepPimRuleManager.getInstance().updateRule(userInfo,"1234",pimObject);
        expect(result["@unid"]).to.be.equal(pimObject["@unid"])

        sinon.restore();
        keepPimStub = setupTransportManagerStub();

        setupUserManagerEmptyTokenStub();

        let errMessage: string | undefined;
        try{
            await KeepPimRuleManager.getInstance().updateRule(userInfo,"1234",pimObject);
        }
        catch(error) {
            const err: any = error; 
            errMessage = err.message;
        }
        expect(errMessage).to.be.equal('User is unauthenticated');
    });

    it('updateRule Failed',async function() {
        const error = new Error("updateRule fails");
        keepPimStub.updateRule.rejects(error);

        await expect(KeepPimRuleManager.getInstance().updateRule(userInfo,"123","test")).to.be.rejectedWith(error);
    })

    it('getPimRulesFromJson',async function() {

        const pimObject = createObjectFromFile("rule.list.document.json");
        const result = KeepPimRuleManager.getInstance().getPimRulesFromJson(JSON.stringify(pimObject));
        expect(result.length).to.be.equal(pimObject.length);

        const pimObject2 = createObjectFromFile("rule.json");
        const result2 = KeepPimRuleManager.getInstance().getPimRulesFromJson(JSON.stringify(pimObject2));
        expect(result2.length).to.be.equal(1);
    })

})