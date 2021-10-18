import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState, useCallback } from "react"
import { ethers } from "ethers"
import { CircleToBlockLoading } from 'react-loadingg';

import myEpicNft from './utils/MyEpicNFT.json'

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/narutokunv1-v2';
// const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0x81A83C526964470583450F6474EB631b0981ECCA"

const App = () => {

  const [currentAccount, setCurrentAccount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [nftCount, setNftCount] = useState(0)

  const checkIfWalletIsConnected = useCallback(async () => {
    const { ethereum } = window;
    if(!window.ethereum) {
      console.log("Make sure you have metamask installed!")
    } else  {
      console.log("We have ethereum object.",ethereum.networkVersion)
    }

    const accounts = await ethereum.request({method: 'eth_accounts'})
    if(accounts.length!==0) {
      const account = accounts[0];
      console.log("We found an authorized account: ", account)
      getTotalNFTsMintedSoFar()
    } else {
      console.log("No authorized account found.")
    }
  }, [])

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if(!ethereum) {
        alert("Get Metamask!")
        return;
      } else {
        const accounts = await ethereum.request({method: 'eth_requestAccounts'})

        console.log("Connected ", accounts[0])
        setCurrentAccount(accounts[0])
      }
      setUpEventListener()
      checkIfConnectedToRinkeby()
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

        console.log("Going to pop wallet to pay gas...")

        let nftTxn = await contract.makeAnEpicNFT()
        setLoading(true)
        console.log("Mining...")
        await nftTxn.wait()

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`)
        setLoading(false)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getTotalNFTsMintedSoFar = async () => {
    try {
      const { ethereum } = window
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

        let nftCount = await contract.getTotalNFTsMintedSoFar()
        setNftCount(nftCount.toNumber())
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const checkIfConnectedToRinkeby = () => {
    if(window.ethereum.networkVersion !== "4") {
      alert("Hey — I see you're connected to mainnet but this only works on Rinkeby!")
    }
  }

  const setUpEventListener = () => {
    try {
      const { ethereum } = window
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)


        contract.on("NewEpicNFTMinted", (from, tokenId, nftCount) => {
        console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
          setNftCount(nftCount)
        })
      } else {
          console.log("Ethereum object doesn't exist!");
      }

    } catch (error) {
      console.log(error)
    }
  }

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <>
      <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
        Mint NFT
      </button>
      <p className="count-text">
        {`NFTs minted: ${nftCount}/50`}
      </p>
    </>
  )

  useEffect(() => {
    checkIfWalletIsConnected();// eslint-disable-next-line
  }, [])

  useEffect(() => {
    getTotalNFTsMintedSoFar()
  },[nftCount])

  return (
    <div className="App">
        {loading ? (
          <div>
            <CircleToBlockLoading size={'large'} color={"#f543f1"} />
            <h1 className="gradient-text mining-text">Mining...</h1>
          </div>
          ) :
        <div className="container">
            <div className="header-container">
                <p className="header gradient-text">My NFT Collection</p>
                <p className="sub-text">
                  Each unique. Each funny. Discover your Naruto NFT today.
                </p>
                <div class="buttons">
                  {currentAccount ? renderMintUI() : renderNotConnectedContainer()}
                  <button className="cta-button opensea-button">
                    <a href={OPENSEA_LINK}
                        className="opensea-link"
                        target="_blank"
                        rel="noopener noreferrer">
                        <span role="img" aria-label="whale">🌊</span> View Collection on OpenSea
                    </a>
                  </button>
                </div>
              </div>
              <div className="footer-container">
                <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
                <a
                  className="footer-text"
                  href={TWITTER_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >{`built on @${TWITTER_HANDLE}`}</a>
            </div>
          </div>
        }
    </div>
  );
};

export default App;
