import { UserManager, UserInfo } from '../core';
import { KeepPim } from '../../services';
import { KeepTransportManager } from '../KeepTransportManager';
import { Logger } from '../../utils';
import { KeepPimBaseResults } from '.';
import { PimEventType, PimSubscription } from './PimSubscription';
import memoryCache, { CacheClass } from 'memory-cache';
import util from 'util';

/**
 * Interface to general Keep subscription functions.
 */
export class KeepPimSubscriptionManager {
    private static instance: KeepPimSubscriptionManager;
    // Map keyed by userid and value is a memoryCache keyed by id and value of a PimSubscription cache
    protected static subscriptions: Map<string, CacheClass<string, PimSubscription>> = new Map();

    public static getInstance(): KeepPimSubscriptionManager {
        if (!KeepPimSubscriptionManager.instance) {
            this.instance = new KeepPimSubscriptionManager();
        }
        return this.instance;
    }

    /**
     * Called when the Pim datasource is stopped to clear the subscription cache. 
     */
    public static shutdown(): void {
        this.subscriptions.forEach((val: CacheClass<string, PimSubscription>, key: string) => {
            val.clear();
        });
        this.subscriptions.clear();
    }
    
    private getCachedSubscriptionById(uuid: string, userInfo: UserInfo): PimSubscription | undefined {
        const subCache = KeepPimSubscriptionManager.subscriptions.get(userInfo.userId);
        if (subCache) {
            const sub = subCache.get(uuid);
            return sub === null ? undefined : sub;
        }
        return undefined
    }

    private deleteCachedSubscriptionById(uuid: string, userInfo: UserInfo): void {
        const subCache = KeepPimSubscriptionManager.subscriptions.get(userInfo.userId);
        if (subCache) {
            subCache.del(uuid);
        }
    }

    /**
     * Return subscriptions if any folder matches the list of folders and any of the events are included in the subscription
     * @param userInfo The information about the currently authenticated user.
     * @param folders List of folders for a subscription to match any of to be returned.  If empty any folder matches
     * @param events List of events for a subscription to match any of to be returned.  If empty any event matches
     * @returns All subscriptions for the user matching any folder AND any event.
     */
    getSubscriptionsForFoldersAndEvents(userInfo: UserInfo, folders: string[], events: PimEventType[]): PimSubscription[] {
        const subResults: PimSubscription[] = [];
        const subCache = KeepPimSubscriptionManager.subscriptions.get(userInfo.userId);
        if (subCache) {
            for (const key of  subCache.keys()) {
                const sub = subCache.get(key);
                if (sub) {
                    if (folders.length > 0) {
                        // Do any folders match?
                        const intersectionArray = folders.filter(value => sub.folders.includes(value));
                        if (intersectionArray.length === 0) {
                            continue; // No intersection
                        }
                    }
                    if (events.length > 0) {
                        // Do any events match?
                        const intersectionArray = events.filter(value => sub.eventTypes.includes(value));
                        if (intersectionArray.length === 0) {
                            continue; // No intersection
                        }
                    }
                    subResults.push(sub);
                }
            }
        }
        return subResults;
    }

    private cacheSubscriptionById(uuid: string, userInfo: UserInfo, pimSubscription: PimSubscription): void {
        let subCache = KeepPimSubscriptionManager.subscriptions.get(userInfo.userId);
        if (!subCache) {
            subCache = new memoryCache.Cache();
            KeepPimSubscriptionManager.subscriptions.set(userInfo.userId, subCache);
        }
       
        let subscriptionTimeout: number | undefined
        if (pimSubscription.expiry === undefined || pimSubscription.expiry === 0) {
            subscriptionTimeout = undefined;
        } else {
            subscriptionTimeout = pimSubscription.expiry * 60 * 60; // Convert minutes to milliseconds
        } 
        subCache.put(uuid, pimSubscription, subscriptionTimeout, function (key, value) {
            Logger.getInstance().debug(`Removing subscription for ${key} from cache due to timeout.`);
        });
    }

    /**
     * Retrieve a subscription and its details from keep. 
     * @param uuid The identifier of the subscription to retrieve.
     * @param userInfo The current user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns a PimSubscription or undefined if the item does not exist or an error occurred. 
     */
    async getSubscription(uuid: string, userInfo: UserInfo, mailboxId?: string): Promise<PimSubscription | undefined> {

        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            const itemObject: any = await keepPimProvider.getSubscription(uToken, uuid, mailboxId);

            // 501 is the response keep is giving since this is not implemented yet
            if (itemObject.result === 501) {
                return this.getCachedSubscriptionById(uuid, userInfo);
            }

            return itemObject as PimSubscription;

        } catch (err) {
            Logger.getInstance().error(`getSubscription error: ${err}`);
            throw err;
        }
    }

    /**
     * Delete a subscription and its details from keep. 
     * @param uuid The identifier of the subscription to delete.
     * @param userInfo The current user.
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns The results/response of the delete request. 
     */
     async deleteSubscription(uuid: string, userInfo: UserInfo, mailboxId?: string): Promise<KeepPimBaseResults> {

        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            const response =  await keepPimProvider.deleteSubscription(uToken, uuid, mailboxId);

            // 501 is the response keep is giving since this is not implemented yet
            if (response.status === 501) {
                this.deleteCachedSubscriptionById(uuid, userInfo);
                const baseResults: KeepPimBaseResults = {
                    status: 200,
                    message: `Subscription ${uuid} has been removed`
                }
                return baseResults;   
            }

            return response;

        } catch (err) {
            Logger.getInstance().error(`deleteSubscription error: ${err}`);
            throw err;
        }
    }

    /**
     * Create a subscription and its details in keep. 
     * @param userInfo The current user.
     * @param pimSubscription The subscription definitiono
     * @param mailboxId Optional, when omitted the default mailbox of the authenticated user is used. Only used in delegation access when owner and user are different. 
     * Value can be replica id, filepath, owner shortname, or owner email. 
     * @returns The id of the subscription that was created. 
     */
     async createSubscription(userInfo: UserInfo, pimSubscription: PimSubscription, mailboxId?: string): Promise<string> {

        try {
            const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
            if (!uToken) {
                throw new Error("User is unauthenticated");
            }

            const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
            const response = await keepPimProvider.createSubscription(uToken, pimSubscription, mailboxId);

            // 501 is the response keep is giving since this is not implemented yet
            if (response.status === 501) {
                // Add the subscription to the local cache for now
                this.cacheSubscriptionById(pimSubscription.id, userInfo, pimSubscription);
                return pimSubscription.id;
            } else {
                const subscriptionId =  response.unid ?? pimSubscription.id;
                if (!subscriptionId) {
                    throw new Error(`Failed to create subscription: ${util.inspect(response, false, 5)}`)
                }
                return subscriptionId;
            }

        } catch (err) {
            Logger.getInstance().error(`createSubscription error: ${err}`);
            throw err;
        }
    }
}