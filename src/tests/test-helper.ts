
import { sinon } from '@loopback/testlab';
import { createStubInstance, StubbableType, SinonStubbedInstance, SinonStubbedMember } from 'sinon';
import { KeepPimCalendarManager, UserManager } from '../keep';
import { KeepTransportManager } from '../keep/KeepTransportManager';
import { KeepCore, KeepPim } from '../services';
import { MockKeepPim } from './MockKeepPim';
import fs from 'fs';
import fastcopy from 'fast-copy';

export class MockKeepCore implements KeepCore {
    async getJWTToken(username: string, password: string): Promise<any> {
        throw new Error('Not implemented');
    }
}

export type StubbedClass<T> = SinonStubbedInstance<T> & T;

/**
 * This is a work around for a typescript issue with Sinon. It is documented here: https://github.com/sinonjs/sinon/issues/1963
 * Use it to create stubbed instances of classes with private members. 
 */
export function createSinonStubInstance<T>(
    constructor: StubbableType<T>,
    overrides?: { [K in keyof T]?: SinonStubbedMember<T[K]> },
): StubbedClass<T> {
    const stub = createStubInstance<T>(constructor, overrides);
    return stub as unknown as StubbedClass<T>;
}

/**
 * Stub the call to get a user access token.
 */
export function setupUserManagerStub(resultToken = "TST-TOKEN"): void {
    const userStub = createSinonStubInstance(UserManager);
    userStub.getUserAccessToken.resolves(resultToken);
    sinon.stub(UserManager, 'getInstance').callsFake(() => {
        return userStub;
    });
}

/**
 * stub the call to get undefined user access token.
 */
export function setupUserManagerEmptyTokenStub(): void {
    const userStub = createSinonStubInstance(UserManager);
    userStub.getUserAccessToken.resolves(undefined);
    sinon.stub(UserManager, 'getInstance').callsFake(() => {
        return userStub;
    });
}
/**
 * Setup a stubbed transport manager for KeepPim.
 * @returns A stubbed instance of and object that implements the KeepPim. Use this stubbed instance to setup expected results for any Keep API calls. 
 */
export function setupTransportManagerStub(): sinon.SinonStubbedInstance<KeepPim> {
    // Create a stub to return the test data for the Keep call
    const keepPimStub = sinon.stub(new MockKeepPim());

    // Stub the transport manager to return the MockKeepPim stubbed class
    const transportStub = createSinonStubInstance(KeepTransportManager);
    transportStub.getKeepPimTransport.resolves(keepPimStub);
    sinon.stub(KeepTransportManager, 'getInstance').callsFake(() => {
        console.info("Creating stub for KeepTransportManager");
        return transportStub;
    });

    return keepPimStub;
}

/**
 * Setup a stubbed transport manager for KeepCore.
 * @returns A stubbed instance of and object that implements KeepCore. Use this stubbed instance to setup expected results for any Keep API calls. 
 */
export function setupCoreTransportManager(): sinon.SinonStubbedInstance<KeepCore> {
    // Create a stub to return the test data for the Keep call
    const keepCoreStub = sinon.createStubInstance(MockKeepCore);

    // Stub the transport manager to return the MockKeepPim stubbed class
    const transportStub = createSinonStubInstance(KeepTransportManager);
    transportStub.getKeepCoreTransport.resolves(keepCoreStub);
    sinon.stub(KeepTransportManager, 'getInstance').callsFake(() => {
        console.info("Creating stub for KeepTransportManager");
        return transportStub;
    });

    return keepCoreStub;
}

/**
 * Creates an object from json data stored in a file. 
 * @param filename The name of the file that contains the test data. It must be in the tests/data directory. 
 * @returns The object
 */
export function createObjectFromFile(filename: string): any {
    const data = fs.readFileSync(`src/tests/keep/pim/data/${filename}`, 'utf8');
    return JSON.parse(data);
}

/*** Stub out the KeepPimCalendarManager to avoid calls to Keep
 *  @param stub A stubbed instance of KeepPimCalendarManager that will be returned when code get an instance of KeepPimCalendarManager
 */

export function stubCalendarManager(stub: sinon.SinonStubbedInstance<KeepPimCalendarManager>): void {
    sinon.stub(KeepPimCalendarManager, 'getInstance').callsFake(() => {
        console.log('Creating stub KeepPimCalendarMAnager');
        return stub;
    });
}

/**
 * Deep copy given object.
 * @param obj Object
 * @returns deep copy
 */
export function deepcopy<T>(obj: T): T {
    return fastcopy(obj, { isStrict: true });
}

/**
 * Compare two ISO date strings.
 * @param date1 First ISO date string
 * @param date2 Second ISO date string
 * @returns 0 if the dates are equal, 1 if the first string is greater than the second, or -1 if the second string is greater than the first.
 */
export function compareDateStrings(date1: string, date2: string): number {
    const first = new Date(date1);
    const second = new Date(date2);

    const results = first.getTime() - second.getTime();
    if (results < 0) {
        return -1; // Second date is greater than the first
    }
    if (results > 0) {
        return 1; // First date is greater than the second
    }
    else {
        return 0; // They are equal
    }
}
