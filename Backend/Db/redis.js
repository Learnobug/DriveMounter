import { Redis } from "ioredis";


const getRedisUrl = () => {
    if(process.env.REDIS_URL)
    {
        return process.env.REDIS_URL;   
    }
}

export const redis= new Redis(getRedisUrl());

export const setKeyWithDefaultExpiry = async (key, value) => {
    try {
        const ttlInSeconds = 3600; 
        await redis.set(key, value, 'EX', ttlInSeconds);
        // console.log(`Key '${key}' set with value '${value}' and a 1-hour expiry.`);
    } catch (error) {
        console.error("Error setting key with 1-hour expiry:", error);
    }
};