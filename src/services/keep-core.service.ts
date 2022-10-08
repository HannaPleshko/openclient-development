import { getService } from '@loopback/service-proxy';
import { inject, Provider } from '@loopback/core';
import { KeepCoreDataSource } from '../datasources';

export interface KeepCore {
  // this is where you define the Node.js methods that will be
  // mapped to REST/SOAP/gRPC operations as stated in the datasource
  // json file.

  getJWTToken(username: string, password: string): Promise<any>;
}

export class KeepCoreProvider implements Provider<KeepCore> {
  constructor(
    // KeepCore must match the name property in the datasource json file
    @inject('datasources.KeepCore')
    protected dataSource: KeepCoreDataSource = new KeepCoreDataSource(),
  ) { }

  value(): Promise<KeepCore> {
    return getService(this.dataSource);
  }
}