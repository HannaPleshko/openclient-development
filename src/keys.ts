import { BindingKey, CoreBindings } from '@loopback/core';
import { OpenClientKeepComponent } from '.';
import { KeepCore, KeepPim } from './services';

 export namespace OpenClientKeepComponentBindings {
    export const COMPONENT = BindingKey.create<OpenClientKeepComponent>(
        `${CoreBindings.COMPONENTS}.OpenClientKeepComponent`
    );

    export const KEEP_PIM_SERVICE = BindingKey.create<KeepPim>(
        `services.KeepPim`
    );
 
    export const KEEP_CORE_SERVICE = BindingKey.create<KeepCore>(
        `services.KeepCore`
    );
}