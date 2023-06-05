const adDAO = new (require('./DAO/AdDAO'));


const getAdList = async () => {
  // const adList = await adDAO.getAdReqList('user1', null);
  // const adList = await adDAO.getAdReqList(null, '0');
  // const adList = await adDAO.getAdReqList('user9', 0);
  const adList = await adDAO.getAdList();

  console.log('adList = ', adList);
}

getAdList();


