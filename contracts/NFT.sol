// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../interfaces/ICNR.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter tokenIdCounter;

    ICNR CNR;

    bytes32 public constant ASSET_PROVIDER = keccak256("ASSET_PROVIDER");

    uint256 totalSupply = 101;

    constructor(address _default_admin_role) ERC721("nft", "nft") {
        _setupRole(DEFAULT_ADMIN_ROLE, _default_admin_role);
    }

    function mint(address _to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            tokenIdCounter.current() <= totalSupply,
            "can only mint 101 nfts"
        );
        tokenIdCounter.increment();
        uint256 tokenId = tokenIdCounter.current();
        _safeMint(_to, tokenId);
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
