import { Redis } from "ioredis";
import { configDotenv } from 'dotenv';

configDotenv();

const REDIS_URL = process.env.REDIS_URI 

const getRedisUrl = () => {
    if(REDIS_URL)
    {
        return REDIS_URL;   
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