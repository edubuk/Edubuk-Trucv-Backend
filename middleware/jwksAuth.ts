import { createRemoteJWKSet, jwtVerify } from "jose";
import { User } from "../models/user.model";
import { ENV } from "../config/env";

const JWKS = createRemoteJWKSet(
    new URL(`${ENV.AUTH_API_BASEURL}/.well-known/jwks.json`)
);

export async function authMiddleware(
    token: string
) {
    try {
        const result = await jwtVerify(token, JWKS, {
            issuer:ENV.CLIENT_URL,
            audience: "trucv",
            algorithms: ["RS256"]
        });

        //console.log("payload", result.payload);
        const scopes =
            typeof result.payload.scope === "string"
                ? result.payload.scope.split(" ")
                : [];

        const requiredScopes = ["app:read", "app:write"];

        const hasAllScopes = requiredScopes.every(scope =>
            scopes.includes(scope)
        );

        if (!hasAllScopes) {
            throw new Error("Missing required scope");
        }

        const user = await User.findById(result.payload.user_id as string).select("-password -refreshToken -providers");
        return {user,iat:result.payload.iat,exp:result.payload.exp};
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
}