/**
* Represents a delegation information returned from the Keep-PIM delegate API. 
*/

import { PimDelegateAccess } from ".";

export class PimDelegation {
    mail: PimDelegateAccess[];
    calendar: PimDelegateAccess[];
    contacts: PimDelegateAccess[];
    //todo?: PimDelegateAccess[];
    name: string;
}

export class PimUpdateDelegation {
    add?: PimDelegation[];
    remove?: string[];
    update?: PimDelegation[];
}
