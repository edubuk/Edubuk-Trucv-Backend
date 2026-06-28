
export const getJWKS = async (email: string, userId: string) => {
    try {
        const token  = await fetch("https://central-auth.edubuktrucv.com/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                    "client_id": "trucv",
                    "user_email": email,
                    "user_id": userId,
                    "client_secret":process.env.TRUCV_AUTH_SECRET,
                    "audience": "trucv",
                    "scope": "app:read app:write"
                }),
        });
        const jwks = await token.json();
        return jwks;
    } catch (error) {
        console.error(error);
        throw error;
    }
};