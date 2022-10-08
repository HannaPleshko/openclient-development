import { PimItemClassic } from './PimItemClassic';
import { parseValue } from '../../utils';
import { PimThread } from './PimItemInterfaces';

export class PimThreadClassic extends PimItemClassic implements PimThread {

    /**
     * Return true if this object implements the PimTask interface
     * @return True if the item implements the PimTask protocol
     */
     isPimThread(): this is PimThread {
        return true;
    }

    /**
    * Use to create a PimItem from an object returned from the Keep API. Use this if the returned object does not contain "$nnn" fields. 
    * Subclasses must override this method. Common attributes, like unid, can be processed here and subclasses call super.itemForDocument. 
    * @param itemObject The object returned from the Keep API.
    */    

    protected itemFromDocument(itemObject: any): PimThreadClassic {

        super.itemFromDocument(itemObject);
        const threadEntries: Array<any> = parseValue("threadEntries", itemObject);
        if (threadEntries) {
            this.props.emailIds = threadEntries.map(email => { return email["@unid"] });
        }

        return this;
    }

    get emailIds(): string[] | undefined {
        return this.props.emailIds;
    }

    set emailIds(emails: string[] | undefined) {
        this.props.emailIds = emails;
    }
}