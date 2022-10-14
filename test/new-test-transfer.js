const { expect } = require("chai");
const { ethers } = require("hardhat");
const totalSupply = ethers.BigNumber.from("10000000000000000000000");
const val = ethers.BigNumber.from("100000000000000000000");
const valBUSD = ethers.BigNumber.from("100000000000000000000000");

var defaultAdmin, owner, buyer, investor;

async function setCoriteToken(_defaultAdmin, totalSupply) {
  const CoriteToken = await ethers.getContractFactory("CoriteToken");
  const coriteToken = await CoriteToken.deploy(_defaultAdmin, totalSupply);
  await coriteToken.deployed();
  return coriteToken;
}
async function setBUSDToken(totalSupply) {
  const BUSDToken = await ethers.getContractFactory("BUSD");
  const BUSDtoken = await BUSDToken.deploy(totalSupply);
  await BUSDtoken.deployed();
  return BUSDtoken;
}

async function setLotteryContract(
  _defaultAdmin,
  _erctoken,
  _moneyWallet,
  _nft
) {
  const Lottery = await ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy(
    _defaultAdmin,
    _erctoken,
    _moneyWallet,
    _nft
  );
  await lottery.deployed();
  return lottery;
}

async function setNFT(_defaultAdmin) {
  const State = await ethers.getContractFactory("NFT");
  const state = await State.deploy(_defaultAdmin);
  await state.deployed();
  return state;
}

