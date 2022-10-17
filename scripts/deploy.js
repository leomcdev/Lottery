const { ethers } = require("hardhat");
require("dotenv").config();
// https://testnet.bscscan.com/address/0x0cAdB0d9E410072325D2aCC00aAB99EB795a8c86
const mainAdmin = "0x51E6a589dd3D829FBd720B2f8af68F881E2D4FC1";
async function main() {
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(
    mainAdmin,
    "0x0cadb0d9e410072325d2acc00aab99eb795a8c86"
  );
  await nft.deployed();
  console.log("nft Contract deployed to:", nft.address);

  const Contract = await ethers.getContractFactory("Lottery");
  const contract = await Contract.deploy(mainAdmin, mainAdmin, nft.address);
  await contract.deployed();
  console.log("lottery Contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// npx hardhat run scripts/deploy.js --network BSCTestnet
// npx hardhat verify --network BSCTestnet contractAddress paramaters
