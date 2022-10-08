import { expect } from '@loopback/testlab';
import { PimAttachmentInfo } from '../../../keep';

describe('PimAttachmentinfo tests', () => {
    describe('Test getters and setters', () => {
   
        it('AttachmentBuffer setter/getter', () => {
            const pimAttachment = new PimAttachmentInfo();
         
            const attachmentBuffer = Buffer.from('attachment test');

            pimAttachment.attachmentBuffer = attachmentBuffer;
            expect(pimAttachment.attachmentBuffer).to.be.equal(attachmentBuffer);

            pimAttachment.attachmentBuffer = undefined;
            expect(pimAttachment.attachmentBuffer).to.be.undefined();
        });
        it('ContentType setter/getter', () => {

            const pimAttachment = new PimAttachmentInfo();
           
            pimAttachment.contentType = "content type";
            expect(pimAttachment.contentType).to.be.equal("content type");

            pimAttachment.contentType = undefined;
            expect(pimAttachment.contentType).to.be.undefined();
            
        });

        it('AttachmentName setter/getter', () => {
            const pimAttachment = new PimAttachmentInfo();
            
            pimAttachment.attachmentName = 'attachment_name';
            expect(pimAttachment.attachmentName).to.be.equal('attachment_name');

            pimAttachment.attachmentName = "";
            expect(pimAttachment.attachmentName).to.be.equal("");
        });
    });

});