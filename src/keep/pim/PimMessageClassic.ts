
import { KeepPimConstants, PimImportance, PimDeliveryPriority, PimItemFormat, PimNoticeTypes, PimDeliveryReportType } from "./KeepPimConstants";
import { PimItemClassic } from './PimItemClassic';
import { parseValue, Logger, base64Encode } from "../../utils";
import { PimMessage } from "./PimItemInterfaces";
import { DateTime } from 'luxon';
import util from 'util';
import ical, { ICalCalendarMethod, ICalAttendeeRole, ICalCategoryData, ICalOrganizer } from 'ical-generator';
  
/**
 * Represents a message returned from the Keep-PIM messages API. 
 * 
 */
export class PimMessageClassic extends PimItemClassic implements PimMessage {

    /**
     * Return true if this object implements the PimMessage interface
     * @return True if the item implements the PimMessage protocol
     */
     isPimMessage(): this is PimMessage {
      return true;
  }

  /**
     * Return an array of the email addresses or undefined
     * @param parseField The field to parse for email addresses.  It may be undefined, string or array of strings
     */
    private getEmailAddresses(parseField: undefined | string | string[]): string[] | undefined {
      let emailAddresses;                                            
      if (parseField) {
        if (typeof(parseField) === 'string' && parseField.length > 0) {
          emailAddresses = [];
          emailAddresses.push(parseField);
        } else if (Array.isArray(parseField)) {
          emailAddresses = parseField;
        }                                
      }   
      return emailAddresses;                                         
    }

    /**
     * Return an array of the attachmentinfo or undefined
     * @param parseField The field to parse for attachmentinfo.  It may be undefined, string or array of strings
     */
    private getAttachmentInfo(parseField: undefined | string | string[]): string[] | undefined {
      let attachmentInfo;                                            
      if (parseField) {
        if (typeof(parseField) === 'string' && parseField.length > 0) {
          attachmentInfo = [];
          if (parseField.length > 0){
            attachmentInfo.push(parseField);
          }
        } else if (Array.isArray(parseField)) {
          attachmentInfo = parseField.filter(info => info.length > 0);
        }                                
      }   
      return attachmentInfo && attachmentInfo.length > 0 ? attachmentInfo : undefined;                                         
    }

