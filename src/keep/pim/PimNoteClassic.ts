import { PimItemClassic } from './PimItemClassic';
import { base64Decode, base64Encode, parseValue } from '../../internal';
import { PimNote } from './PimItemInterfaces';

/**
 * Represents a task returned fro the Keep PIM task api. 
 */
export class PimNoteClassic extends PimItemClassic implements PimNote {

    /**
     * Return true if this object implements the PimNote interface
     * @return True if the item implements the PimNote protocol
     */
     isPimNote(): this is PimNote {
        return true;
    }

    get diaryDate(): Date | undefined {
        return this.props.diaryDate;
    }

    set diaryDate(diary: Date | undefined) {      
        this.props.diaryDate = diary; 
     }

    protected itemFromDocument(noteObject: any): PimNoteClassic {
        /* noteObject looks like this:
        {
        "@unid": "4D3A86C9928EFDCD002585BB00532227",
        "@noteid": 2406,
        "@created": "2020-08-05T15:08:02Z",
        "@lastmodified": "2020-08-05T15:10:43Z",
        "@lastaccessed": "2020-08-05T15:10:43Z",
        "@etag": "W/\"5f2acbf3\"",
        "$Abstract": "I am the body",
        "$BorderColor": "DEDEC0",
        "$Revisions": [
            "2020-08-05T15:08:02Z",
            "2020-08-05T15:08:02Z"
        ],
        "$TUA": "4D3A86C9928EFDCD002585BB00532227",
        "$UpdatedBy": [
            "CN=RustyG Miramare/O=ProjectKeep"
        ],
        "Body": "I am the body",
        "Categories": [
            "Cat1",
            "Cat2"
        ],
        "DiaryDate": "Wed Aug 05 15:08:02 UTC 2020",
        "FolderOptions": 2,
        "Form": "JournalEntry",
        "Subject": "TEST FROM API: I am the subject",
        "TimeCreated": "2020-08-05T15:08:02Z",
        "WebCategories": [
            "Cat1",
            "Cat2"
        ],
        "webbuttonpressed": ""
        }
         */

        super.itemFromDocument(noteObject);

        const subject = parseValue("Subject", noteObject);
        if (subject) {
            this.props.subject = subject;
        }

        const diaryDate = parseValue("TimeCreated", noteObject);
        if (diaryDate) {
            this.props.diaryDate = new Date(diaryDate);
        }

        let body = parseValue("Body", noteObject);
        if (body === undefined) {
            // If note created in iNotes, only the abstract will be set
            body = parseValue("$Abstract", noteObject);
        }
        if (body) {
            // Body comes from Keep base64 encoded.  Stored as a base64 decoded string
            this.props.body = base64Decode(body);
        }

        return this;
    }

    protected itemFromPrimitive(noteObject: any): PimNoteClassic {
        /* noteObject looks like this:
        {
        "@unid": "4D3A86C9928EFDCD002585BB00532227",
        "@noteid": 2406,
        "@index": "1",
        "@etag": "W/\"5f2acb52\"",
        "$116": "2020-08-05T15:08:02Z",
        "$53": "0.0",
        "$51": " Previous version as of 08/05/2020",
        "$52": "TEST FROM API: I am the subject",
        "$44": "2020-08-05T15:08:02Z"
        }
        */
        super.itemFromPrimitive(noteObject);

        const subject = parseValue("$52", noteObject);
        if (subject) {
            this.props.subject = subject;
        }

        let diaryDate = parseValue("$44", noteObject);
        if (diaryDate) {
            this.props.diaryDate = new Date(diaryDate);
        }
        else {
            // Check if created date is set
            diaryDate = parseValue("$116", noteObject);
            if (diaryDate) {
                this.props.diaryDate = new Date(diaryDate);
            }
        }

        return this;
    }

    /**
      * Returns a structure that can be used to create a note entry on the Keep API. 
      * @returns An object to use when creating a note entry on the Keep API. 
      */
    public toPimStructure(): object {

        /* The strucute for create looks like this:
        {
        "Body": "I am the body",
        "Categories": [
            "Cat1",
            "Cat2"
        ],
        "DiaryDate": "Wed Aug 05 15:11:02 UTC 2020",
        "Subject": "TEST FROM API: I am the subject"
        }
        */
        const rtn: any = super.toPimStructure();

        // Body needs to be base64 encoded
        if (this.body) {
            rtn.Body = base64Encode(this.body);
        }

        if (this.subject) {
            rtn.Subject = this.subject;
        }

        // TODO: Currently the API does not accept diaryDate (LABS-1465)
        // if (this.diaryDate) {
        //     rtn.DiaryDate = this.diaryDate.toISOString();
        // }
        // else {
        //    rtn.DiaryDate = "";
        // }

        return rtn;
    }
}