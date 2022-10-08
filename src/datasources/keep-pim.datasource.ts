import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  ValueOrPromise
} from '@loopback/core';
import {juggler} from '@loopback/repository';
import config from './keep-pim.datasource.config.json';
import util from 'util';
import { getKeepUrl, Logger } from '../utils';
import { KeepPimLabelManager } from '../keep/pim/KeepPimLabelManager';
import { KeepPimSubscriptionManager } from '../keep/pim/KeepPimSubscriptionManager';


@lifeCycleObserver('datasource')
export class KeepPimDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'KeepPim';
  static requestNum = 0;  // The count of Keep request made

  constructor(
    @inject('datasources.config.KeepPim', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }

  /**
   * Start the datasource when application is started
   */
  start(): ValueOrPromise<void> {
    // Add your logic here to be invoked when the application is started        

    const rConnector = this.connector;
    if (rConnector) {
        rConnector.observe('before execute', (ctx: any, next: Function) => {
            ctx.req.uri = getKeepUrl(ctx.req.uri);
            KeepPimDataSource.requestNum = (KeepPimDataSource.requestNum < Number.MAX_SAFE_INTEGER) ? KeepPimDataSource.requestNum + 1 : 0;  // Wrap when reach max safe integer
            ctx.openClientRequestNum = KeepPimDataSource.requestNum; 
            Logger.getInstance().http(`Keep PIM request ${KeepPimDataSource.requestNum} started: ${util.inspect(ctx.req, false, 10, true)}\n`);
            next();
        });

        rConnector.observe('after execute', (ctx: any, next: Function) => {
          Logger.getInstance().http(`Keep PIM request ${ctx.openClientRequestNum} completed: ${util.inspect(ctx.res.toJSON(), false, 10, true)}\n`);
          next(); 
        });
    }

    Logger.getInstance().debug("KeepPim datasource started.");
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {
    Logger.getInstance().debug("KeepPIM datasource stopped.");
    KeepPimLabelManager.shutdown(); // Clear label cache
    KeepPimSubscriptionManager.shutdown();  // Clear the subscription cache
    return super.disconnect();
  }
}
