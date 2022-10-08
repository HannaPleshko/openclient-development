/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from '@loopback/testlab';
import { PimItemFactory, PimItemFormat } from '../../../internal';

describe('pimNote test', function(){

    describe('Test getter and setter', function(){

        it('subject', () => {
            let noteObject: any = {
                "$52" : "subject"
            }

            let pimNote = PimItemFactory.newPimNote(noteObject);
            expect(pimNote.subject).to.be.equal("subject");
            pimNote.subject = 'updated-subject';
            expect(pimNote.subject).to.be.equal('updated-subject');

            pimNote.subject = undefined;
            expect(pimNote.subject).to.be.equal('');
            
            noteObject = {};
            pimNote = PimItemFactory.newPimNote(noteObject);
            expect(pimNote.subject).to.be.equal('');

        });


        it('body', () => {
            let noteObject: any = {
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
                "Body": "SSBhbSB0aGUgYm9keQ==",
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
        
            let pimNote = PimItemFactory.newPimNote(noteObject, PimItemFormat.DOCUMENT);
            expect(pimNote.body).to.be.equal("I am the body");  // Base64 decoded body
            pimNote.body = 'I am body updated';
            expect(pimNote.body).to.be.equal('I am body updated');

            pimNote.body = '';
            expect(pimNote.body).to.be.equal('');
            
            noteObject = {};
            pimNote = PimItemFactory.newPimNote(noteObject);  //Primitive format
            expect(pimNote.body).to.be.equal('');

        });

        it( 'diaryDate', () => {
            const noteObject = {
                "$44" : "1990-12-25T11:00:00.000Z"
            }

            const pimNote = PimItemFactory.newPimNote(noteObject);
            expect(pimNote.diaryDate!.getTime() - new Date("1990-12-25T11:00:00.000Z").getTime()).to.be.equal(0);
            pimNote.diaryDate = new Date("1991-11-25T11:00:00.000Z");
            expect(pimNote.diaryDate.getTime() - new Date("1991-11-25T11:00:00.000Z").getTime()).to.be.equal(0);

            pimNote.diaryDate = undefined;
            expect(pimNote.diaryDate).to.be.undefined();
        });

    });
});