// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../interfaces/ICNR.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter tokenIdCounter;
    Counters.Counter tokenIdCounterFod;

    ICNR CNR;

    uint256 mintCap = 101;
    uint256 totalSupply;

    //ICNR _CNR
    constructor(address _default_admin_role) ERC721("", "") {
        _setupRole(DEFAULT_ADMIN_ROLE, _default_admin_role);
        // CNR = _CNR;
    }

    function mint(address _to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(tokenIdCounter.current() < mintCap, "Can only mint 202 nfts");
        tokenIdCounter.increment();
        uint256 tokenId = tokenIdCounter.current();
        totalSupply++;
        _safeMint(_to, tokenId);
    }

    function mintProducers(address _to, uint256 _amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        for (uint256 i = 0; i < _amount; i++) {
            require(_amount <= mintCap, "Can only mint 101 nfts");
            tokenIdCounter.increment();
            uint256 tokenId = tokenIdCounter.current();
            totalSupply++;
            _safeMint(_to, tokenId);
        }
    }

    function mintFoD(address _to, uint256 _amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        for (uint256 i = 0; i < _amount; i++) {
            require(_amount <= mintCap, "Can only mint 101 nfts");
            tokenIdCounterFod.increment();
            uint256 tokenId = tokenIdCounterFod.current() + 1000;
            totalSupply++;
            _safeMint(_to, tokenId);
        }
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return ICNR(CNR).getNFTURI(address(this), _tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
