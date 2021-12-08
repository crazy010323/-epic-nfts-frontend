import { ethers } from "ethers";
import React, { useState, useEffect } from 'react';
import myEpicNFT from './utils/MyEpicNft.json';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

import LoadingMask from "react-loadingmask";
import "react-loadingmask/dist/react-loadingmask.css";

// Constants
const TWITTER_HANDLE = 'crazy010323';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-dmihzahvtc';
const TOTAL_MINT_COUNT = 50;

const App = () => {

  const CONTRACT_ADDRESS = "0x33f1AF8a7B9980E8ce9d43a0Eb1d5668022c5F07";
  const [mintedNFTs, setMintedNFTs] = useState(0);
  const [mining, setMining] = useState(false);
  /*
  * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
  */
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfCorrectNetwork = async () => {
    const {ethereum} = window;
    if (ethereum) {
      const rinkebyChainId = '0x4';
      const chainId = await ethereum.request({method: 'eth_chainId'});
      console.log('Connected to chain ', chainId);
      if (chainId !== rinkebyChainId)
        alert("You are not connected to the Rinkeby Test Network!");
    } else {
      console.error('Cannot find Ethereum object!!!');
    }
  }

  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;
    if (ethereum) {
      console.log('We have the ethereum object', ethereum);
    } else {
      console.error('Connect you wallet');
      return;
    }

    /*
    * Check if we're authorized to access the user's wallet
    */
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length == 0) {
      console.error('No authorized account found!');
    } else {
      console.log('Found an authorized user!');
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener();
    }
  };

  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
;        alert('Get the Meteamask');
        return;
      } else {
        const accounts = await ethereum.request({method: 'eth_requestAccounts'});
        /*
        * Boom! This should print out public address once we authorize Metamask.
        */
        console.log('Connected: ', accounts[0]);
        setCurrentAccount(accounts[0]);

        // Setup listener! This is for the case where a user comes to our site
        // and connected their wallet for the first time.
        setupEventList();
      }
    } catch(err) {
      console.error(err);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if ( ethereum ) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);

        console.log('Going to pop up wallet now to pay for gas fees');
        setMining(prev => (true));
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mining...please wait.")
        await nftTxn.wait();
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.error('Ethereum object doesnt exist');
      }
    } catch(err) {
      console.error(err);
    }
  };

  const setupEventListener = async () => {
    const {ethereum} = window;
    if (!ethereum) {
      console.error("Ethereum object doesn't exist.")
      return;
    }
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);

    // THIS IS THE MAGIC SAUCE.
    // This will essentially "capture" our event when our contract throws it.
    // If you're familiar with webhooks, it's very similar to that!
    connectedContract.on("newEpicNftMinted", (from, tokenId) => {
      console.log(from, tokenId.toNumber(), mintedNFTs);
      setMintedNFTs(prevValue => (prevValue + 1));
      setMining(prev => (false));
      alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
    });
  }

  const getNumberOfMintedNFTs = async () => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
        console.error("Ethereum object cannot be found!");
      } else {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);
        const cnt = await connectedContract.getTotalNFTsMintedSoFar(signer.getAddress());
        setMintedNFTs(cnt.toNumber());
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={connectWallet}>
      Connect to Wallet
    </button>
  );

  const renderMintUi = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button" disabled={mining}>
      {!mining ? "Mint NFT" : "Minting..."}
      <div>(You have minted {mintedNFTs} NFT{mintedNFTs != 1 ? 's' : ''} so far!!!)</div>
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfCorrectNetwork();
    getNumberOfMintedNFTs();
  }, []);

  /*
  * Added a conditional render! We don't want to show Connect to Wallet if we're already conencted :).
  */
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUi()}
        </div>
        <a
          className="footer-text"
          href={OPENSEA_LINK}
          target="_blank"
          rel="noreferrer"
        >🌊 View Collection on OpenSea</a>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
