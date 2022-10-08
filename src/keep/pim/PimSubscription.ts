/**
* Represents the subscription information returned from the Keep-PIM subscription API. 
*/

export enum PimEventType {
    COPY = "copy",
    CREATE = "create",
    DELETE = "delete",
    UPDATE = "update",
    MOVE = "move"
}

export enum PimSubscriptionType {
    PULL = "pull",
    PUSH = "push",
    STREAMING = "streaming"
}

/**
 * Class representing the details of a subscription
 */
export class PimSubscription {
    id: string;                         // Subscription identifier
    endPoint?: PimSubscriptionEndpoint; // Structure to receive a callback for a push or streaming type subscription
    eventTypes: PimEventType[];     // Types of events to monitor for this subscription
    expiry: number;                 // Number of minutes the subscription will expire and automatically be deleted; 0 is forever
    folders: string[];              // array of unids of folders to monitor for the events in
    type: PimSubscriptionType;      // type of subscription (push, pull, streaming)
}

export class PimSubscriptionEndpoint {
    bearer: string;                 // Authentication token for the url
    url: string;                    // Url to post subscription changes to
}