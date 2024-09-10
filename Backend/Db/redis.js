import { Redis } from "ioredis";

const REDIS_URL = 'rediss://default:AVNS_csTn_tNVAX4o2pOOaQt@caching-35163c0a-aggarwalgunjan597-f798.g.aivencloud.com:28274'

const getRedisUrl = () => {
    if(REDIS_URL)
    {
        return REDIS_URL;   
    }
}

export const redis= new Redis(getRedisUrl());