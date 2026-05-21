export class UpsAuthManager {
  constructor(
    private readonly _clientId: string,
    private readonly _secret: string,
  ) {}

  public async getValidAccessToken(): Promise<string> {
    return "access_token";
  }
}
