const streamingService = new (require('./service/StreamingService'));

const getAdList = async () => {
  const streamingList = await streamingService.getAdminStreamingList();
  console.log('streamingList = ', streamingList);
}

getAdList();