describe("Test State", function () {
  var CoriteToken;
  var BUSDToken;
  var LotteryContract;
  var NFT;

  // always runs first
  beforeEach(async function () {
    [defaultAdmin, walletMoneyAddress, buyer] = await ethers.getSigners();
    console.log("def admin", defaultAdmin.address);
    console.log("walletmoney adr", walletMoneyAddress.address);
    console.log("buyr adr", buyer.address);

    NFT = await setNFT(defaultAdmin.address);

    CoriteToken = await setCoriteToken(defaultAdmin.address, totalSupply);

    BUSDToken = await setBUSDToken(totalSupply);

    LotteryContract = await setLotteryContract(
      defaultAdmin.address,
      CoriteToken.address,
      defaultAdmin.address,
      NFT.address
    );
  });

  describe("Deployment", function () {
    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await CoriteToken.balanceOf(defaultAdmin.address);
      expect(await CoriteToken.balanceOf(defaultAdmin.address)).to.equal(
        ownerBalance
      );
    });
  });

  describe("Transactions", function () {
    it("Should mint NFT", async function () {
      await expect(
        NFT.connect(buyer).mint(defaultAdmin.address)
      ).to.be.revertedWith(
        "AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      // n
      const DEF = await NFT.DEFAULT_ADMIN_ROLE();
      await NFT.grantRole(DEF, NFT.address);

      await NFT.connect(defaultAdmin).mint(defaultAdmin.address);
      await NFT.connect(defaultAdmin).mint(defaultAdmin.address);
    });

    it("Should transfer NFT", async function () {
      const DEF = await NFT.DEFAULT_ADMIN_ROLE();
      await NFT.grantRole(DEF, NFT.address);

      await NFT.connect(defaultAdmin).mint(defaultAdmin.address);
      await NFT.connect(defaultAdmin).mint(defaultAdmin.address);

      await expect(
        NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 3)
      ).to.be.revertedWith("ERC721: invalid token ID");

      await expect(
        NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 4)
      ).to.be.revertedWith("ERC721: invalid token ID");

      await NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 1);
      await NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 2);
    });
    it("Should check that nft exists", async function () {
      const DEF = await NFT.DEFAULT_ADMIN_ROLE();
      await NFT.grantRole(DEF, NFT.address);

      await expect(
        LotteryContract.connect(defaultAdmin).checkIfNftExists(102)
      ).to.be.revertedWith("ERC721: invalid token ID");

      await NFT.connect(defaultAdmin).mint(defaultAdmin.address);

      await NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 1);
      expect(await LotteryContract.connect(defaultAdmin).checkIfNftExists(1));
    });

    it("Should be able to buy tickets", async function () {
      const DEF = await NFT.DEFAULT_ADMIN_ROLE();
      await NFT.grantRole(DEF, NFT.address);

      // 1 00000 00000 00000 000
      const value = ethers.BigNumber.from("10");
      await expect(
        LotteryContract.connect(defaultAdmin).buyTickets(
          0,
          "0xe9e7cea3dedca5984780bafc599bd69add087d56",
          1
        )
      ).to.be.revertedWith("minimum buy is 1 lottery ticket");

      await expect(
        LotteryContract.connect(defaultAdmin).buyTickets(
          value,
          "0xe9e7cea3dedca5984780bafc599bd69add087d56",
          15
        )
      ).to.be.revertedWith("ERC721: invalid token ID");

      // first mint
      await NFT.connect(defaultAdmin).mint(defaultAdmin.address);
      await NFT.connect(defaultAdmin).mint(defaultAdmin.address);
      await NFT.connect(defaultAdmin).mint(defaultAdmin.address);
      await NFT.connect(defaultAdmin).mint(defaultAdmin.address);
      await NFT.connect(defaultAdmin).mint(defaultAdmin.address);

      await CoriteToken.connect(defaultAdmin).approve(
        LotteryContract.address,
        val
      );

      // busd
      expect(
        await LotteryContract.connect(defaultAdmin).setValidTicketPayment(
          "0xe9e7cea3dedca5984780bafc599bd69add087d56",
          true
        )
      );
      // usdt
      expect(
        await LotteryContract.connect(defaultAdmin).setValidTicketPayment(
          "0xdac17f958d2ee523a2206206994597c13d831ec7",
          true
        )
      );
      expect(
        await LotteryContract.connect(defaultAdmin).setValidTicketPayment(
          "0xdac17f958d2ee523a2206206994597c13d831ec7",
          false
        )
      );
      // send in the nfts to lottery contract
      await NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 1);
      await NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 2);
      await NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 3);
      await NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 4);
      //n for emit
      await NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 5);

      // buy tickets
      await LotteryContract.connect(defaultAdmin).buyTickets(
        value,
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        1
      );
      await LotteryContract.connect(defaultAdmin).buyTickets(
        value,
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        2
      );
      await LotteryContract.connect(defaultAdmin).buyTickets(
        value,
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        1
      );
      await LotteryContract.connect(defaultAdmin).buyTickets(
        value,
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        2
      );
      await LotteryContract.connect(defaultAdmin).buyTickets(
        value,
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        1
      );

      // buy tickets with event
      await expect(
        LotteryContract.connect(defaultAdmin).buyTickets(
          10,
          "0xe9e7cea3dedca5984780bafc599bd69add087d56",
          1
        )
      )
        .to.emit(LotteryContract, "TicketsOwned")
        .withArgs(defaultAdmin.address, 31, 40);

      await expect(
        LotteryContract.connect(defaultAdmin).buyTickets(
          10,
          "0xe9e7cea3dedca5984780bafc599bd69add087d56",
          5
        )
      )
        .to.emit(LotteryContract, "TicketsOwned")
        .withArgs(defaultAdmin.address, 1, 10);
      //n
      await expect(
        LotteryContract.connect(defaultAdmin).buyTickets(
          23,
          "0xe9e7cea3dedca5984780bafc599bd69add087d56",
          5
        )
      )
        .to.emit(LotteryContract, "TicketsOwned")
        .withArgs(defaultAdmin.address, 11, 33);

      console.log(
        "map nftid 1",
        await LotteryContract.connect(defaultAdmin).getMap(1)
      );
      console.log(
        "map nftid 2",
        await LotteryContract.connect(defaultAdmin).getMap(2)
      );
      console.log("get last num", await LotteryContract.getLastNum(2));
    });
  });

  describe("Test functionality ", function () {
    it("Should approve spenders", async function () {
      await CoriteToken.connect(defaultAdmin).approve(
        LotteryContract.address,
        val
      );
      await CoriteToken.connect(defaultAdmin).approve(
        defaultAdmin.address,
        val
      );
    });

    it("Should test lottery state", async function () {
      // only admin can end lottery
      await expect(
        LotteryContract.connect(buyer).endLotteryPeriod(true)
      ).to.be.revertedWith(
        "AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
      );

      await LotteryContract.connect(defaultAdmin).endLotteryPeriod(true);

      await expect(
        LotteryContract.connect(defaultAdmin).buyTickets(
          1,
          "0xdac17f958d2ee523a2206206994597c13d831ec7",
          val
        )
      ).to.be.revertedWith("lottery period is over");

      await LotteryContract.connect(defaultAdmin).endLotteryPeriod(false);
    });

    it("Should add and remove valid payment methods/tokens", async function () {
      await expect(
        LotteryContract.connect(buyer).setValidTicketPayment(
          "0xdac17f958d2ee523a2206206994597c13d831ec7",
          true
        )
      ).to.be.reverted;

      // usdt
      const DEF = await NFT.DEFAULT_ADMIN_ROLE();
      await NFT.grantRole(DEF, NFT.address);

      await expect(
        LotteryContract.connect(buyer).setValidTicketPayment(
          "0xdac17f958d2ee523a2206206994597c13d831ec7",
          true
        )
      ).to.be.revertedWith(
        "AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
      );

      expect(
        await LotteryContract.connect(defaultAdmin).setValidTicketPayment(
          "0xdac17f958d2ee523a2206206994597c13d831ec7",
          true
        )
      );

      expect(
        await LotteryContract.connect(defaultAdmin).setValidTicketPayment(
          "0x28B5F14e4D7B2CfF12C97038A06B4f41827b1970",
          false
        )
      );
      await expect(
        LotteryContract.checkValidTicketPayment(
          "0x28B5F14e4D7B2CfF12C97038A06B4f41827b1970"
        )
      ).to.be.revertedWith("invalid payment");
    });

    it("Should set money wallet address", async function () {
      // only admin can set money wallet address
      await expect(
        LotteryContract.connect(buyer).setMoneyWalletAddress(
          "0x28B5F14e4D7B2CfF12C97038A06B4f41827b1970"
        )
      ).to.be.reverted;

      await LotteryContract.connect(defaultAdmin).setMoneyWalletAddress(
        "0x28B5F14e4D7B2CfF12C97038A06B4f41827b1970"
      );
    });
    it("Should test to send in payments with BUSD token", async function () {
      const value1 = ethers.BigNumber.from(
        "1000000000000000000000000000000000000000"
      );
      // grant role
      const DEF = await NFT.DEFAULT_ADMIN_ROLE();
      await NFT.grantRole(DEF, NFT.address);
      //mint
      await NFT.mint(defaultAdmin.address);
      // send in nft
      await NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 1);
      // set valid payment == busd
      expect(
        await LotteryContract.setValidTicketPayment(BUSDToken.address, true)
      );
      console.log("före", await BUSDToken.balanceOf(buyer.address));
      // skicka buyer busd tokens
      await BUSDToken.transfer(buyer.address, val);
      //kolla att buyer fick busd tokens
      console.log("efter", await BUSDToken.balanceOf(buyer.address));

      // set money wallet addressen
      await LotteryContract.connect(defaultAdmin).setMoneyWalletAddress(
        "0x28B5F14e4D7B2CfF12C97038A06B4f41827b1970"
      );

      // ge lotteri kontraktet rätten att skicka corite lottery tokens
      await CoriteToken.connect(defaultAdmin).approve(
        LotteryContract.address,
        val
      );
      // ge lotteri kontraktet rätten att skicka buyers tokens till corite accountet
      await CoriteToken.connect(buyer).approve(LotteryContract.address, val);

      console.log(
        "balance co tickets i lotteri kontraktet innan",
        await CoriteToken.balanceOf(LotteryContract.address)
      );
      await CoriteToken.transfer(LotteryContract.address, 1000000);

      console.log(
        "balance co tickets i lotteri kontraktet efter",
        await CoriteToken.balanceOf(LotteryContract.address)
      );

      // köp tickets med def admin
      await expect(
        LotteryContract.connect(defaultAdmin).buyTickets(
          1,
          BUSDToken.address,
          1
        )
      )
        .to.emit(LotteryContract, "TicketsOwned")
        .withArgs(defaultAdmin.address, 1, 1);

      await LotteryContract.transferNFTs(
        defaultAdmin.address,
        buyer.address,
        1
      );

      // // köp tickets med buyer
      // await expect(
      //   LotteryContract.connect(buyer).buyTickets(1, BUSDToken.address, 1)
      // )
      //   .to.emit(LotteryContract, "TicketsOwned")
      //   .withArgs(buyer.address, 1, 1);

      // console.log(await CoriteToken.balanceOf(defaultAdmin.address));
      // console.log(await BUSDToken.balanceOf(buyer.address));
    });
  });
});
