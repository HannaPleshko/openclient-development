import { KeepCore } from '../../services';
import { isDevelopment, Logger } from '../../utils';
import { KeepTransportManager } from '../KeepTransportManager';

export class UserManager {
  private static instance: UserManager;
  // The key is the userid of the current user and the value it an object containing 
  //    "token": The Keep authentication token. 
  //    "username": The X509 name returned when we authenticated with Keep. 
  userRegistry: Map<string, any> = new Map();

  public static getInstance(): UserManager {
    if (!UserManager.instance) {
      this.instance = new UserManager();
    }
    return this.instance;
  }

  /**
   * Clear the access token information for the current user. 
   * @param userId The id of the user acting as the key to the registry entries.
   */
  clearToken(userId: string): void {
    this.userRegistry.delete(userId);
  }

  /**
     * Returns the Keep X509 subject for the current user. 
     * @param request The request being processed.
     * @returns The X509 subject or undefined if the current user has not authenticated with Keep. 
     */
  getUserSubject(userInfo: UserInfo): string | undefined {
    if (userInfo) {
      const userData = this.userRegistry.get(userInfo.userId);
      if (userData) {
        return userData.claims.sub;
      }
    }
    return undefined;
  }

  /**
   * Returns the authorization token used for Keep requests. 
   * @param request The request being processed. 
   */
  async getUserAccessToken(userInfo: UserInfo): Promise<string | undefined> {
    let token: string | undefined;

    if (userInfo) {
      const { userId, password } = userInfo;

      let username = userId; // The name used to authenticate with Keep
      if (userId) {
        // Special processing for ngrok ids used in development mode. We expect the email to be Domino firstname.lastname@....ngrok.io
        if ((isDevelopment() && userId.endsWith('ngrok.io')) || userId.indexOf('@') < 0) {
          username = this.getDevelopmentUserName(userId);
        }

        // Check if the token is still in the registry cache
        try {
          let tokenInfo: any = this.userRegistry.get(userId);
          if (tokenInfo) {
            Logger.getInstance().debug(`Keep JWT token returned from registry for ${userId}`);
            if (tokenInfo.expSeconds * 1000 + Date.parse(tokenInfo.issueDate) > Date.now()) {
              return tokenInfo.bearer; // Return the cached token
            } else {
              // Token is expired, delete it from cache and proceed to get a new one
              this.userRegistry.delete(userId);
            }
          }

          // The token is not cached or has expired, get a new token. A password must be set for this. 
          if (password) {
            const keepCoreProvider: KeepCore = await KeepTransportManager.getInstance().getKeepCoreTransport();
            tokenInfo = await keepCoreProvider.getJWTToken(username, password);
            if (tokenInfo?.bearer) {
              tokenInfo.username = username;
              this.userRegistry.set(userId, tokenInfo);
              token = tokenInfo.bearer;
            }
          }
          else {
            const err: any = new Error('Password not provided');
            err.status = 401; // Need to authenticate
            throw err;
          }
        } catch (error) {
          const err: any = error;
          Logger.getInstance().debug("Error getting Keep JWT token: " + err);
          if (err.status === 401 || err.statusCode === 401) {
            /// When we get an authorization failure from KEEP, throw an authentication error so this will be sent back to the client
            const authErr: any = new Error("Authorization failure");
            authErr.status = 401;
            throw authErr;
          }
        }
      }
      else {
        Logger.getInstance().error("User id not provided");
      }
    }

    return token;
  }

  getDevelopmentUserName(userId: string): string {
    let username = userId.split("@")[0];
    const fullName: string[] = username.split(".");
    if (fullName.length === 2) {
      let firstName = fullName[0];
      firstName = firstName[0].toUpperCase() + firstName.slice(1); // Upper case first letter
      let lastName = fullName[1];
      lastName = lastName[0].toUpperCase() + lastName.slice(1);  // Upper case first letter
      username = `${firstName} ${lastName}`;
    }
    else {
      Logger.getInstance().warn("Unable to convert email address to first last name");
    }
    return username;
  }

}

export interface UserInfo {
  userId: string;
  password?: string;
}
