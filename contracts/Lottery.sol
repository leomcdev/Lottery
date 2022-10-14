// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";

contract Lottery is AccessControl {
    event TicketsOwned(
        address buyer,
        uint256 nftId,
        uint256 amount,
        address tokenAddress,
        uint256 ticketsBought
    );
    event validTokenPayment(address admin, bool);
    event NFTClaimed(address by, address from, uint256 tokenId);
    bytes32 public constant ADMIN = keccak256("ADMIN");

    struct LotteryStruct {
        address buyer;
        uint256 numOfTickets;
    }

    mapping(address => uint256) internalNonce;

    mapping(uint256 => LotteryStruct[]) public tokenIdToLotteryArray;
    mapping(address => bool) public validTokenPayments;

    bool public lotteryPeriodEnded;
    address private moneyWallet;
    IERC721 public nft;

    address public serverPubKey;

    constructor(
        address _default_admin_role,
        address _moneyWallet,
        IERC721 _nft
    ) {
        _setupRole(DEFAULT_ADMIN_ROLE, _default_admin_role);
        moneyWallet = _moneyWallet;
        nft = _nft;
    }

    // lägg till så att man inte kan skicka till address 0
    // lägg till så att pengar inte kan försivnna

    function buyTickets(
        uint256 _amount,
        address _tokenAddress,
        uint256 _nftId,
        uint256 ticketsBought,
        bytes memory _prefix,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) public {
        require(!lotteryPeriodEnded, "lottery period is over");
        require(_amount >= 1, "minimum buy is 1 lottery ticket");

        // add server sig
        bytes memory message = abi.encode(
            msg.sender,
            _amount,
            _tokenAddress,
            _nftId,
            ticketsBought,
            internalNonce[msg.sender]
        );
        require(
            ecrecover(
                keccak256(abi.encodePacked(_prefix, message)),
                _v,
                _r,
                _s
            ) == serverPubKey,
            "Signature invalid"
        );
        internalNonce[msg.sender]++;

        checkIfNftExists(_nftId);
        checkValidTicketPayment(_tokenAddress);

        tokenIdToLotteryArray[_nftId].push(LotteryStruct(msg.sender, _amount));

        IERC721(_tokenAddress).transferFrom(msg.sender, moneyWallet, _amount);

        emit TicketsOwned(
            msg.sender,
            _nftId,
            _amount,
            _tokenAddress,
            ticketsBought
        );
    }

    function claimNFT(
        uint256 _tokenId,
        bytes memory _prefix,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external {
        bytes memory message = abi.encode(
            msg.sender,
            _tokenId,
            internalNonce[msg.sender]
        );
        require(
            ecrecover(
                keccak256(abi.encodePacked(_prefix, message)),
                _v,
                _r,
                _s
            ) == serverPubKey,
            "Invalid signature"
        );
        internalNonce[msg.sender]++;
        emit NFTClaimed(address(this), msg.sender, _tokenId);
        nft.transferFrom(address(this), msg.sender, _tokenId);
    }

    function transferNFTs(
        address _from,
        address _to,
        uint256 _tokenId
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        nft.transferFrom(_from, _to, _tokenId);
    }

    function updateServer(address _serverPubKey)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        serverPubKey = _serverPubKey;
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

    function selfDestruct(address _sendFundsTo)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        selfdestruct(payable(_sendFundsTo));
    }
}
