require("@nomiclabs/hardhat-waffle");
require("dotenv").config({path: ".env"});

const ALCHEMY_API_KEY_URL = process.env.ALCHEMY_API_KEY_URL;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/erH8BevepAEdfQhu7Xg6Z3KORc_3ccRb",
      accounts: ["0581ece78ce2317088bd9263c20c01c754e09f9908104cc22c75c3c5a63c22f7"],
    },
  },
};