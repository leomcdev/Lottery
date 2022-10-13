const { ethers } = require("hardhat");
require("dotenv").config();

const mainAdmin = "0x28B5F14e4D7B2CfF12C97038A06B4f41827b1970";
var nftContract;
// 0x6b4Ab9De7a66785FCcF9344F4f16D9f0c139fbb5
async function main() {
  const TokenContract = await ethers.getContractFactory("TestERC20Token");
  const tokenContract = await TokenContract.deploy(
    mainAdmin,
    mainAdmin,
    "1000000000000000000000000000"
  );
  await tokenContract.deployed();
  console.log("Contract deployed to:", tokenContract.address);

  const Contract = await ethers.getContractFactory("Lottery");
  const contract = await Contract.deploy(
    mainAdmin,
    tokenContract.address,
    mainAdmin,
    nftContract
  );
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// npx hardhat run scripts/deploy.js --network BSCTestnet
// npx hardhat verify --network BSCTestnet contractAddress paramaters