    /**
     * 	
     *  {
     *    "RR2": "",
     *    "DeliveryReport": "",
     *    "$KeepPrivate": "",
     *    "Classification": "",
     *    "ConfidentialString": "",
     *    "DocExExpireDate": "",
     *    "ExpandPersonalGroups": "1",
     *    "$MessageID": "",
     *    "In_Reply_To": "",
     *    "References": "",
     *    "AltFrom": "CN=David Kennedy/OU=USA/O=PNPHCL",
     *    "$LangFrom": "",
     *    "AltSendTo": "",
     *    "AltCopyTo": "",
     *    "AltBlindCopyTo": "",
     *    "$NameLanguageTags": "",
     *    "$altPrincipal": "",
     *    "$langPrincipal": "",
     *    "s_PlainEditor": "",
     *    "h_ActionRichTextItem": "",
     *    "h_AttachmentTimes": "",
     *    "h_CurrentPosition": "",
     *    "h_LinkURL": "",
     *    "h_LinkTitle": "",
     *    "h_ImageURL": "",
     *    "RemoveAtClose": "",
     *    "tmpDraftParams": "",
     *    "$Disclaimed": "",
     *    "MIME_Version": "1.0",
     *    "Form": "Memo",
     *    "SendTo": [
     *      "lucasc@vmware.com",
     *      "CN=Timothy Giambra/OU=USA/O=PNPHCL@PNPHCL"
     *    ],
     *    "CopyTo": "",
     *    "BlindCopyTo": "",
     *    "Body": "",
     *    "Subject": "HCL Connections and AirWatch SDK configuration - case: 1572033",
     *    "ReturnReceipt": "0",
     *    "Sign": "1",
     *    "Encrypt": "0",
     *    "Principal": "David Kennedy/USA/PNPHCL",
     *    "From": "CN=David Kennedy/OU=USA/O=PNPHCL",
     *    "SaveOptions": "1",
     *    "Importance": "2",
     *    "DeliveryPriority": "N",
     *    "h_ImageCount": 0,
     *    "h_NewImageCount": 0,
     *    "$Abstract": "Hi Lucas,   I opened case 1572033 for the issue described below, however I had to login with my dave",
     *    "$V2AttachmentOptions": "0",
     *    "$UpdatedBy": [
     *      "CN=David Kennedy/OU=USA/O=PNPHCL"
     *    ],
     *    "$Revisions": "2019-08-06T15:25:25.340-04:00",
     *    "$TUA": "25D1BCF45DF7B4C30025844E0069F22C",
     *    "$RespondedTo": "2"
     *  },
     * @param messageObject 
     */
    itemFromDocument(messageObject: any): PimMessageClassic {
      super.itemFromDocument(messageObject);

      if (messageObject["@threadid"]) {
        this.props.threadId = parseValue("@threadid", messageObject);
      }

      const tua = messageObject["$TUA"];
      if ((!this.props.unid || !this.props.threadId) && tua) {
        let tId: string | undefined = undefined;
        if (Array.isArray(tua)) {
          if (tua.length > 0) {
            tId = tua[0];
          }
        } else if (typeof tua === 'string') {
          tId = tua;
        }
        if (!this.props.unid) {
          this.props.unid = tId;
        }
        if (!this.props.threadId) {
          this.props.threadId = tId;
        }
      }

      if (tua) {
        let convIndex = 0;        
        if (Array.isArray(tua)) {
          if (tua.length > 0) {
            convIndex = tua.indexOf(this.unid);
            convIndex = convIndex >=0 ? convIndex : convIndex = tua.length - 1;
          }
        }
        this.props.conversationIndex = "" + convIndex;
      }

      this.props.receivedDate = this.props.createdDate;  
      
      if(messageObject["PostedDate"]) {
        try {
          this.props.sentDate = new Date(messageObject["PostedDate"]);
        }catch (err) {
          Logger.getInstance().debug(`Invalid message sent date, ${messageObject["PostedDate"]}. Cannot be converted to Date.`);
        }
      }

      this.props.to = this.getEmailAddresses(messageObject["SendTo"]);    //"SendTo": [
                                                  //   "lucasc@vmware.com",
                                                  //   "CN=Timothy Giambra/OU=USA/O=PNPHCL@PNPHCL"
                                                  // ]
      this.props.cc = this.getEmailAddresses(messageObject["CopyTo"]);  //"CopyTo": "",
      this.props.bcc = this.getEmailAddresses(messageObject["BlindCopyTo"]);    //"BlindCopyTo": "",
      this.props.replyTo = this.getEmailAddresses(messageObject["ReplyTo"]);    //"ReplyTo": "",
      this.inReplyTo = parseValue("In_Reply_To", messageObject);
      this.references = parseValue("References", messageObject);

      if (messageObject["Body"]) {
        this.props.body = messageObject["Body"];    //"Body": "",
      }
      if (messageObject["BodyType"]) {
        this.props.bodyType = messageObject["BodyType"];    //"Body": "",
      }

      if (messageObject["DeliveryReport"]) {
        //"DeliveryReport": "N<none>", "T<entire trace>", "C<confirm delivery>", "B<only on fail>"
        // We're only tracking confirm delivery
        this.props.deliveryReceipt = messageObject["DeliveryReport"] === PimDeliveryReportType.CONFIRM;    
      }

      if (messageObject["ReturnReceipt"]) {
        this.props.returnReceipt = messageObject["ReturnReceipt"] === "1";    //"ReturnReceipt": "1",
      }

      if (messageObject["@size"]) {
        this.props.size = messageObject["@size"];    //"Size": "",
      }

      if (messageObject["$MessageID"]) {
        this.messageId = messageObject["$MessageID"];
      }

      if (messageObject["$ICAL_ORIG_STREAM"]) {
        this.props.icalStream = messageObject["$ICAL_ORIG_STREAM"];
      }
      if (messageObject["$ICAL_ORIG_MSG_ID"]) {
        this.props.icalMessageId = messageObject["$ICAL_ORIG_MSG_ID"];
      }

      this.props.subject = messageObject["Subject"];    //"Subject": "HCL Connections and AirWatch SDK configuration - case: 1572033",
      this.props.from = messageObject["From"];    //"From": "CN=David Kennedy/OU=USA/O=PNPHCL",
      this.props.abstract = messageObject["$Abstract"];    //"$Abstract": "Hi Lucas,   I opened case 1572033 for the issue described below, however I had to login with my dave",
   
      const dPriority = parseValue("DeliveryPriority", messageObject);
      if (dPriority) {
        switch (dPriority) {
          case "H":
            this.props.deliveryPriority = PimDeliveryPriority.HIGH;
            break;
          case "L":
            this.props.deliveryPriority = PimDeliveryPriority.LOW;
            break;
          case "N":
            this.props.deliveryPriority = PimDeliveryPriority.NORMAL;
            break;
        }
      }

      const imp = parseValue("Importance", messageObject);
      if (imp) {
        switch (imp) {
          case "1":
            this.props.importance = PimImportance.HIGH;
            break;
          case "2":
            this.props.importance = PimImportance.MEDIUM;
            break;
          case "3":
            this.props.importance = PimImportance.LOW;
            break;
          default:
            this.props.importance = PimImportance.NONE;
            break;
        }
      }

      this.props.attachments = this.getAttachmentInfo(parseValue("$FILES", messageObject));

      if (messageObject["NoticeType"]) {
        this.props.noticeType = messageObject["NoticeType"];
      }

      if (messageObject["StartDateTime"]) {
          this.props.startDateTime = messageObject["StartDateTime"];
      } else if (messageObject["STARTDATETIME"]) {
        // https://jira01.hclpnp.com/browse/LABS-2534
        this.props.startDateTime = messageObject["STARTDATETIME"];
      }

      if (messageObject["EndDateTime"]) {
        this.props.endDateTime = messageObject["EndDateTime"];
      }

      if (messageObject["StartTimeZone"]) {
        this.props.startTimeZone = messageObject["StartTimeZone"];
      }

      if (messageObject["EndTimeZone"]) {
        this.props.endTimeZone = messageObject["EndTimeZone"];
      }

      if (messageObject["NewStartDate"]) {
        try {
          this.props.newStartDate = new Date(messageObject["NewStartDate"]);
        } catch (err) {
          Logger.getInstance().debug(`Invalid message new start date, ${messageObject["NewStartDate"]}.  Cannot be converted to Date.`);
        }
      }

      if (messageObject["NewEndDate"]) {
        try {
          this.props.newEndDate = new Date(messageObject["NewEndDate"]);
        } catch (err) {
          Logger.getInstance().debug(`Invalid message new end date, ${messageObject["NewEndDate"]}.  Cannot be converted to Date.`);
        }
      }

      if (messageObject["ApptUNID"]) {
        this.props.referencedCalendarItemUnid = parseValue("ApptUNID", messageObject);
      }

      if (messageObject["threadTopic"]) {
        this.props.threadTopic = parseValue("threadTopic", messageObject);
      }

      const followUpStatus = parseValue("FollowUpStatus", messageObject);
      this.props.followUp = (followUpStatus === "2");

      // For generating ical of Calendar invitation when the ical does not exist
      if (messageObject["Chair"]) {
        this.props.chair = parseValue("Chair", messageObject);
      }
      if (messageObject["Location"]) {
        this.props.location = parseValue("Location", messageObject);
      }
      if (messageObject["RequiredAttendees"]) {
        this.props.requiredAttendees = parseValue("RequiredAttendees", messageObject);
      }
      if (messageObject["OptionalAttendees"]) {
        this.props.optionalAttendees = parseValue("OptionalAttendees", messageObject);
      }
      if (messageObject["FYIAttendees"]) {
        this.props.fyiAttendees = parseValue("FYIAttendees", messageObject);
      }
      if (messageObject["FROMCATEGORIES"]) {
        this.props.calCategories = parseValue("FROMCATEGORIES", messageObject);
      }
      if (messageObject["SequenceNum"]) {
        this.props.sequence = parseValue("SequenceNum", messageObject);
      }
      // FYIAttendees - don't show up
      // alarm - does not show up
      // recurrenceId
      // repeating 

      return this;
    }
  
  
    /**
     * From: https://git.cwp.pnp-hcl.com/Innovation-General/domino-keep/blob/develop/keep-core/src/main/resources/pim.view.mappings
     * {
     *     "viewname": "($All)"
     *     "@unid": "Mail UNID - identical for all replicas",
     *     "@noteid": "Mail Note ID - unique for this replica, int",
     *     "@index": "Position in view",
     *     "$102": "Simplified FROM/SENDTO name",
     *     "$105": "Attachment icon",
     *     "$106": "Size",
     *     "$107": "Simplified ALT FROM/ALT SENDTO/FROM/SENDTO",
     *     "$109": "Reply / Forward icon",
     *     "$111": "ALWAYS NULL, SPACER FOR NOTES",
     *     "$113": "Exchange migration requires name fixup field or 2",
     *     "$116": "ALWAYS NULL, SPACER FOR NOTES",
     *     "$68": "Delivered date / posted date / created date",
     *     "$74": "Subject",
     *     "$86": "Message type / mood stamp icon",
     *     "$Importance": "Importance icon",
     *     "$Sender1": "Colour profile for sender",
     *     "$ThreadColumn": "ALWAYS NULL",
     *     "$ThreadsEmbed": "List of folders the mail is in",
     *     "$ToStuff": "Colour profile for sender",
     *     "$UserData": "FM=Memo;NP=false;NT=;AT=;TT=;EC=;DD=3/8/2020 20:40:37 GMT-00:00 (FORM,NOT_IN_POPUP,NOTICE_TYPE,APPOINTMENT_TYPE,TASK_TYPE,ENCRYPT,DELIVERED_DATE)",
     *     "SametimeInfo": "FROM/SENDTO/CHAIR as Sametime name"
     * },
     * {
     *     "viewname": "($All)"
     *     "@unid": "Mail UNID - identical for all replicas",
     *     "@noteid": "Mail Note ID - unique for this replica, int",
     *     "@index": "Position in view",
     *     "$105": "ALWAYS NULL, SPACER FOR NOTES",
     *     "$106": "Size",
     *     "$109": "Reply / Forward icon",
     *     "$111": "ALWAYS NULL, SPACER FOR NOTES",
     *     "$70": "Delivered date / posted date / created date",
     *     "$73": "Subject",
     *     "$86": "Message type / mood stamp icon",
     *     "$93": "Simplified FROM/SENDTO name",
     *     "$97": "Attachment icon",
     *     "$98": "Simplified ALT FROM/ALT SENDTO/FROM/SENDTO",
     *     "$Abstract": "Modified subject / short intro",
     *     "$Importance": "Importance icon",
     *     "$Sender1": "Colour profile for sender",
     *     "$ThreadColumn": "ALWAYS NULL",
     *     "$ThreadsEmbed": "List of folders the mail is in",
     *     "$ToStuff": "Colour profile for sender",
     *     "$UserData": "FM=Memo;NP=false;NT=;AT=;TT=;EC=;DD=3/8/2020 20:40:37 GMT-00:00 (FORM,NOT_IN_POPUP,NOTICE_TYPE,APPOINTMENT_TYPE,TASK_TYPE,ENCRYPT,DELIVERED_DATE)",
     *     "SametimeInfo": "FROM/SENDTO/CHAIR as Sametime name"
     * },
     * {
     *     "viewname": "($Drafts)"
     *     "@unid": "Mail UNID - identical for all replicas",
     *     "@noteid": "Mail Note ID - unique for this replica, int",
     *     "@index": "Position in view",
     *     "$55": "Last modified date",
     *     "$60": "Mail stationery name or Subject",
     *     "$62": "Attachment icon",
     *     "$66": "Simplified SENDTO name",
     *     "$86": "Mail stationery type",
     *     "$106": "Size",
     *     "$109": "Reply / Forward icon",
     *     "$padding": "ALWAYS NULL, SPACER FOR NOTES",
     *     "$ScheduleStat": "Current 'Drafts', intended for scheduled mail status",
     *     "$vv": "Always 0",
     *     "SametimeInfo": "FROM/SENDTO/CHAIR as Sametime name"
     * },
     * {
     *     "viewname": "($Trash)"
     *     "@unid": "Mail UNID - identical for all replicas",
     *     "@noteid": "Mail Note ID - unique for this replica, int",
     *     "@index": "Position in view",
     *     "$64": "Delivered date / posted date / created date",
     *     "$69": "Subject",
     *     "$79": "Message type / mood stamp icon",
     *     "$80": "Attachment icon",
     *     "$87": "Simplified FROM/SENDTO name or Contact name",
     *     "Form": "Form name",
     *     "SametimeInfo": "FROM/SENDTO/CHAIR as Sametime name"
     * },
     * {
     *     "viewname": "($Sent)"
     *     "@unid": "Mail UNID - identical for all replicas",
     *     "@noteid": "Mail Note ID - unique for this replica, int",
     *     "@index": "Position in view",
     *     "$62": "Delivered date / posted date / created date",
     *     "$65": "Subject",
     *     "$75": "Attachment icon",
     *     "$82": "Simplified SENDTO name",
     *     "$86": "Type icon",
     *     "$106": "Size",
     *     "$109": "Reply / Forward icon",
     *     "$Importance": "Importance icon",
     *     "$padding": "ALWAYS NULL, SPACER FOR NOTES",
     *     "AltWho": "Simplified ALT SENDTO/SENDTO",
     *     "SametimeInfo": "FROM/SENDTO/CHAIR as Sametime name"
     * }
     * @param messageObject
     */
    itemFromPrimitive(messageObject: any): PimMessageClassic {
      super.itemFromPrimitive(messageObject);
      this.props.unid = this.props.unid ?? messageObject['unid'];  // "Mail UNID - identical for all replicas",
      this.props.viewPosition = parseInt(messageObject['@index'] ?? '0');  // "Position in view",
      this.props.from = messageObject['$102'];  // "Simplified FROM/SENDTO name",
      if (messageObject['$102']) {
        this.props.to = this.props.to ?? [];
        this.props.to.push(...(messageObject['$102'].split("\n"))); // "Simplified FROM/SENDTO name",
      }
      this.props.attachmentIcon = messageObject['$105'];  // "Attachment icon",
      this.props.size = messageObject['$106'];  // "Size",
      this.props.simplifiedAltFromSendTo = messageObject['$107'];  // "Simplified ALT FROM/ALT SENDTO/FROM/SENDTO",
      this.props.reply = messageObject['$109'];  // "Reply / Forward icon",
      this.props.spacer111 = messageObject['$111'];  // "ALWAYS NULL, SPACER FOR NOTES",
      this.props.nameFixup = messageObject['$113'];  // "Exchange migration requires name fixup field or 2",
      this.props.spacer116 = messageObject['$116'];  // "ALWAYS NULL, SPACER FOR NOTES",
      this.props.createdDate = messageObject['$68'];  // "Delivered date / posted date / created date",
      let sentDate = messageObject['$68'];  // "Delivered date / posted date / created date",
      this.props.subject = messageObject['$74'];  // "Subject",
      this.props.messageType = messageObject['$86'];  // "Message type / mood stamp icon",
      this.props.importanceIcon = messageObject['$Importance'];  // "Importance icon",
      this.props.senderColorProfile = messageObject['$Sender1'];  // "Colour profile for sender",
      this.props.threadColumn = messageObject['$ThreadColumn'];  // "ALWAYS NULL",
      this.props.folders = messageObject['$ThreadsEmbed'];  // "List of folders the mail is in",
      this.props.colorProfile = messageObject['$ToStuff'];  // "Colour profile for sender",
      this.props.userData = messageObject['$UserData'];  // "FM=Memo;NP=false;NT=;AT=;TT=;EC=;DD=3/8/2020 20:40:37 GMT-00:00 (FORM,NOT_IN_POPUP,NOTICE_TYPE,APPOINTMENT_TYPE,TASK_TYPE,ENCRYPT,DELIVERED_DATE)",
      this.props.sametimeInfo = messageObject['SametimeInfo'];  // "FROM/SENDTO/CHAIR as Sametime name"
  
      // Depending on the type the values may be in different fields (these are duplicated from above or extra)
      this.props.createdDate = this.props.createdDate ?? messageObject['$70'];  // "Delivered date / posted date / created date",
      sentDate = sentDate ?? messageObject['$70'];  // "Delivered date / posted date / created date",
      this.props.subject = this.props.subject ?? messageObject['$73'];  // "Subject",
      this.props.from = this.props.from ?? messageObject['$93'];  // "Simplified FROM/SENDTO name",
      if (!this.props.to && messageObject['$93']) {
        this.props.to = this.props.to ?? [];
        this.props.to.push(...(messageObject['$93'].split("\n"))); // "Simplified FROM/SENDTO name",
      }
      this.props.attachmentIcon = this.props.attachmentIcon ?? messageObject['$97'];  // "Attachment icon",
      this.props.simplifiedAltFromSendTo = this.props.simplifiedAltFromSendTo ?? messageObject['$98'];  // "Simplified ALT FROM/ALT SENDTO/FROM/SENDTO",
      this.props.abstract = messageObject['$Abstract'];  // "$Abstract": "Modified subject / short intro",
  
      // "viewname": "($Drafts)"
      this.props.lastModifiedDate = messageObject['$55'];  // "$55": "Last modified date",
      this.props.subject = this.props.subject ?? messageObject['$60'];  // "$60": "Mail stationery name or Subject",
      // To avoid conflicts with $62
      if (this.props.view === KeepPimConstants.DRAFTS) {
        this.props.attachmentIcon = this.props.attachmentIcon ?? messageObject['$62'];  // "Attachment icon",
      }
      this.props.simplifiedSendToName = messageObject['$66'];  // "$66": "Simplified SENDTO name",
      if (!this.props.to && messageObject['$66']) {
        this.props.to = this.props.to ?? [];
        this.props.to.push(...(messageObject['$66'].split("\n"))); // "$66": "Simplified SENDTO name",
      }

      this.props.mailStationaryType = messageObject['$86'];  // "$86": "Mail stationery type",
      this.props.padding = messageObject['$padding'];  // "$padding": "ALWAYS NULL, SPACER FOR NOTES",
      this.props.scheduleStat = messageObject['$ScheduleStat'];  // "$ScheduleStat": "Current 'Drafts', intended for scheduled mail status",
      this.props.vv = messageObject['$vv'];  // "$vv": "Always 0",
  
      // "viewname": "($Trash)"
      this.props.createdDate = this.props.createdDate ?? messageObject['$64'];  // "Delivered date / posted date / created date",
      sentDate = sentDate ?? messageObject['$64'];  // "Delivered date / posted date / created date",
      this.props.subject = this.props.subject ?? messageObject['$69'];  // "$69": "Subject",
      this.props.messageType = this.props.messageType ?? messageObject['$86'];  // "$79": "Message type / mood stamp icon",
      this.props.attachmentIcon = this.props.attachmentIcon ?? messageObject['$80'];  // "Attachment icon",
      this.props.from = this.props.from ?? messageObject['$87'];  // "$87": "Simplified FROM/SENDTO name or Contact name",
      if (!this.props.to && messageObject['$87']) {
        this.props.to = this.props.to ?? [];
        this.props.to.push(...(messageObject['$87'].split("\n"))); // "Simplified FROM/SENDTO name",
      }
      this.props.formName = messageObject['Form'];  // "Form": "Form name",
  
      // "viewname": "($Sent)"
      // There is a conflict with $62 between an attachmentIcon and this delivered date
      if (this.props.view === KeepPimConstants.SENT) {
        this.props.createdDate = this.props.createdDate ?? messageObject['$62'];  // "Delivered date / posted date / created date",
        sentDate = sentDate ?? messageObject['$62'];  // "Delivered date / posted date / created date",
      }
      this.props.subject = this.props.subject ?? messageObject['$65'];  // "$65": "Subject",
      this.props.attachmentIcon = this.props.attachmentIcon ?? messageObject['$75'];  // "$75": "Attachment icon",
      if (this.props.view === KeepPimConstants.SENT) {
        this.props.simplifiedSendToName = messageObject['$82'];  // "$82": "Simplified SENDTO name",
        if (messageObject['$82']) {
          this.props.to = this.props.to ?? [];
          this.props.to.push(...(messageObject['$82'].split("\n"))); // "$82": "Simplified SENDTO name",
        }
      }

      if (sentDate !== undefined) {
        try {
          this.props.sentDate = new Date(sentDate);
        } catch (err) {
          Logger.getInstance().debug(`Invalid message sent date, ${sentDate}. Cannot be converted to Date.`);
        }
      }

      this.props.altWho = messageObject['AltWho'];  // "AltWho": "Simplified ALT SENDTO/SENDTO",
      
      if (!this.createdDate) {
        this.props.createdDate = Date.now();
      }
      return this;
    }

