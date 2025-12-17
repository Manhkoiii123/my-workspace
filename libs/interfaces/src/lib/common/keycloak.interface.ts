export type ExchangeClientTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  id_token: string;
  scope: string;
  token_type: string;
};

export type CreateKeyCloakUserRequest = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};
