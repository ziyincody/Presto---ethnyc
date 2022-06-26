// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract CustomNFT is ERC721Enumerable {
    using SafeMath for uint256;

    uint256 public mintedSupply;
    uint256 public maxSupply;

    mapping(uint256 => address) public nftToOwner;

    constructor(uint256 _maxSupply) ERC721("avatarNFT", "AVATAR") {
        maxSupply = _maxSupply;
    }

    // Will probably need this for updating
    modifier isOwnerOf(uint256 avatarId) {
        require(msg.sender == nftToOwner[avatarId]);
        _;
    }

    function mint() public payable {
        require(mintedSupply < maxSupply, "Sold out");

        _safeMint(msg.sender, mintedSupply + 1);
        mintedSupply += 1;
    }
}