    get from(): string | undefined {
      return this.props.from ?? this.props.simplifiedSendToName;
    }
  
    set from(from: string | undefined) {
      this.props.from = from;
    }
  
    get to(): string[] | undefined {
      return this.props.to;
    }

    set to(sendTo: string[] | undefined) {
      this.props.to = sendTo;
    }

    get cc(): string[] | undefined {
      return this.props.cc;
    }
  
    set cc(copyTo: string[] | undefined) {
      this.props.cc = copyTo;
    }
  
    get bcc(): string[] | undefined {
      return this.props.bcc;
    }
  
    set bcc(copyTo: string[] | undefined) {
      this.props.bcc = copyTo;
    }

    get replyTo(): string[] | undefined {
      return this.props.replyTo;
    }
  
    set replyTo(repTo: string[] | undefined)  {
      this.props.replyTo = repTo;
    }

    get inReplyTo(): string | undefined {
      return this.props.inReplyTo
    }

    set inReplyTo(email: string | undefined) {
      this.props.inReplyTo = email; 
    }
  
    get references(): string | undefined {
      return this.props.references
    }

    set references(references: string | undefined) {
      this.props.references = references; 
    }

    get returnReceipt(): boolean | undefined {
      return this.props.returnReceipt;
    }
  
    set returnReceipt(receiptRequested: boolean | undefined) {
      this.props.returnReceipt = receiptRequested;
    }
  
