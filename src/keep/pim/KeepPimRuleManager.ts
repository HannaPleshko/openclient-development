import { KeepPim } from '../../services/keep-pim.service';
import { UserManager, UserInfo } from '../core';
import { KeepTransportManager } from '../KeepTransportManager';
import { PimRule } from './PimRule';


export class KeepPimRuleManager {
    private static instance: KeepPimRuleManager;
  
    public static getInstance(): KeepPimRuleManager {
      if (!KeepPimRuleManager.instance) {
        this.instance = new KeepPimRuleManager();
      }
      return this.instance;
    }
  
    /**
     * Get the list of rules .
     * @param userInfo The information used to authenticate the user.
     * @returns An array of rule objects.
     * @throws An error if an error occurs retrieving the list of rules from Keep. 
     */
    async getRules(userInfo: UserInfo): Promise<PimRule[]> {
      const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
      if (!uToken) {
        throw new Error("User is unauthenticated");
      }
  
      const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
      return this.getPimRules(await keepPimProvider.getRules(uToken));
  }
  
    /**
     * Returns a rule.
     * @param userInfo The information used to authenticate the user.
     * @param ruleId The unique id of the rule to return. 
     * @returns A rule or undefined if the rule was not found. 
     */
    async getRule(userInfo: UserInfo, ruleId: string): Promise<PimRule | undefined> {
      const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
      if (!uToken) {
        throw new Error("User is unauthenticated");
      }
  
      const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
      return keepPimProvider.getRule(uToken, ruleId);
    }

    async deleteRule(userInfo: UserInfo, ruleId: string): Promise<any> {
      const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
      if (!uToken) {
        throw new Error("User is unauthenticated");
      }
  
      const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
      return keepPimProvider.deleteRule(uToken, ruleId);
    }
  
    async createRule(userInfo: UserInfo, ruleStructure: any): Promise<PimRule> {
      const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
      if (!uToken) {
        throw new Error("User is unauthenticated");
      }
  
      const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
      const rules = await keepPimProvider.createRule(uToken, ruleStructure);
      let returnObj: any = {};
      if (rules) {
        if (Array.isArray(rules)) {
          if (rules.length > 0) {
            returnObj = rules[0];
          }
        } else {
          returnObj = rules;
        }
      }
      // End Keep < 0.8.9 workaround
  
      return new PimRule(returnObj);
    }

   async updateRule(userInfo: UserInfo, ruleId: string, updateStructure: any, mailboxId?: string): Promise<object[]> {
    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }
   
    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

    return keepPimProvider.updateRule(uToken, escape(ruleId), updateStructure, mailboxId);
 }

 getPimRules(objArray: object[]): PimRule[] {
      const pimRules: PimRule[] = [];
      if (Array.isArray(objArray)) { // Workaround random Bug in Keep 0.8.9
        for (const obj of objArray) {
          pimRules.push(new PimRule(obj));
        }
      } else {
        throw new Error("To return pimRules we are expecting an array of rule objects");
      }
      return pimRules;
    }
  
    getPimRulesFromJson(jsonString: string): PimRule[] {
      const pimRules: PimRule[] = [];
      const jsonObj = JSON.parse(jsonString);
      if (Array.isArray(jsonObj)) {
        for (const obj of jsonObj) {
          pimRules.push(new PimRule(obj));
        }
      } else {
        pimRules.push(new PimRule(jsonObj));
      }
  
      return pimRules;
    }
  
  }
  