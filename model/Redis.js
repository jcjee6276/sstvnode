const redis = require('redis');

class Redis{
  constructor() {
    if(this.client == null || this.client == undefined) {
      console.log('[Redis] create Redis');
      this.createClient();
    } else {
      console.log('[Redis] Redis already Create');
    }
  }

  async createClient() {
    this.client = redis.createClient();
    await this.client.connect();
  }
}

module.exports = new Redis();