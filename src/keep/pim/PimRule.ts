/**
 * Represents a rule returned from the Keep-PIM rules API. 
 */
export class PimRule {

  public static DefaultSensitivity = "Normal";

  protected props: any = {};

  /**
   * Create a Pim rule from Keep API data.  
   * @param pimObject The object returned from the Keep API.
   */
  constructor(pimObject: any) {
      return this.itemFromDocument(pimObject);
  }

  static fromJson(jsonString: string): PimRule {
    return new PimRule(JSON.parse(jsonString));
  }

  protected itemFromDocument(ruleObject: any): PimRule {
    // Example Rule
    // ===============
    // [{"@unid":"31C8AC83E7265239002585E800079462",
    // "@noteid":2862,
    // "@index":"1",
    // "$108":"Rule_On.gif",
    // "$110":"1.0",
    // "$114":"Infinity",
    // "$112":"[WHEN Sender contains davek.valentino, OR Subject contains test send1]",
    // "$111":"THEN  move to folder Foo",
    // "$113":""}]
    this.props.unid = ruleObject['@unid'];
    this.props.ruleIndex = ruleObject['@index'];
    this.props.ruleEnabled = ruleObject['$108'] === "Rule_On.gif";
    this.props.rawRuleCondition = ruleObject['$112'];
    this.props.rawRuleAction = ruleObject['$111'];
    this.props.displayName = ruleObject['displayName'];
    return this;
  }

  get sensitivity(): string {
    return this.props.sensitivity ?? PimRule.DefaultSensitivity;
  }

  set sensitivity(sensitivity: string) {
    this.props.sensitivity = sensitivity;
  }

  get unid(): string {
    return this.props.unid;
  }

  set unid(unid: string){
    this.props.unid = unid;
  }

  get ruleIndex(): number {
    return this.props.ruleIndex;
  }

  set ruleIndex(ruleIndex: number){
     this.props.ruleIndex = ruleIndex;
  }

  get ruleEnabled(): boolean {
    return this.props.ruleEnabled;
  }

  set ruleEnabled(ruleEnabled: boolean){
    this.props.ruleEnabled = ruleEnabled;
  }

  get rawRuleCondition(): string {
    return this.props.rawRuleCondition;
  }

  set rawRuleCondition(rawRuleCondition: string){
    this.props.rawRuleCondition = rawRuleCondition;
  }

  get rawRuleAction(): string {
    return this.props.rawRuleAction;
  }

  set rawRuleAction(rawRuleAction: string){
    this.props.rawRuleAction = rawRuleAction;
  }

  get displayName(): string | undefined {
    return this.props.displayName;
  }

  set displayName(displayName: string | undefined){
    this.props.displayName = displayName;
  }
}