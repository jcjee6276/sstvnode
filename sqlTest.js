const banDAO = new(require('./DAO/BanDAO'));

const getAdList = async () => {
  
  banDAO.removeStreamingRollBan(1, 'user1');
}

getAdList();


