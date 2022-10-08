import { OpenClientKeepComponent } from '../OpenClientKeepComponent';
import { KeepCore, KeepPim } from '../services';

/**
 * Manager for retreiving providers for the Keep APIs
 */
export class KeepTransportManager {
    private static instance: KeepTransportManager;
    public static SERVICE_TRANSPORT_NAME = 'services.KeepPim';

    /**
     * Retrieve the static instance of the transport manager. 
     * @returns The static instance of the transport manager
     */
    public static getInstance(): KeepTransportManager {
        if (!KeepTransportManager.instance) {
            this.instance = new KeepTransportManager();
        }
        return this.instance;
    }

    /**
     * Return the provider for the Keep PIM APIs
     * @returns The provider for making calls to the Keep PIM APIs
     */
    async getKeepPimTransport(): Promise<KeepPim> {
        const serviceTransport: any = await OpenClientKeepComponent.getKeepPimProvider();
        serviceTransport.transportName = KeepTransportManager.SERVICE_TRANSPORT_NAME;
        return serviceTransport;
    }

    /**
     * Return the provider for the Keep Core APIs
     * @returns The provider for making calls to the Keep Core APIs
     */
    async getKeepCoreTransport(): Promise<KeepCore> {
        return OpenClientKeepComponent.getKeepCoreProvider();
    }
}