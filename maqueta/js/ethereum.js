// Hardcoded constats
const contractAddress = "0x1012b627b910e13739b466be1313afa954b77101";
const otaAddress = "0xbcDda8a84852dC328f90c4E881B3AC30D6a7AC51";
const blockChainNodeUrl = "https://ropsten.infura.io";
const ipfsHost = "ipfs.infura.io";
const ipfsPort = 5001;

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import mnemonicABI from '../contracts/MnemonicVault.json';

var mnemonicContract = web3.eth.contract(mnemonicABI.abi);
var mnemonic = mnemonicContract.at(contractAddress);

const ipfsAPI = require('ipfs-api');
const ethUtil = require('ethereumjs-util');
const ipfs = ipfsAPI({host: ipfsHost, port: ipfsPort, protocol: 'http'})


window.App = {
  start: function() {
    var self = this;
      
    $("#add-document").submit(function(event) {
      const req = $("#add-document").serialize();
      let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
      let decodedParams = {}
      Object.keys(params).forEach(function(v) {
        decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
      });
      addDocument(decodedParams);
      event.preventDefault();
    });
      
  }
};

function addDocument(params) {
  console.log("Add document with pararms: " + params);
    
  let expiration_time = Math.round(new Date() / 1000) + (parseInt(params["expiration-time"]) * 24 * 60 * 60);

  console.log("expiration_time: " + expiration_time);
   
  var code = mnemonic.addDocument.getData(
    params["document-name"],
    params["document-key"],
    params["issuer-name"],
    expiration_time,
    params["offchain-url"]);
    web3.eth.sendTransaction({to: contractAddress, from: web3.eth.accounts[0], data: code}, function(err, txHash) {
      if (!err) {
        console.log("Tx done! https://ropsten.etherscan.io/tx/" + txHash);
        $("#msg").html("The doc <a href='https://ropsten.etherscan.io/tx/" + txHash + "'>has been saved</a> in your Mnemonic Vault");
        $("#msg").show();  
      }
    });    
}

window.addEventListener('load', function() {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("Using blockchain node: " + blockChainNodeUrl);
    window.web3 = new Web3(new Web3.providers.HttpProvider(blockChainNodeUrl));
  }
        
  App.start();
});