    get deliveryReceipt(): boolean | undefined {
      return this.props.deliveryReceipt;
    }
  
    set deliveryReceipt(receiptRequested: boolean | undefined) {
      this.props.deliveryReceipt = receiptRequested;
    }

    get size(): number {
      return this.props.size;
    }
  
    set size(aSize: number) {
      this.props.size = aSize;
    }
  
    get receivedDate(): Date | undefined {
      return this.props.receivedDate;
    }

    set receivedDate(newReceivedDate: Date | undefined) {
      this.props.receivedDate = newReceivedDate;
    }
  
    get sentDate(): Date | undefined {
      return this.props.sentDate;
    }
  
    set sentDate(newSentDate: Date | undefined) {
      this.props.sentDate = newSentDate; 
    }

    get subject(): string {
      return this.props.subject;
    }

    set subject(subject: string) {
      this.props.subject = subject; 
    }
  
    get importance(): PimImportance {
      return this.props.importance ?? PimImportance.NONE;
    }

    set importance(importance: PimImportance) {
      this.props.importance = importance; 
    }
  
    get deliveryPriority(): PimDeliveryPriority {
      return this.props.deliveryPriority ?? PimDeliveryPriority.NORMAL;
    }

    set deliveryPriority(priority: PimDeliveryPriority) {
      this.props.deliveryPriority = priority; 
    }

