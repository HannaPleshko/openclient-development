import { fromString } from 'html-to-text';

/**
 * How to reply to external senders
 */
export enum OOOExternalAudience {
    /**
     * Do not replay to external senders
     */
    NONE,
    /**
     * Only reply to external senders in your contacts
     */
    KNOWN,
    /**
     * Reply to all external senders
     */
    ALL
}

/**
 * Out of office State.
 */
export enum OOOState {
    /**
     * Out of office is disabled
     */
    DISABLED,
    /**
     * Out  of office is enable with not scheduled start/end time.
     */
    ENABLED,
    /**
     * Out of office is enabled with a schedule start/end time. 
     */
    SCHEDULED
}

/**
 * Contains the OOO settings.
 */
export class PimOOO {
    private props: any = {};

    constructor(oooObject: any) {
        return this.entryFromDocument(oooObject);
    }

    static fromJson(jsonString: string): PimOOO {
        return new PimOOO(JSON.parse(jsonString));
    }

    /**
     * Get the settings on how to respond to external senders. 
     */
    get externalAudience(): OOOExternalAudience {
        return this.props.externalAudience ?? OOOExternalAudience.NONE;
    }

    /**
    * Set the externalAudience for the item.
    */
     set externalAudience(externalAudience: OOOExternalAudience) {      
        this.props.externalAudience= externalAudience; 
    }

    /**
     * Get the state of out-of-office settings. 
     */
    get state(): OOOState {
        return this.props.state ?? OOOState.DISABLED;
    }

    /**
    * Set the state for the item.
    */
     set state(state: OOOState) {      
        this.props.state = state; 
    }

    /**
     * Get the start date for sending out-of-office replies if enabled. 
     */
    get startDate(): Date | undefined {
        return this.props.startDate;
    }

    /**
    * Set the startDate for the item.
    */
    set startDate(date: Date | undefined) {      
        this.props.startDate = date; 
    }

    /**
     * Get the end date for sending out-of-office replies if enabled. 
     */
    get endDate(): Date | undefined {
        return this.props.endDate;
    }

    /**
    * Set the endDate for the item.
    */
     set endDate(date: Date | undefined) {      
        this.props.endDate = date; 
    }

    /**
     * The reply message to send. 
     */
    get replyMessage(): string {
        return this.props.replyMessage ?? "";
    }

    /**
    * Set the replyMessage for the item.
    */
     set replyMessage(msg: string) {      
        this.props.replyMessage = msg; 
    }

    /**
     * Returns a structure that can be used to the OOO settings on the Keep API. 
     * @returns An object to use when updating OOO settings on the Keep API. 
     */
    public toPimStructure(): object {

        const rtn: any = { "SystemType": null };

        rtn.Enabled = (this.state !== OOOState.DISABLED);
        rtn.SystemState = rtn.Enabled;

        if (this.startDate) {
            rtn.StartDateTime = this.startDate.toISOString();
        }

        if (this.endDate) {
            rtn.EndDateTime = this.endDate.toISOString();
        }

        rtn.ExcludeInternet = (this.externalAudience !== OOOExternalAudience.ALL);

        rtn.GeneralMessage = this.replyMessage;
        rtn.GeneralSubject = this.getSubjectFromMessage(rtn.GeneralMessage);

        return rtn;
    }

    /**
     * Parse the Keep Out-of-office response.
     * @param oooObject The response body to the Keep GET /ooo request. The object is in this format:
     *   {
     *        "StartDateTime": "2020-07-17T18:23:50Z",
     *        "EndDateTime": "2020-07-18T18:23:50Z",
     *        "ExcludeInternet": false,
     *        "Enabled": false,
     *        "SystemType": "AGENT",
     *        "SystemState": false,
     *        "GeneralSubject": "Davek Mail is out of the office",
     *        "GeneralMessage": ""
     *    }
     *   The following may be set for updates coming from EWS. If one of these is set, GeneralMessage is ignored:
     *      InternalReply, ExternalReply
     */
    private entryFromDocument(oooObject: any): PimOOO {

        if (oooObject.Enabled) {
            if (oooObject.StartDateTime && oooObject.EndDateTime) {
                this.props.state = OOOState.SCHEDULED;
            }
            else {
                this.props.state = OOOState.ENABLED;
            }
        }
        else {
            this.props.state = OOOState.DISABLED;
        }

        if (oooObject.ExcludeInternet) {
            this.props.externalAudience = OOOExternalAudience.NONE;
        }
        else {
            this.props.externalAudience = OOOExternalAudience.ALL; // TODO: Is there a setting for known?
        }

        if (oooObject.StartDateTime) {
            const valid = Date.parse(oooObject.StartDateTime);
            if (isNaN(valid)) {
                this.props.startDate = new Date(); // Date in OOO object is not valid, just use the current date
            } else {
                this.props.startDate =  new Date(oooObject.StartDateTime);
            }
        }

        if (oooObject.EndDateTime) {
            const valid = Date.parse(oooObject.EndDateTime);
            if (isNaN(valid)) {
                const tomorrow = this.props.startDate ?? new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                this.props.endDate = tomorrow; // Date in OOO object is not valid, just use tomorrow's date
            } else {
                this.props.endDate =  new Date(oooObject.EndDateTime);
            }
        }

        let reply = "";
        if (oooObject.InternalReply) {
            reply = fromString(oooObject.InternalReply);
        }
        // If audience is not restricted use external reply
        if (this.externalAudience === OOOExternalAudience.ALL && oooObject.ExternalReply) {
            const externalReply = fromString(oooObject.ExternalReply);
            if (externalReply.length > 0) {
                reply = externalReply;
            }
        }

        if (reply.length === 0 && oooObject.GeneralMessage) {
            reply = fromString(oooObject.GeneralMessage);
        }

        const subject: string | undefined = oooObject.GeneralSubject;
        if (subject && reply.indexOf(subject) === -1) {
            // Since EWS does not have a subject setting, just add the subject to the reply text.
            reply = subject + ".\n" + reply;
        }

        this.props.replyMessage = reply;

        return this;
    }

    /**
     * Since EWS does not have a subject, get the subject from the OOO message text. 
     * @param message The OOO message.
     * @returns The subject to use when saving to Keep. 
     */
    private getSubjectFromMessage(message: string): string {

        const lines = message.match(/[^\.!\?]+[\.!\?]+/g); // Get array of sentences
        if (lines === null || lines.length === 1) { // Not multiple sentences
            return ""; // No subject
        }
        else {
            return lines[0]; // Use first sentence of message for subject
        }
    }
}