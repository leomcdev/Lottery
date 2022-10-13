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
        require(_amount >= 1, "minimum buy is 1 lottery ticket"); // n
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
}
