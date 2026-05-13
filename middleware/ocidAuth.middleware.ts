
import { User } from "../models/user.model";

const JWKS_URL = "https://static.opencampus.xyz/jwks/jwks-sandbox.json";

export const verifyOCIDToken = async (token:string) => {
    try {
        const jose = await import("jose");
        const jwks = jose.createRemoteJWKSet(new URL(JWKS_URL));
        const {payload}= await jose.jwtVerify(token, jwks);
        //console.log("payload", payload);
        const user = await User.findOne({uuid: payload.user_id}).select("-password -refreshToken -providers");

        return user;
    } catch (err) {
        console.log("Error verifying OCID token:", err);
        return null;
    }
}