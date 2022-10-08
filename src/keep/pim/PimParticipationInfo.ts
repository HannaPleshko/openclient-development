import { PimParticipationStatus } from "./KeepPimConstants";

/**
 * Calendar participation information 
 *  participantAction - The response action to the invite/calEntry. (values: "accepted", "declined", "delegated", "counter", "tentative")
 *  participantComment - Comment to the invites along with the response. (optional)
 *  delegatedTo - The email of the user to delegate the meeting. (required for participantAction : "delegated")
 *  proposedStart - The proposed Start datetime of the meeting. (required for participantAction : "counter")
 *  proposedEnd - The proposed End datetime of the meeting. (required for participantAction : "counter")
 *  Examples:
 *   
 *   { "participantAction": "accepted", "participantComment": "I am available" }
 *   ,
 *   
 *   { "participantAction": "declined" }
 *   ,
 *   
 *   { "participantAction": "delegated", "delegatedTo": "lily@quattro.rocks" }
 *   ,
 *   
 *   { "participantAction": "tentative" }
 *   ,
 *   
 *   { "participantAction": "counter", "participantComment": "I am available at this time", "proposedStart": "2021-10-07T11:30:00", "proposedEnd": "2021-10-07T12:30:00" }            const participantResponse: any = {
 *       "@type": "Participant"
 *   }
 * */ 
 export class PimParticipationInfo {
    participantAction: PimParticipationStatus;
    participantComment?: string;
    delegatedTo?: string;
    proposedStart?: string;
    proposedEnd?: string;
}