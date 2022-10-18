/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("@nomicfoundation/hardhat-chai-matchers");

const {
  ETHSCAN_API_KEY,
  ETH_API_URL,
  BSCSCAN_API_KEY,
  POLYGONSCAN_API_URL,
  POLYGONSCAN_API_KEY,
  BSCTESTNET_PRIVATE_KEY_1970,
  BSC_API_URL,
} = process.env;

module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    // rinkeby: {
    //   url: ETH_API_URL,
    //   accounts: [`0x${PRIVATE_KEY}`],
    //   allowUnlimitedContractSize: true,
    // },
    BSCTestnet: {
      url: BSC_API_URL,
      accounts: [`0x${BSCTESTNET_PRIVATE_KEY_1970}`],
      allowUnlimitedContractSize: true,
    },
    // BSCMAINNET: {
    //   url: BSC_API_URL,
    //   accounts: [`0x${PRIVATE_KEY}`],
    //   allowUnlimitedContractSize: true,
    // },
    // mumbai: {
    //   url: POLYGONSCAN_API_URL,
    //   accounts: [`0x${PRIVATE_KEY}`],
    //   allowUnlimitedContractSize: true,
    // },
  },

  gasReporter: {
    currency: "USD",
    token: "BNB",
    gasPriceApi: "https://api.bscscan.com/api?module=proxy&action=eth_gasPrice",
    gasPrice: 5,
    coinmarketcap: "0431b70e-ffff-4061-81b0-fa361384d36c",
    // enabled: (process.env.REPORT_GAS) ? true : false
  },
  etherscan: {
    apiKey: BSCSCAN_API_KEY,
  },
};

// https://coinsbench.com/erc-721-nft-smart-contract-deployment-using-hardhat-97c74ce1362a
// npx hardhat run scripts/deploy_AssetState.js --network rinkeby
// npx hardhat verify contract address --network rinkeby

// BSCSCAN verified address: 0x604a8223D8c1b898d6b037ec0538Daf1Bd6b7988
