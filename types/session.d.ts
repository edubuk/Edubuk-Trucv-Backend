import "express-session";

declare module "express-session" {
  interface SessionData {
    pkce_verifier?: string;
    dl_token?: string;
    // add other session keys here
  }
}