    get conversationIndex(): string | undefined {
      return this.props.conversationIndex;
    }

    set conversationIndex(converstion: string | undefined) {
      this.props.conversationIndex = converstion;
    }
    
    get abstract(): string {
      return this.props.abstract;
    }
  
    set abstract(abs: string) {
      this.props.abstract = abs;
    }

    get noticeType(): string | undefined {
      return this.props.noticeType;
    }

    set noticeType(notice: string | undefined) {
      this.props.noticeType = notice;
    }

    isMeetingRequest(): boolean {
      return this.noticeType !== undefined && (this.noticeType === PimNoticeTypes.INVITATION_REQUEST);
    }
  
    isMeetingResponse(): boolean {
      return this.noticeType !== undefined && (this.noticeType !== PimNoticeTypes.INVITATION_REQUEST);
    }

    isCounterProposalRequest(): boolean {
      return this.noticeType !== undefined && (this.noticeType === PimNoticeTypes.COUNTER_PROPOSAL_REQUEST);
    }

    isDelegatedRequest(): boolean {
      return this.noticeType !== undefined && (this.noticeType === PimNoticeTypes.REQUEST_DELEGATED || this.noticeType === PimNoticeTypes.REQUEST_DELEGATED_DELEGEE);
    }

    isMeetingCancellation(): boolean {
      return this.noticeType !== undefined && (this.noticeType === PimNoticeTypes.EVENT_CANCELLED);
    }

    get referencedCalendarItemUnid(): string | undefined {
      return this.props.referencedCalendarItemUnid;
    }

    set referencedCalendarItemUnid(referencedCalendarItemUnid: string | undefined) {
      this.props.referencedCalendarItemUnid = referencedCalendarItemUnid;
    }

    get icalStream(): string | undefined {
      if (!this.props.icalStream && this.isMeetingRequest()) {
        // Build ical from the data we have
        const newICal = this.buildICalStream();
        if (newICal) {
          this.props.icalStream = newICal;
        }
      }
      return this.props.icalStream;
    }

    set icalStream(stream: string | undefined) {
      this.props.icalStream = stream;
    }

    get icalMessageId(): string | undefined {
      return this.props.icalMessageId;
    }

    set icalMessageId(calmessageId: string | undefined) {
      this.props.icalMessageId = calmessageId;
    }

    get messageId(): string | undefined {
      return this.props.messageId;
    }

    set messageId(aMessageId: string | undefined) {
      this.props.messageId = aMessageId;
    }

    /**
    * Returns the start date for a meeting invitation item. 
    */
    get start(): string | undefined {
      if (this.props.startDateTime) {
          let st = DateTime.fromISO(this.props.startDateTime);

          if (this.startTimeZone) {
              st = st.setZone(this.startTimeZone, { keepLocalTime: true });
          }

          // Don't include the timezone if it is local. This means no startTimeZone set. 
          return st.toISO({ includeOffset: st.zone.type === 'local' ? false : true });
      }

      return undefined;
    }
  
    /**
     * Set start date for the meeting invitation.
     */
    set start(start: string | undefined) {
        if (start) {
            const st = DateTime.fromISO(start);
            if (this.startTimeZone === undefined) {
                this.startTimeZone = st.zoneName;
            }

            this.props.startDateTime = st.toISO({ includeOffset: false });
        }
        else {
            this.props.startDateTime = start;
        }
    }
  
