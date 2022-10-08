/**
 * Class returning instance of information about attachments from PIM Requests 
 */
export class PimAttachmentInfo {
    protected attBuffer: Buffer | undefined;
    protected cType: string | undefined;
    protected attName: string | undefined;

    /**
     * Returns the attachment bytes.
     */
    get attachmentBuffer(): Buffer | undefined {
        return this.attBuffer;
    }

    /**
     * Set the data for the attachment.
     */
    set attachmentBuffer(attachmentBuffer: Buffer | undefined) {
        this.attBuffer = attachmentBuffer; 
    }

    /**
     * Returns the attachment contentType.
     */
    get contentType(): string | undefined {
        return this.cType;
    }

    /**
     * Set the created date for the item. 
     */
    set contentType(contentType: string | undefined) {
        this.cType = contentType;
    }

    /**
     * Return the name of the attachment. 
     */
    get attachmentName(): string {
        return this.attName ?? '';
    }

    /**
     * Set the created date for the item. 
     */
    set attachmentName(attachmentName: string) {
        this.attName = attachmentName;
    }

    getBase64AttachmentData(): string {
        return this.attachmentBuffer?.toString('base64') ?? '';
    }

}