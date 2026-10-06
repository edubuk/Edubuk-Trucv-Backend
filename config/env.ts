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
    REDIS_HOST: getEnv("REDIS_HOST"),
    REDIS_PORT: Number(getEnv("REDIS_PORT", "6379")),
    CV_PROCESSING_DELAY_MS: Number(getEnv("CV_PROCESSING_DELAY_MS", "5000")),
    REINDEX_BASEURL:String(getEnv("REINDEX_BASEURL")),
    REINDEX_API_KEY:String(getEnv("REINDEX_API_KEY")),
    Ocp_Apim_Subscription_Key:String(getEnv("Ocp_Apim_Subscription_Key")),
    CV_PARSER_URL:String(getEnv("CV_PARSER_URL")),
    APIFY_API_TOKEN:String(getEnv("APIFY_API_TOKEN")),
};
