import { ENV } from "../config/env";

export const getJWKS = async (email: string, userId: string) => {
    try {
        const token  = await fetch(`${ENV.AUTH_API_BASEURL}/oauth/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                    "client_id": "trucv",
                    "user_email": email,
                    "user_id": userId,
                    "client_secret":ENV.TRUCV_AUTH_SECRET,
                    "audience": "trucv",
                    "scope": "app:read app:write"
                }),
        });
        console.log("token",ENV.TRUCV_AUTH_SECRET);
        const jwks = await token.json();
        console.log("jwks",jwks);
        return jwks;
    } catch (error) {
        console.error(error);
        throw error;
    }
};