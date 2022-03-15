//SPDX-License-Identifier:Unlicense
pragma solidity ^0.8.0;

contract Whitelist{
    //Max number of whitelisted addresses allowed
    uint8 public maxWhitelistedAddresses;

    /*Create mapping of whitelistedAddresses, if address in whitelist set to true otherwise its false by default*/
    mapping(address => bool) public whitelistedAddresses;

    //keep track of the number of whitelisted addresses
    uint8 public numAddressesWhitelisted;

    //set max number of whitelisted addresses
    //user ti input the value in deployment
    constructor(uint8 _maxWhitelistedAddresses){
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    //add address of sender to the whitelist
    function addAddressToWhitelist() public {
        //check if user has been whitelisted
        require(!whitelistedAddresses[msg.sender], "Sender has been whitelisted");

        //check if numAddressesWhitelisted is less than maxWhitelistedAddresses, if not throw an error
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "Limit reached, we cannot add more addresses");

        //add address which called function to whitelistedAddress array
        whitelistedAddresses[msg.sender] = true;

        //increment number of whitelisted addressed
        numAddressesWhitelisted += 1;
    }
}