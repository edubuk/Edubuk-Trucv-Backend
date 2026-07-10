import { configDotenv } from "dotenv";

configDotenv();

function getEnv(name:string,fallback?:string):string{
    const value = process.env[name] ?? fallback;
    if(!value){
        throw new Error(`Environment variable ${name} is required`);
    }
    return value;
}

export const ENV = {
    PORT: Number(getEnv("PORT", "8000")),
    MONGO_URI: getEnv("MONGO_URI"),
    SUBSCRIPTION_API_BASEURL: getEnv("SUBSCRIPTION_API_BASEURL"),
    AUTH_API_BASEURL: getEnv("AUTH_API_BASEURL"),
    CLIENT_URL: getEnv("CLIENT_URL"),
    TRUCV_AUTH_SECRET: getEnv("TRUCV_AUTH_SECRET"),
};
