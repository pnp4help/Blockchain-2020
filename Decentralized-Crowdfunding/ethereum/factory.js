import web3 from './web3';
import campaignFactory from './build/campaignFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(campaignFactory.interface),
    '0x3a914f87Ab596d17bdC8eC01a42d91905aa8bB8d'
);

export default instance;