    /**
     * Returns the time zone for the meeting invitation start date/time.
     */
    get startTimeZone(): string | undefined {
      // Remove when LABS-2078, 2515 are fixed
      if (this.props.startTimeZone && this.props.startTimeZone.startsWith('Z=')) {
        this.props.startTimeZone = 'America/New_York';
      }
        return this.props.startTimeZone;
    }

    /**
     * Set the time zone for the meeting invitation start date/time.
     */
    set startTimeZone(zone: string | undefined) {
        this.props.startTimeZone = zone;
    }
  
    /**
    * Returns the end date for a meeting invitation item. 
    */
    get end(): string | undefined {
      if (this.props.endDateTime) {
          let et = DateTime.fromISO(this.props.endDateTime);

          if (this.endTimeZone) {
              et = et.setZone(this.endTimeZone, { keepLocalTime: true });
          }

          // Don't include the timezone if it is local. This means no startTimeZone set. 
          return et.toISO({ includeOffset: et.zone.type === 'local' ? false : true });
      }

      return undefined;
    }
  
    /**
     * Set end date for the meeting invitation.
     */
    set end(end: string | undefined) {
        if (end) {
            const et = DateTime.fromISO(end);
            if (this.endTimeZone === undefined) {
                this.endTimeZone = et.zoneName;
            }

            this.props.endDateTime = et.toISO({ includeOffset: false });
        }
        else {
            this.props.endDateTime = end;
        }
    }
  
    /**
     * Returns the time zone for the meeting invitation end date/time.
     */
    get endTimeZone(): string | undefined {
      // Remove when LABS-2078, 2515 are fixed
      if (this.props.endTimeZone && this.props.endTimeZone.startsWith('Z=')) {
        this.props.endTimeZone = 'America/New_York';
      }
      return this.props.endTimeZone;
    }

    /**
     * Set the time zone for the meeting invitation end date/time.
     */
    set endTimeZone(zone: string | undefined) {
        this.props.endTimeZone = zone;
    }
  
    get newStartDate(): Date | undefined {
      return this.props.newStartDate;
    }

    set newStartDate(sdate: Date | undefined) {
      this.props.newStartDate = sdate;
    }

    get newEndDate(): Date | undefined {
      return this.props.newEndDate;
    }

    set newEndDate(edate: Date | undefined) {
      this.props.newEndDate = edate;
    }

    get threadId(): string | undefined {
      return this.props.threadId;
    }
  
    set threadId(threadid: string | undefined){
      this.props.threadId = threadid;
    }

    get threadTopic(): string | undefined {
      return this.props.threadTopic;
    }

    set threadTopic(threadtopic: string | undefined){
      this.props.threadTopic = threadtopic;
    }
  
    get position(): number {
      return this.props.viewPosition ?? 0; 
    }

    set position(pos: number) {
      this.props.viewPosition = pos;
    }
    
    get isFlaggedForFollowUp(): boolean {
      return this.props.followUp ?? false;  
    }

    set isFlaggedForFollowUp(followUp: boolean) {
      this.props.followUp = followUp; 
    }

    private get location(): string | undefined {
      return this.props.location
    }

    private get calCategories(): string[] | undefined {
      return this.props.calCategories;
    }

    private get sequence(): number | undefined {
      return this.props.sequence;
    }

    private get chair(): string | undefined {
      if (this.props.chair) {
        let calChair = this.props.chair;
        if (calChair.startsWith('[')) {
          calChair = calChair.substring(1);
        }
        if (calChair.endsWith(']')) {
          calChair = calChair.substring(0, calChair.length - 1);
        }
        return calChair;
      }

      return this.props.chair
    }

    private get requiredAttendees(): string[] | undefined {
      return this.props.requiredAttendees;
    }

    private get optionalAttendees(): string[] | undefined {
      return this.props.optionalAttendees;
    }

    private get fyiAttendees(): string[] | undefined {
      return this.props.fyiAttendees;
    }

    toPimStructure(): object {
      const pStruct: any = super.toPimStructure();
      // Including other message body parts from getPimMessageStructure causes the message to get corrupt and the returmed mime will be empty
      // pStruct = Object.assign(pStruct, this.getPimMessageStructure());
      
      if (this.sentDate !== undefined) {
        pStruct.PostedDate = this.sentDate.toISOString(); 
      }

      pStruct["FollowUpStatus"] = this.isFlaggedForFollowUp ? "2" : "";

      return pStruct;
    }

