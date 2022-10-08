import { KeepPim, KeepPimProvider, KeepCore, KeepCoreProvider } from './services';
import { asLifeCycleObserver, Component, LifeCycleObserver, inject, Application, CoreBindings, BindingScope } from '@loopback/core';
import { KeepPimDataSource, KeepCoreDataSource } from './datasources';
import { juggler } from '@loopback/service-proxy';
import { OpenClientKeepComponentBindings } from './keys';
import { OpenClientLogger } from './utils/openClientLogger';
import { Logger } from './utils/logger'

export class OpenClientKeepComponent implements Component, LifeCycleObserver {
    status = 'not-initialized';
    initialized = false;
    public static appContext: Application;
    public static keepOptions: OpenClientKeepOptions;

    // Common logger used throughout the common keep module.  This defaults to a local
    // implementation that only logs to the debug console.  Consuming apps may set
    // this to their own implemenation that implements the OpenClientLogger interface.
    public static commonLogger: OpenClientLogger = new Logger();

    constructor(@inject(CoreBindings.APPLICATION_INSTANCE) private app: Application) {
        OpenClientKeepComponent.appContext = app;

        // Add the providers for the datasources
        app.service(KeepPimProvider);
        app.service(KeepCoreProvider);

        // Add the datasources
        let ds: juggler.DataSource = new KeepPimDataSource();
        asLifeCycleObserver(app.bind('datasources.KeepPim').to(ds).inScope(BindingScope.SINGLETON).tag('datasource'));

        ds = new KeepCoreDataSource();
        asLifeCycleObserver(app.bind('datasources.KeepCore').to(ds).inScope(BindingScope.SINGLETON).tag('datasource'));
    }

    async init(): Promise<void> {
        this.status = 'initialized';
        this.initialized = true;
    }

    async start(): Promise<void> {
        this.status = 'started';
    }

    async stop(): Promise<void> {
        this.status = 'stopped';
    }

    static async getKeepPimProvider(): Promise<KeepPim> {
        return OpenClientKeepComponent.appContext.get(OpenClientKeepComponentBindings.KEEP_PIM_SERVICE.key);
    }

    static async getKeepCoreProvider(): Promise<KeepCore> {
        return OpenClientKeepComponent.appContext.get(OpenClientKeepComponentBindings.KEEP_CORE_SERVICE.key);
    }

    static getKeepBaseUrl(): string {
        return OpenClientKeepComponent.keepOptions.getKeepBaseUrl();
    }

}

export interface OpenClientKeepOptions {
    getKeepBaseUrl(): string;
}

