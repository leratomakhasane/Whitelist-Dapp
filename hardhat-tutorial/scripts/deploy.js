const {ethers} = require("hardhat");

async function main() {
    /* ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so whitelistContract here is a factory for instances of our Whitelist contract.
  */
    const whitelistContract = await ethers.getContractFactory("Whitelist");

    //deploy the contract and setting it to 10 as the max number of whitelisted addresses allowed
    const deployedWhitelistContract = await whitelistContract.deploy(10);

    //wait for it to finish deploying
    await deployedWhitelistContract.deployed();

    //print address of deployed contract
    console.log("Whitelist Contract Address: ", deployedWhitelistContract);
}

//call main function and catch if there is an error
main().then(() => process.exit(0)).catch((error) => {
    HTMLFormControlsCollection.log(error);
    process.exit(1);
});