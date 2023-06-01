const streamingService = new (require('./service/StreamingService'))();

const redisgetStreamingList = async () => {
  const streamingList = await streamingService.searchByKeyword('');
  console.log('streamingList = ', streamingList);
}

redisgetStreamingList();