const redis = require('redis');

class Redis{
  constructor() {
    try {
      if(this.client == null || this.client == undefined) {
        console.log('[Redis] create Redis');
        this.createClient();
      } else {
        console.log('[Redis] Redis already Create');
      }
    } catch (error) {
      console.log('[Redis constructor] error = ', error);
    }
  }

  async createClient() {
    try {
      this.client = redis.createClient();
      await this.client.connect();
    } catch (error) {
      console.log('[Redis createClient] error = ', error);
    }
  }
}

module.exports = new Redis();