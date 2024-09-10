import { Redis } from "ioredis";


const getRedisUrl = () => {
    if(process.env.REDIS_URL)
    {
        return process.env.REDIS_URL;   
    }
}

export const redis= new Redis(getRedisUrl());