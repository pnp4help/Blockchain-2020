const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/campaignFactory.json');

const provider = new HDWalletProvider(
    'unit hungry hood bunker hello viable wing tragic gorilla pulse garbage oblige',
    'https://rinkeby.infura.io/v3/78e7a0a536ff44a3830747703bfd6073'
);
const web3 = new Web3(provider);  

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log("Attempting to deploy from Account", accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode })
        .send({ gas: '1000000', from: accounts[0] });

    console.log("Contract deployed to", result.options.address);
};
deploy();