import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import {providers, Contract} from "ethers";
import {useEffect, useRef, useState} from "react";
import {WHITELIST_CONTRACT_ADDRESS, abi} from "../constants";

export default function Home() {
  //walletConnected keeps track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);

  //joinedWhitelist keeps track of whether current Metamask address has joined the whitelist or not
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);

  //loading is set to true when waiting for a transaction to be mined
  const [loading, setLoading] = useState(false);

  //numberOfWhitelisted tracks the number of whitelisted addresses
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  //create a reference to Web3Modal (use for connecting to the Metamask), which persists as long as the page is open
  const web3ModalRef = useRef();

  /*
  * Returns a Provider or Signer object representing the Ethereum RPC with or without the signing capabilities of Metamask attached
  * A Provider is needed to interact with the blockchain - reading transactions, balances, state etc
  * A Signer is a special type of Provider used in case a 'write' transaction is needed to be made to the blockchain, which involves the connected amount needing to make a digital signature to authorize the transaction being sent
  * Metamask exposes a Signer API to allow your website to request signatures from the user using Signer functions
  * @params{*} needSigner - true if you need signer and default value is false
  */
 const getProviderOrSigner = async (needSigner = false) => {
   //connect to the Metamask
   //Since we store 'web3Modal' as reference, we need to access the 'current' value to get access to the underlying object
   const provider = await web3ModalRef.current.connect();
   const web3Provider = new providers.Web3Provider(provider);

   //If user is not connected to Rinkeby network, let them know and throw an error
   const {chainId} = await web3Provider.getNetwork();
   if(chainId !== 4){
     window.alert("Change the network to Rinkeby");
     throw new Error("Change the network to Rinkeby");
   }

   if(needSigner){
     const signer = web3Provider.getSigner();
     return signer;
   }

   return web3Provider;
 };

 //addAddressToWhitelist: adds current connected address to the whitelist
 const addAddressToWhitelist = async () => {
   try{
     //We need a Signer here since this is a write transaction
     const signer = await getProviderOrSigner(true);

     //create a new instance of Contract with Signer, which allows to update methods
     const whitelistContract = new Contract(
       WHITELIST_CONTRACT_ADDRESS,
       abi,
       signer
     );

     //call the addAddressToWhitelist from contract
     const tx =  await whitelistContract.addAddressToWhitelist();
     setLoading(true);

     //wait for the transaction to be mined
     await tx.wait();
     setLoading(false);

     //get updated number of addresses in whitelist
     await getNumberOfWhitelisted();
     setJoinedWhitelist(true);
   }
   catch(err){
     console.error(err);
   }
 };

 //getNumberOfWhitelisted: gets number of whitelisted addresses
 const getNumberOfWhitelisted = async () => {
   try{
     //Get provider from web3Modal, which would be Metamask in our case
     //No need for Signer, we are only reading the state from the blockchain
     const provider = await getProviderOrSigner();

     //We connect to the Contract using a Provider
     //We will only have read-only access to the Contract
     const whitelistContract = new Contract(
       WHITELIST_CONTRACT_ADDRESS,
       abi,
       provider
     );

     //call numberOfWhitelisted from contract
     const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
     setNumberOfWhitelisted(_numberOfWhitelisted);
   }
   catch(err){
     console.error(err);
   }
 };

 //checkIfAddressInWhitelist: checks if address is in the whitelist
 const checkIfAddressInWhitelist = async () => {
   try{
     //We will need a Signer later to get the user address
     //Even though it is a read transaction, since Signers are just special kinds of Providers. We can use it in it's place
     const signer = await getProviderOrSigner(true);
     const whitelistContract = new Contract(
       WHITELIST_CONTRACT_ADDRESS,
       abi,
       signer
     );

     //Get address associated to Signer connected to Metamask
     const address = await signer.getAddress();

     //call the whitelistedAddresses from the contract
     const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
     setJoinedWhitelist(_joinedWhitelist);
   }
   catch(err){
     console.error(err);
   }
 };

 //connectWallet: connects to the Metamask wallet
 const connectWallet = async () => {
   try{
     //Get provider from Web3Modal which is Metamask in our case
     //For first time usage it prompts the user to connect to the wallet
     await getProviderOrSigner();
     setWalletConnected(true);

     checkIfAddressInWhitelist();
     getNumberOfWhitelisted();
   }
   catch(err){
     console.error(err);
   }
 };

 //renderButton: returns a button based on state of dApp
 const renderButton = () => {
   if(walletConnected){
     if(joinedWhitelist){
       return(
         <div className={styles.description}>Thanks for joining the Whitelist!</div>
       );
     }
     else if(loading){
       return <button className={styles.button}>Loading...</button>
     }
     else{
       return(
         <button onClick={addAddressToWhitelist} className={styles.button}>Join the Whitelist</button>
       );
     }
   }
   else{
     return(
       <button onClick={connectWallet} className={styles.button}>Connect your Wallet</button>
     );
   }
 };

 //useEffects are used to react to changes in the state of a website
 //The array at the end function call represents what state changes will trigger this effect
 //In this case whenever a value of the walletConnected changes, this effect will be called
 useEffect( () => {
   //If wallet is not connected, create a new instance of Web3Modal and connect to the Metamask wallet
   if(!walletConnected){

     //Assign Web3Modal class to the reference object by setting the current value
     //The current value is persisted throughout as long as the page is open
     web3ModalRef.current = new Web3Modal({
       network: "rinkeby",
       providerOptions: {},
       disableInjectedProvider: false,
     });
     connectWallet();
   }
 }, [walletConnected]);


  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>

          <div className={styles.description}> It&sbquo;s an NFT collection for developers in Crypto</div>

          <div className={styles.description}>{numberOfWhitelisted} have already joined the Whitelist</div>

          {renderButton()}
        </div>

        <div>
          <img className={styles.image} src="./crypto-devs.svg"></img>
        </div>
      </div>

      <footer className={styles.footer}>Made with &#10084; by Crypto Devs</footer>
      </div>);
}