    /**
     * Returns a structure that can be used to create or update a message on the Keep API.  Note that
     * this class does not implement toPimStructure() like the other PimItem subclasses do.  This is on
     * purpose due to how we handle mime messages differently.
     * @returns An object to use when creating or updating a PIM item. 
     */
    getPimMessageStructure(): object {
      const messageStructure: any = {};

      // {
      //   "bccto": [
      //     "johndoe@marauders.com",
      //     "rj@hcl.com"
      //   ],
      //   "body": {
      //     "content-type": "text/html; charset=utf-8",
      //     "encoding": "Base64",
      //     "message": "PGh0bWwgeG1sbnM6bz0zRCJ1cm46c2NoZW1hcy1taWNyb3NvZnQtY29tOm9mZmljZTpvZmZpY2UiIHhtbG5zOnc9M0QidXJuOnNjaGVtYT1zLW1pY3Jvc29mdC1jb206b2ZmaWNlOndvcmQiDQoJeG1sbnM6bT0zRCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL29mZmljZS8yMD0gMDQvMTIvb21tbCIgeG1sbnM9M0QiaHR0cDovL3d3dy53My5vcmcvVFIvUkVDLWh0bWw0MCI+IDxoZWFkPg0KPG1ldGEgaHR0cC1lcXVpdj0zREM9b250ZW50LVR5cGUgY29udGVudD0zRCJ0ZXh0L2h0bWw7IGNoYXJzZXQ9M0R1dGYtOCI+DQo8bWV0YSBuYW1lPTNER2VuZXJhdG9yIGNvbnRlbnQ9M0Q9Ik1pY3Jvc29mdCBXb3JkIDE1IChmaWx0ZXJlZCBtZWRpdW0pIj4NCjxzdHlsZT4NCgk8IS0tDQoJLyogRm9udCBEZWZpbml0aW9ucyAqLw0KCUBmb250LWZhY2Ugew0KCQlmb250LWZhbWlseTogIkNhbWJyaWEgTWF0aCI7DQoJCXBhbm9zZS0xOiAyIDQgNSAzIDUgNCA2IDMgMiA0Ow0KCX0NCg0KCUBmb250LWZhY2Ugew0KCQlmb250LWZhbWlseTogQ2FsaWJyaTsNCgkJcGFub3NlLTE6IDIgMTUgNSAyIDIgMiA0IDMgMiA0Ow0KCX0NCg0KCS8qIFN0eWxlIERlZmluaXRpb25zICovDQoJcC5Nc29Ob3JtYWwsDQoJbGkuTXNvTm9ybWFsLA0KCWRpdi5Nc29Ob3JtYWwgew0KCQltYXJnaW46IDBpbjsNCgkJbWFyZ2luLWJvdHRvbTogLjAwMDFwdDsNCgkJZm9udC1zaXplOiAxMS4wcHQ7DQoJCWZvbnQtZmFtaWx5OiAiQ2FsaWJyaSIsIHNhbnMtc2VyaWY7DQoJfQ0KDQoJc3Bhbi5FbWFpbFN0eWxlMTcgew0KCQltc28tc3R5bGUtdHlwZTogcGVyc29uYWwtY29tcG9zZTsNCgkJZm9udC1mYW1pbHk6ICJDYWxpYnJpIiwgc2Fucy1zZXJpZjsNCgkJY29sb3I6IHdpbmRvd3RleHQ7DQoJfQ0KDQoJLk1zb0NocERlZmF1bHQgew0KCQltc28tc3R5bGUtdHlwZTogZXhwb3J0LW9ubHk7DQoJCWZvbnQtZmFtaWx5OiAiQ2FsaWJyaSIsIHNhbnMtc2VyaWY7DQoJfQ0KDQoJQHBhZ2UgV29yZFNlY3Rpb24xIHsNCgkJc2l6ZTogOC41aW4gMTEuMGluOw0KCQltYXJnaW46IDEuMGluIDEuMGluIDEuMGluIDEuMGluOw0KCX0NCg0KCWRpdi5Xb3JkU2VjdGlvbjEgew0KCQlwYWdlOiBXb3JkU2VjdGlvbjE7DQoJfQ0KCS0tPg0KPC9zdHlsZT4NCjwvaGVhZD4NCg0KPGJvZHkgbGFuZz0zREVOLVVTIGxpbms9M0QiIzA1NjNDMSIgdmxpbms9M0QiIzk1NEY3MiI+DQoJPGRpdiBjbGFzPXM9M0RXb3JkU2VjdGlvbjE+DQoJCTxwIGNsYXNzPTNETXNvTm9ybWFsPlRoaXMgaXMgYSB0ZXN0IGVtYWlsDQoJCQk8bzpwPjwvbzpwPg0KCQk8L3A+DQoJPC9kaXY+DQo8L2JvZHk+DQoNCjwvaHRtbD4="
      //   },
      //   "copyto": [
      //     "John Doe <johndoe@marauders.com>"
      //   ],
      //   "from": "RJ De Jesus <rj@hcl.com>",
      //   "priority": 1,
      //   "subject": "Sample Email",
      //   "to": [
      //     "John Doe <johndoe@marauders.com>",
      //     "RJ De Jesus <rj@hcl.com>"
      //   ],
      //   "AdditionalFields": [
      //      ...
      //   ]
      // }
  
      if (this.createdDate) messageStructure["creationDate"] = this.createdDate;
      if (this.from) messageStructure["from"] = this.from;
      if (this.unid) messageStructure["id"] = this.unid;
      messageStructure["labels"] = [];
      if (this.view) {
        messageStructure["labels"].push(this.view);
      }
  
      //   "body": {
      //     "content-type": "text/html; charset=utf-8",
      //     "encoding": "Base64",
      //     "message": "PGh0bWwgeG1sbnM6bz0zRCJ1cm46c2NoZW1hcy1taWNyb3NvZnQtY29tOm9mZmljZTpvZmZpY2UiIHhtbG5zOnc9M0QidXJuOnNjaGVtYT1zLW1pY3Jvc29mdC1jb206b2ZmaWNlOndvcmQiDQoJeG1sbnM6bT0zRCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL29mZmljZS8yMD0gMDQvMTIvb21tbCIgeG1sbnM9M0QiaHR0cDovL3d3dy53My5vcmcvVFIvUkVDLWh0bWw0MCI+IDxoZWFkPg0KPG1ldGEgaHR0cC1lcXVpdj0zREM9b250ZW50LVR5cGUgY29udGVudD0zRCJ0ZXh0L2h0bWw7IGNoYXJzZXQ9M0R1dGYtOCI+DQo8bWV0YSBuYW1lPTNER2VuZXJhdG9yIGNvbnRlbnQ9M0Q9Ik1pY3Jvc29mdCBXb3JkIDE1IChmaWx0ZXJlZCBtZWRpdW0pIj4NCjxzdHlsZT4NCgk8IS0tDQoJLyogRm9udCBEZWZpbml0aW9ucyAqLw0KCUBmb250LWZhY2Ugew0KCQlmb250LWZhbWlseTogIkNhbWJyaWEgTWF0aCI7DQoJCXBhbm9zZS0xOiAyIDQgNSAzIDUgNCA2IDMgMiA0Ow0KCX0NCg0KCUBmb250LWZhY2Ugew0KCQlmb250LWZhbWlseTogQ2FsaWJyaTsNCgkJcGFub3NlLTE6IDIgMTUgNSAyIDIgMiA0IDMgMiA0Ow0KCX0NCg0KCS8qIFN0eWxlIERlZmluaXRpb25zICovDQoJcC5Nc29Ob3JtYWwsDQoJbGkuTXNvTm9ybWFsLA0KCWRpdi5Nc29Ob3JtYWwgew0KCQltYXJnaW46IDBpbjsNCgkJbWFyZ2luLWJvdHRvbTogLjAwMDFwdDsNCgkJZm9udC1zaXplOiAxMS4wcHQ7DQoJCWZvbnQtZmFtaWx5OiAiQ2FsaWJyaSIsIHNhbnMtc2VyaWY7DQoJfQ0KDQoJc3Bhbi5FbWFpbFN0eWxlMTcgew0KCQltc28tc3R5bGUtdHlwZTogcGVyc29uYWwtY29tcG9zZTsNCgkJZm9udC1mYW1pbHk6ICJDYWxpYnJpIiwgc2Fucy1zZXJpZjsNCgkJY29sb3I6IHdpbmRvd3RleHQ7DQoJfQ0KDQoJLk1zb0NocERlZmF1bHQgew0KCQltc28tc3R5bGUtdHlwZTogZXhwb3J0LW9ubHk7DQoJCWZvbnQtZmFtaWx5OiAiQ2FsaWJyaSIsIHNhbnMtc2VyaWY7DQoJfQ0KDQoJQHBhZ2UgV29yZFNlY3Rpb24xIHsNCgkJc2l6ZTogOC41aW4gMTEuMGluOw0KCQltYXJnaW46IDEuMGluIDEuMGluIDEuMGluIDEuMGluOw0KCX0NCg0KCWRpdi5Xb3JkU2VjdGlvbjEgew0KCQlwYWdlOiBXb3JkU2VjdGlvbjE7DQoJfQ0KCS0tPg0KPC9zdHlsZT4NCjwvaGVhZD4NCg0KPGJvZHkgbGFuZz0zREVOLVVTIGxpbms9M0QiIzA1NjNDMSIgdmxpbms9M0QiIzk1NEY3MiI+DQoJPGRpdiBjbGFzPXM9M0RXb3JkU2VjdGlvbjE+DQoJCTxwIGNsYXNzPTNETXNvTm9ybWFsPlRoaXMgaXMgYSB0ZXN0IGVtYWlsDQoJCQk8bzpwPjwvbzpwPg0KCQk8L3A+DQoJPC9kaXY+DQo8L2JvZHk+DQoNCjwvaHRtbD4="
      //   },
      if (this.body) {
        const bodyStruct: any = {};
        if (this.bodyType) {
          bodyStruct["content-type"] = this.bodyType;
        }
        bodyStruct["message"] = base64Encode(this.body);
        bodyStruct["encoding"] = "base64";
        messageStructure["body"] = bodyStruct;
      }

      messageStructure["to"] = this.to ?? [];
      messageStructure["copyto"] = this.cc ?? [];
      messageStructure["bccto"] = this.bcc ?? [];
      messageStructure["replyto"] = this.replyTo ?? [];
      if (this.sentDate) messageStructure["sentDate"] = this.sentDate.toISOString();
      if (this.size) messageStructure["size"] = this.size;
      if (this.subject) messageStructure["subject"] = this.subject;
  
      return messageStructure;
      // return JSON.stringify(messageStructure);
    }    

