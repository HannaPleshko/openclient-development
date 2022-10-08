import { KeepPim } from '../../services/keep-pim.service';
import { UserManager, UserInfo } from '../core';
import { KeepTransportManager } from '../KeepTransportManager';
import { Logger } from '../../utils'
import { OpenClientKeepComponent } from '../../OpenClientKeepComponent';
import { PimAttachmentInfo } from './PimAttachmentInfo';
const httpRequest = require('request');
import util from 'util';

/**
 * Interface to the Keep attachment functions.
 */
export class KeepPimAttachmentManager {
  private static instance: KeepPimAttachmentManager;

  public static getInstance(): KeepPimAttachmentManager {
    if (!KeepPimAttachmentManager.instance) {
      this.instance = new KeepPimAttachmentManager();
    }
    return this.instance;
  }

  /**
   * Delete an attachement with Keep. 
   * @param userInfo The current user's credentials
   * @param unid The unid of the item containing the attachment.
   * @param attachmentName The name of the attachment to delete.
   * @returns The Keep response. 
   */
  async deleteAttachment(userInfo: UserInfo, unid: string, attachmentName: string): Promise<any> {
    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }
    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
    return keepPimProvider.deleteAttachment(uToken, unid, attachmentName);
  }

  /**
   * Create an attachment with Keep.
   * @param userInfo The current user's credentials
   * @param unid The unid of the document containing the attachment
   * @param attachment The base64 encoded attachment data
   * @param attachmentName The name of the attachment
   * @param attachmentContentType The content type of the attachment.
   * @returns The response from Keep.
   * @throws An error if the create request fails. 
   */
  async createAttachment(userInfo: UserInfo, unid: string, attachment: any, attachmentName?: string, attachmentContentType?: string): Promise<any> {
    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }
    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();
    if ((keepPimProvider as any).transportName && ((keepPimProvider as any).transportName) === KeepTransportManager.SERVICE_TRANSPORT_NAME) {
      // Example return from sendAttachment:  {"status":"upload complete","filename":"TestFile.txt"}
      return this.sendAttachment(uToken, unid, attachment, attachmentName, attachmentContentType);
    } else {
      return keepPimProvider.createAttachment(uToken, unid, attachment, attachmentName, attachmentContentType);
    }
  }

  /**
   * Issue the Keep API request to create an attachment.
   * 
   * Note: This bypasses the REST datasource since it needs to send a multipart form on the request. 
   * 
   * @param userInfo The current user's credentials
   * @param unid The unid of the document containing the attachment
   * @param attachment The base64 encoded attachment data
   * @param attachmentName The name of the attachment
   * @param attachmentContentType The content type of the attachment.
   * @returns The response from Keep. Check the status in the response body to verify it was successful.
   * @throws An error if the create request fails. 
   */
  async sendAttachment(userToken: string, unid: string, attachment: any, attachmentName: string | undefined, attachmentContentType: string | undefined): Promise<any> {
    return new Promise((resolve, reject) => {
      // Switch to http datasource since we need to push a multipart form      
      const targetPath = `/api/pim-v1/attachments/${unid}`;
      const baseURL = OpenClientKeepComponent.getKeepBaseUrl();

      const options = {
        'method': 'POST',
        'url': baseURL + targetPath,
        'headers': {
          'Authorization': `Bearer ${userToken}`
        },
        formData: {
          '': {
            'value': Buffer.from(attachment, "base64"),
            'options': {
              'filename': attachmentName === undefined ? 'file' : attachmentName,
              'contentType': attachmentContentType ?? null
            }
          }
        }
      };

      Logger.getInstance().http(`Keep PIM attachment request started: ${util.inspect(options, false, 5, true)}`);
      this.callRequest(options, (error: any, response: any) => {
        let err: any = error;
        let body: any | undefined;
        if (response) {
          body = response.body;
          if (body) {
            try {
              body = JSON.parse(body);
            }
            catch {
              Logger.getInstance().warn(`Unable to parse JSON body: ${util.inspect(body, false, 5)}`);
            }
          }
          const rsp = { method: options.method, url: options.url, statusCode: response.statusCode, headers: response.headers, body: body };
          Logger.getInstance().http(`Keep PIM attachment request completed: ${util.inspect(rsp, false, 5, true)}`);

          if (!err && response.statusCode !== 200) {
            err = new Error(response.statusMessage ?? `Create Attachment failed.`);
            err.status = response.statusCode;
          }
        }

        if (err) {
          Logger.getInstance().error(`Keep PIM attachment request failed: ${err}`);
          reject(err);
        }
        else {
          resolve(body);
        }
      });
    });
  }

  /**
   * Make an HTTP request.
   * @param options Option for the request. See [Simplified HTTP client](https://github.com/request/request) for more info. 
   * @param callback Callback when the request completes. 
   */
  callRequest(options: any, callback: (error: any, response: any) => void): void {
    httpRequest(options, callback);
  }

  /**
   * Return an attachment from Keep. 
   * @param userInfo Current user's credentials
   * @param unid The unid of the document containing the attachment
   * @param attachmentName The name of the attachment
   * @returns An object with information about the attachment.
   * @throws An error if retrieving the attachment from Keep failed.
   */
  async getAttachment(userInfo: UserInfo, unid: string, attachmentName: string): Promise<PimAttachmentInfo> {
    const uToken = await UserManager.getInstance().getUserAccessToken(userInfo);
    if (!uToken) {
      throw new Error("User is unauthenticated");
    }

    const keepPimProvider: KeepPim = await KeepTransportManager.getInstance().getKeepPimTransport();

    // getAttachment returns the full response of the request 
    const attResponse = await keepPimProvider.getAttachment(uToken, unid, attachmentName);
    return new Promise<PimAttachmentInfo>((resolve, reject) => {
      if (attResponse) {
        const attInfo = new PimAttachmentInfo();
        attInfo.attachmentBuffer = attResponse.body;
        attInfo.attachmentName = attachmentName;
        attInfo.contentType = attResponse.headers['content-type'];
        resolve(attInfo);
      } else {
        reject(`The ${attachmentName} attachment was not returned from the server.`);
      }
    });
  }
}