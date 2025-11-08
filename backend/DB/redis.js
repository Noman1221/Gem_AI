import { Redis } from '@upstash/redis';
import 'dotenv/config';


let redisClient;

try {
  // Check if Upstash credentials are available
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.log('🔵 Connecting to Upstash Redis...');
    
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Test connection
    redisClient.ping().then(() => {
      console.log('Upstash Redis connected successfully');
    }).catch((err) => {
      console.error(' Upstash Redis connection failed:', err.message);
    });

  } else {
    console.warn('Upstash Redis credentials not found');
    
  }} catch (error) {
  console.error('❌ Redis initialization error:', error);
  

  };

export default redisClient;






  


