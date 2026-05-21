import { ApiError } from "../../../../utils/apiError";
import { StatusCodes } from "../../../../utils/constants";

export class UpsAuthManager {
  private _accessToken: string | null = null;
  private _accessTokenExpiresAt: Date | null = null;

  constructor(
    private readonly _clientId: string,
    private readonly _secret: string,
  ) {}

  private async _getAccessToken(): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    // const response = await axios.post(
    //   "https://www.ups.com/ups.app/xml/Rate",
    //   {
    //     clientId: this._clientId,
    //     secret: this._secret,
    //   },
    // );

    // return stub access token
    return {
      access_token: "stub_access_token",
      expires_in: 3600,
    };
  }

  public async getValidAccessToken(): Promise<string> {
    if (!this.isTokenValid()) {
      await this._refreshAccessToken();
    }

    if (!this._accessToken) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "UpsAuthManager: Access token is not available",
      );
    }

    return this._accessToken;
  }

  private isTokenValid(): boolean {
    if (!this._accessToken || !this._accessTokenExpiresAt) {
      return false;
    }

    const skewMs = 120_000; // refresh proactively before UPS clock/expiry mismatches bite
    if (this._accessTokenExpiresAt.getTime() - skewMs <= Date.now()) {
      return false;
    }

    return true;
  }

  /** Drop cached bearer so the next getValidAccessToken fetches a fresh one (e.g. after HTTP 401). */
  invalidateCachedToken(): void {
    this._accessToken = null;
    this._accessTokenExpiresAt = null;
  }

  private async _refreshAccessToken(): Promise<void> {
    const { access_token, expires_in } = await this._getAccessToken();

    this._accessToken = access_token;
    this._accessTokenExpiresAt = new Date(Date.now() + expires_in * 1000);
  }
}
