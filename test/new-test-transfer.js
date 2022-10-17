const { NftFilters } = require("@alch/alchemy-web3");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const totalSupply = ethers.BigNumber.from("10000000000000000000000");
const valBUSD = ethers.BigNumber.from("100000000000000000000000");

var defaultAdmin, owner, buyer, investor, server;

async function setBUSDToken(totalSupply) {
  const BUSDToken = await ethers.getContractFactory("BUSD");
  const BUSDtoken = await BUSDToken.deploy(totalSupply);
  await BUSDtoken.deployed();
  return BUSDtoken;
}

async function setLotteryContract(_defaultAdmin, _moneyWallet, _nft) {
  const Lottery = await ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy(_defaultAdmin, _moneyWallet, _nft);
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
  var BUSDToken;
  var LotteryContract;
  var NFT;

  beforeEach(async function () {
    [defaultAdmin, walletMoneyAddress, buyer, server, investor] =
      await ethers.getSigners();
    console.log("def admin", defaultAdmin.address);
    console.log("walletmoney adr", walletMoneyAddress.address);
    console.log("buyr adr", buyer.address);

    NFT = await setNFT(defaultAdmin.address);
    BUSDToken = await setBUSDToken(totalSupply);

    LotteryContract = await setLotteryContract(
      defaultAdmin.address,
      defaultAdmin.address,
      NFT.address
    );
  });

  // describe("Transactions", function () {
  //   it("Should mint NFT", async function () {
  //     await expect(
  //       NFT.connect(buyer).mint(defaultAdmin.address)
  //     ).to.be.revertedWith(
  //       "AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
  //     );
  //     const DEF = await NFT.DEFAULT_ADMIN_ROLE();
  //     await NFT.grantRole(DEF, NFT.address);

  //     await NFT.connect(defaultAdmin).mint(defaultAdmin.address);
  //     await NFT.connect(defaultAdmin).mint(defaultAdmin.address);
  //   });

  //     // it("Should transfer NFT", async function () {
  //     //   const DEF = await NFT.DEFAULT_ADMIN_ROLE();
  //     //   await NFT.grantRole(DEF, NFT.address);

  //     //   await NFT.connect(defaultAdmin).mint(defaultAdmin.address);
  //     //   await NFT.connect(defaultAdmin).mint(defaultAdmin.address);

  //     //   await expect(
  //     //     NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 3)
  //     //   ).to.be.revertedWith("ERC721: invalid token ID");

  //     //   await expect(
  //     //     NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 4)
  //     //   ).to.be.revertedWith("ERC721: invalid token ID");

  //     //   await NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 1);
  //     //   await NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 2);
  //     // });
  //     //   it("Should check that nft exists", async function () {
  //     //     const DEF = await NFT.DEFAULT_ADMIN_ROLE();
  //     //     await NFT.grantRole(DEF, NFT.address);

  //     //     await expect(
  //     //       LotteryContract.connect(defaultAdmin).checkIfNftExists(102)
  //     //     ).to.be.revertedWith("ERC721: invalid token ID");

  //     //     await NFT.connect(defaultAdmin).mint(defaultAdmin.address);

  //     //     await NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 1);
  //     //     expect(await LotteryContract.connect(defaultAdmin).checkIfNftExists(1));
  //     //   });
  // });

  //     // describe("Test functionality ", function () {
  //     //   it("Should approve spenders", async function () {
  //     //     await CoriteToken.connect(defaultAdmin).approve(
  //     //       LotteryContract.address,
  //     //       val
  //     //     );
  //     //     await CoriteToken.connect(defaultAdmin).approve(
  //     //       defaultAdmin.address,
  //     //       val
  //     //     );
  //     //   });

  //     it("Should test lottery state", async function () {
  //       // only admin can end lottery
  //       await expect(
  //         LotteryContract.connect(buyer).endLotteryPeriod(true)
  //       ).to.be.revertedWith(
  //         "AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
  //       );

  //       await LotteryContract.connect(defaultAdmin).endLotteryPeriod(true);

  //       // await expect(
  //       //   LotteryContract.connect(defaultAdmin).buyTickets(
  //       //     1,
  //       //     "0xdac17f958d2ee523a2206206994597c13d831ec7",
  //       //     val
  //       //   )
  //       // ).to.be.revertedWith("lottery period is over");

  //       await LotteryContract.connect(defaultAdmin).endLotteryPeriod(false);
  //     });

  //     it("Should add and remove valid payment methods/tokens", async function () {
  //       await expect(
  //         LotteryContract.connect(buyer).setValidTicketPayment(
  //           "0xdac17f958d2ee523a2206206994597c13d831ec7",
  //           true
  //         )
  //       ).to.be.reverted;

  //       // usdt
  //       const DEF = await NFT.DEFAULT_ADMIN_ROLE();
  //       await NFT.grantRole(DEF, NFT.address);

  //       await expect(
  //         LotteryContract.connect(buyer).setValidTicketPayment(
  //           "0xdac17f958d2ee523a2206206994597c13d831ec7",
  //           true
  //         )
  //       ).to.be.revertedWith(
  //         "AccessControl: account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
  //       );

  //       expect(
  //         await LotteryContract.connect(defaultAdmin).setValidTicketPayment(
  //           "0xdac17f958d2ee523a2206206994597c13d831ec7",
  //           true
  //         )
  //       );

  //       expect(
  //         await LotteryContract.connect(defaultAdmin).setValidTicketPayment(
  //           "0x28B5F14e4D7B2CfF12C97038A06B4f41827b1970",
  //           false
  //         )
  //       );
  //       await expect(
  //         LotteryContract.checkValidTicketPayment(
  //           "0x28B5F14e4D7B2CfF12C97038A06B4f41827b1970"
  //         )
  //       ).to.be.revertedWith("invalid payment");
  //     });

  //     it("Should set money wallet address", async function () {
  //       // only admin can set money wallet address
  //       await expect(
  //         LotteryContract.connect(buyer).setMoneyWalletAddress(
  //           "0x28B5F14e4D7B2CfF12C97038A06B4f41827b1970"
  //         )
  //       ).to.be.reverted;

  //       await LotteryContract.connect(defaultAdmin).setMoneyWalletAddress(
  //         "0x28B5F14e4D7B2CfF12C97038A06B4f41827b1970"
  //       );
  //     });

  describe("Should buy tickets and claim nft with server sig ", function () {
    it("investor should buy tickets with server sig", async function () {
      // buy tickets
      // ADMIN = await LotteryContract.ADMIN();

      let obj = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint", "address", "uint", "uint", "uint"],
        [investor.address, 2, BUSDToken.address, 1, 2, 0]
      );
      const { prefix, v, r, s } = await createSignature(obj);
      await LotteryContract.updateServer(server.address);

      await BUSDToken.transfer(investor.address, 100);

      await NFT.connect(defaultAdmin).mint(defaultAdmin.address);
      await NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 1);

      await BUSDToken.connect(investor).approve(
        LotteryContract.address,
        1000000000
      );

      expect(
        await LotteryContract.setValidTicketPayment(BUSDToken.address, true)
      );

      await LotteryContract.connect(investor).buyTickets(
        2,
        BUSDToken.address,
        1,
        2,
        prefix,
        v,
        r,
        s
      );
      console.log(await BUSDToken.balanceOf(investor.address));
      expect(await BUSDToken.balanceOf(investor.address)).to.equal(98);

      // console.log(await LotteryContract.getMap(1));
      // obj = ethers.utils.defaultAbiCoder.encode(
      //   ["address", "uint", "address", "uint", "uint"],
      //   [defaultAdmin.address, 2, BUSDToken.address, 2, 2]
      // );
      // const { prefix1, v1, r1, s1 } = await createSignature(obj);

      // await LotteryContract.connect(defaultAdmin).buyTickets(
      //   2,
      //   BUSDToken.address,
      //   2,
      //   2,
      //   prefix1,
      //   v1,
      //   r1,
      //   s1
      // );
      // console.log(await LotteryContract.getMap(1));
    });
    it("should claim nft with server sig", async function () {
      const DEF = await NFT.DEFAULT_ADMIN_ROLE();
      await NFT.grantRole(DEF, LotteryContract.address);

      let obj = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint", "uint"],
        [defaultAdmin.address, 10, 0]
      );
      const { prefix, v, r, s } = await createSignature(obj);
      await LotteryContract.updateServer(server.address);

      // await NFT.connect(defaultAdmin).mint(defaultAdmin.address);
      // await NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 1);

      await NFT.connect(defaultAdmin).mintProducers(defaultAdmin.address, 101);

      await expect(
        LotteryContract.claimNFT(10, prefix, v, r, s)
      ).to.be.revertedWith("ERC721: caller is not token owner nor approved");

      console.log;
      expect(await NFT.balanceOf(defaultAdmin.address)).to.equal(101);
      await NFT.transferFrom(defaultAdmin.address, LotteryContract.address, 10);
      await LotteryContract.connect(defaultAdmin).claimNFT(10, prefix, v, r, s);
      // expect(await NFT.balanceOf(investor.address)).to.equal(1);
    });

    async function createSignature(obj) {
      obj = ethers.utils.arrayify(obj);
      const prefix = ethers.utils.toUtf8Bytes(
        "\x19Ethereum Signed Message:\n" + obj.length
      );
      const serverSig = await server.signMessage(obj);
      const sig = ethers.utils.splitSignature(serverSig);
      return { ...sig, prefix };
    }
  });
  it("Should mint nfts", async function () {
    const DEF = await NFT.DEFAULT_ADMIN_ROLE();
    await NFT.grantRole(DEF, LotteryContract.address);
    await expect(NFT.mintProducers(buyer.address, 203)).to.be.revertedWith(
      "Can only mint 101 nfts"
    );
    // console.log(await NFT.balanceOf(buyer.address));
    // await LotteryContract.connect(defaultAdmin).mintNfts(buyer.address, 201);
    // // await LotteryContract.connect(defaultAdmin).mintNfts(buyer.address, 1);
    // console.log(await NFT.balanceOf(buyer.address));
  });
  it("Should transfer nfts", async function () {
    await expect(
      NFT.connect(defaultAdmin).transferFrom(
        defaultAdmin.address,
        LotteryContract.address,
        1099
      )
    ).to.be.revertedWith("ERC721: invalid token ID");
    await expect(
      NFT.connect(defaultAdmin).mintFoD(defaultAdmin.address, 102)
    ).to.be.revertedWith("Can only mint 101 nfts");

    const DEF = await NFT.DEFAULT_ADMIN_ROLE();
    await NFT.grantRole(DEF, LotteryContract.address);
    await NFT.connect(defaultAdmin).mintFoD(LotteryContract.address, 101);
    console.log("bal", await NFT.balanceOf(LotteryContract.address));
    // await NFT.connect(defaultAdmin).transferFrom(
    //   defaultAdmin.address,
    //   LotteryContract.address,
    //   1099
    // );
    expect(await NFT.balanceOf(LotteryContract.address)).to.equal(101);
    await expect(
      NFT.connect(defaultAdmin).mintProducers(LotteryContract.address, 102)
    ).to.be.revertedWith("Can only mint 101 nfts");

    await NFT.connect(defaultAdmin).mintProducers(LotteryContract.address, 101);
    console.log("nft bal", await NFT.balanceOf(LotteryContract.address));
    expect(await NFT.ownerOf(1));
    expect(await NFT.balanceOf(LotteryContract.address)).to.equal(202);

    await LotteryContract.connect(defaultAdmin).transferNFTs(
      LotteryContract.address,
      defaultAdmin.address,
      [1]
    );
    //   await NFT.connect(defaultAdmin).transferFrom(
    //     defaultAdmin.address,
    //     LotteryContract.address,
    //     2
    //   );
    //   await expect(
    //     LotteryContract.connect(defaultAdmin).transferNFTs(
    //       LotteryContract.address,
    //       buyer.address,
    //       [1, 2]
    //     )
    //   )
    //     .to.emit(LotteryContract, "Transfer")
    //     .withArgs(LotteryContract.address, buyer.address, [1, 2]);
  });
});
