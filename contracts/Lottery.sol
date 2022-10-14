// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "../contracts/CoriteTokenTestERC20.sol";

contract Lottery is AccessControl {
    event TicketsOwned(address buyer, uint256 startTicket, uint256 endTicket);
    event validTokenPayment(address admin, bool);

    struct LotteryStruct {
        address buyer;
        uint256 first;
        uint256 last;
        uint256 numOfTickets;
    }

    // set a  roof for tickets like 1000 per artist
    mapping(uint256 => LotteryStruct[]) public tokenIdToLotteryArray;

    mapping(address => bool) public validTokenPayments;
    mapping(uint256 => uint256) public getLastNum;
    bool public lotteryPeriodEnded;
    uint256 private minPrice = 10**18;
    address private moneyWallet;

    IERC20 public token;
    IERC721 public nft;
    CoriteToken T;

    constructor(
        address _default_admin_role,
        CoriteToken _T,
        address _moneyWallet,
        IERC721 _nft
    ) {
        _setupRole(DEFAULT_ADMIN_ROLE, _default_admin_role);
        T = _T;
        moneyWallet = _moneyWallet;
        nft = _nft;
    }

    function buyTickets(
        uint256 _amount,
        address _tokenAddress,
        uint256 _nftId
    ) public {
        require(!lotteryPeriodEnded, "lottery period is over");
        require(_amount >= 1, "minimum buy is 1 lottery ticket");
        // add server sig
        checkIfNftExists(_nftId);
        checkValidTicketPayment(_tokenAddress);

        tokenIdToLotteryArray[_nftId].push(
            LotteryStruct(
                msg.sender,
                getLastNum[_nftId] + 1,
                getLastNum[_nftId] + _amount,
                _amount
            )
        );

        getLastNum[_nftId] += _amount;

        T.transferFrom(msg.sender, moneyWallet, _amount * minPrice);

        emit TicketsOwned(
            msg.sender,
            getLastNum[_nftId] - _amount + 1,
            getLastNum[_nftId]
        );
    }

    function transferNFTs(
        address _from,
        address _to,
        uint256 _tokenId
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        T.transferFrom(_from, _to, _tokenId);
    }

    // ifall corite vill skicka tokens till någon av någon anledning
    // bort nu när vi inte ska köpa med tokens
    function transferTokens(
        address _token,
        address _to,
        uint256 _amount
    ) external {
        IERC20(_token).transfer(_to, _amount);
    }

    function setValidTicketPayment(address _tokenAddress, bool _validToken)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        validTokenPayments[_tokenAddress] = _validToken;
        emit validTokenPayment(_tokenAddress, _validToken);
    }

    function checkValidTicketPayment(address _tokenAddress) public view {
        require(validTokenPayments[_tokenAddress] == true, "invalid payment");
    }

    function checkIfNftExists(uint256 _nftId) public view returns (bool) {
        require(
            nft.ownerOf(_nftId) == address(this),
            "contract does not hold the nft"
        );
        return true;
    }

    function endLotteryPeriod(bool _lotteryPeriodEnded)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        lotteryPeriodEnded = _lotteryPeriodEnded;
    }

    //claimnft function
    function claimNFT(address _claimerAddress, uint256 _tokenId) external {}

    function setMoneyWalletAddress(address _moneyWallet)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        moneyWallet = _moneyWallet;
    }

    function getMap(uint256 _nftId)
        public
        view
        returns (LotteryStruct[] memory)
    {
        return tokenIdToLotteryArray[_nftId];
    }

    function selfDestruct(address _sendFundsTo)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        selfdestruct(payable(_sendFundsTo));
    }
}