    static fromJson(jsonString: string, format: PimItemFormat = PimItemFormat.DOCUMENT): PimMessageClassic {
      return new PimMessageClassic(JSON.parse(jsonString), format);
   }

    /**
     * Update the flags corresponding to a message state
     * {
     *  "quickFlagOff": [
     *    "unid",
     *    "unid"
     *  ],
     *  "quickFlagOn": [
     *    "unid",
     *    "unid"
     *  ],
     *  "softDeleteOff": [
     *    "unid",
     *    "unid"
     *  ],
     *  "softDeleteOn": [
     *    "unid",
     *    "unid"
     *  ],
     *  "unreadOff": [
     *    "unid",
     *    "unid"
     *  ],
     *  "unreadeOn": [
     *    "unid",
     *    "unid"
     *  ]
     *}
     * @returns A structure suitable for the Keep PATCH /messages. 
     */
    public toMessageFlagStructure(): object {
      const rtn: any = {};

      // Using the field (this.props.unread) rather than the method because the method will return a boolean even if not set
      if (this.props.unread !== undefined) {
          if (this.props.unread === 1 || this.props.unread === true) {
            rtn["unreadOn"] = [`${this.unid}`];
          } else {
            rtn["unreadOff"] = [`${this.unid}`];
          }
      }

      if (this.props.followUp !== undefined) {
        if (this.props.followUp) {
          rtn["quickFlagOn"] = [`${this.unid}`];
        }
        else {
          rtn["quickFlagOff"] = [`${this.unid}`];
        } 
      }

      return rtn;
  }

  buildICalStream(): string | undefined {
    try {
      const calendar = ical();
      calendar.method(ICalCalendarMethod.REQUEST);
      const cEvent = calendar.createEvent({
          start: this.start,
          end: this.end,
          summary: this.abstract,
          description: this.body
      });
      if (this.location) {
        cEvent.location(this.location);
      }
      if (this.sequence) {
        cEvent.sequence(this.sequence);
      }

      // "FROMCATEGORIES" ARRAY
      if (this.calCategories && this.calCategories.length > 0) {
        const categories: string[] = this.calCategories;
        const calCategories: ICalCategoryData[] = categories.map( (cat) => {
          return {name: cat};
        });
        cEvent.categories(calCategories);
      }

      if (this.chair) {
        const calChair = this.chair;
        cEvent.createAttendee({
          email: calChair,
          role: ICalAttendeeRole.CHAIR
        });
        const calOrganizer: ICalOrganizer = {
          name: calChair,
          email: calChair
        };
        cEvent.organizer(calOrganizer);
      }

      // "RequiredAttendees" ARRAY
      if (this.requiredAttendees && this.requiredAttendees.length > 0) {
        for (const attendee of this.requiredAttendees) {
          cEvent.createAttendee({
              email: attendee,
              role: ICalAttendeeRole.REQ
          });
        }
      }

      // "OptionalAttendees" ARRAY
      if (this.optionalAttendees && this.optionalAttendees.length > 0) {
        for (const attendee of this.optionalAttendees) {
          cEvent.createAttendee({
              email: attendee,
              role: ICalAttendeeRole.OPT
          });
        }
      }

      // "OptionalAttendees" ARRAY
      if (this.fyiAttendees && this.fyiAttendees.length > 0) {
        for (const attendee of this.fyiAttendees) {
          cEvent.createAttendee({
              email: attendee,
              role: ICalAttendeeRole.NON
          });
        }
      }

      const calstring = calendar.toString();
      Logger.getInstance().debug(`PimMessageClassic built icalStream = ${calstring}`);
      return calstring;
    } catch (err) {
      Logger.getInstance().debug(`An error occurred generating the ical for meeting invitation ${this.unid}: ${util.inspect(err, false, 5)}`);
    }
    return undefined;
  }

}  
  