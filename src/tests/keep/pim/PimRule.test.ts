import { expect } from '@loopback/testlab';
import { PimRule  } from '../../../keep';

describe('PimRule Test', () => {

    describe('Test for setter/getter', () => {
        it('Sensitivity', () => {
            const pimObject: any = {
                "sensitivity" : "Normal"
            }

            const pimRule = new PimRule(pimObject);
            expect(pimRule.sensitivity).to.be.equal('Normal')

            pimRule.sensitivity = "updated-sensitivity";
            expect(pimRule.sensitivity).to.be.equal("updated-sensitivity");
        });

        it('unid', () => {
            const pimObject: any = {
                "@unid":'unid'
            }

            let pimRule = new PimRule(pimObject);
            expect(pimRule.unid).to.be.equal('unid');

            pimRule.unid = 'unid-updated';
            expect(pimRule.unid).to.be.equal('unid-updated');

            pimObject['@unid'] = "";
            pimRule = new PimRule(pimObject);
            expect(pimRule.unid).to.be.equal("")

        });

        it('ruleIndex', () => {
            const pimObject: any = {
                "@index": 1
            }
            let pimRule = new PimRule(pimObject);
            expect(pimRule.ruleIndex).to.be.equal(1);

            pimRule.ruleIndex = 2;
            expect(pimRule.ruleIndex).to.be.equal(2);

            pimObject['@index'] = "";
            pimRule = new PimRule(pimObject);
            expect(pimRule.ruleIndex).to.be.equal("")

        });

        it('ruleEnabled', () => {
            const pimObject: any = {
                "$108": false
            }
            const pimRule = new PimRule(pimObject);
            expect(pimRule.ruleEnabled).to.be.equal(false);

            pimRule.ruleEnabled = true;
            expect(pimRule.ruleIndex).to.be.undefined();
        });

        it('rawRuleCondition', () => {
            const pimObject: any = {
                "$112":'rule-condition'
            }

            let pimRule = new PimRule(pimObject);
            expect(pimRule.rawRuleCondition).to.be.equal('rule-condition');

            pimRule.rawRuleCondition = 'updated-rule-condition';
            expect(pimRule.rawRuleCondition).to.be.equal('updated-rule-condition');

            pimObject['$112'] = "";
            pimRule = new PimRule(pimObject);
            expect(pimRule.rawRuleCondition).to.be.equal("")

        });

        it('rawRuleAction', () => {
            const pimObject: any = {
                "$111":'raw-rule-action'
            }

            let pimRule = new PimRule(pimObject);
            expect(pimRule.rawRuleAction).to.be.equal('raw-rule-action');

            pimRule.rawRuleAction = 'updated-rule-action';
            expect(pimRule.rawRuleAction).to.be.equal('updated-rule-action');

            pimObject['$111'] = "";
            pimRule = new PimRule(pimObject);
            expect(pimRule.rawRuleAction).to.be.equal("")

        });

        it('displayName', () => {
            const pimObject: any = {
                "displayName":'name-display'
            }

            let pimRule = new PimRule(pimObject);
            expect(pimRule.displayName).to.be.equal('name-display');

            pimRule.displayName = 'updated-name-display';
            expect(pimRule.displayName).to.be.equal('updated-name-display');

            pimObject['displayName'] = "";
            pimRule = new PimRule(pimObject);
            expect(pimRule.displayName).to.be.equal("")

        });
    });
});