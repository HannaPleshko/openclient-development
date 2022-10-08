import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  ValueOrPromise,
} from '@loopback/core';
import {juggler} from '@loopback/repository';
import config from './keep-core.datasource.config.json';
import util from 'util';
import { getKeepUrl, Logger } from '../utils';

@lifeCycleObserver('datasource')
export class KeepCoreDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'KeepCore';

  constructor(
    @inject('datasources.config.KeepCore', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }

  /**
   * Start the datasource when application is started
   */
  start(): ValueOrPromise<void> {
    // Add your logic here to be invoked when the application is started
    Logger.getInstance().debug("KeepCore datasource started.");

    const rConnector = this.connector;
    if (rConnector) {
        rConnector.observe('before execute', (ctx: any, next: Function) => {
          ctx.req.uri = getKeepUrl(ctx.req.uri);
          Logger.getInstance().http(`Keep Core request started: ${util.inspect(ctx.req, false, 10, true)}\n`);
          next();
        });

        rConnector.observe('after execute', (ctx: any, next: Function) => {
          Logger.getInstance().http(`Keep Core request completed: ${util.inspect(ctx.res.toJSON(), false, 10, true)}\n`);
          next(); 
        });

    }
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {
    Logger.getInstance().debug("KeepCore datasource stopped.");
    return super.disconnect();
  }
}
