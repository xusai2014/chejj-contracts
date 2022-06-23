// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";

contract NewsChampion is
Initializable,
ERC20Upgradeable,
ERC20BurnableUpgradeable,
PausableUpgradeable,
OwnableUpgradeable
{
    IERC721EnumerableUpgradeable public news;
    IERC20Upgradeable public niu;
    uint256 public gPrice;
    uint256 public sPrice;
    mapping(uint256 => address) public newsOwner;
    mapping(address => uint256) public niuBalance;
    address private _signer;
    mapping(bytes32 => bool) public claimed;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(
        address news_,
        address niu_,
        uint256 gPrice_,
        uint256 sPrice_,
        address signer_
    ) public initializer {
        __ERC20_init("ChejjNewsToken", "nNiu");
        __ERC20Burnable_init();
        __Pausable_init();
        __Ownable_init();
        news = IERC721EnumerableUpgradeable(news_);
        niu = IERC20Upgradeable(niu_);
        gPrice = gPrice_;
        sPrice = sPrice_;
        _signer = signer_;
    }

    function depositNews(uint256 tokenId) external whenNotPaused {
        news.transferFrom(msg.sender, address(this), tokenId);
        newsOwner[tokenId] = msg.sender;
        _mint(msg.sender, gPrice * 1e18);
    }

    function depositNiu(uint256 amount) external whenNotPaused {
        niu.transferFrom(msg.sender, address(this), amount);
        _mint(msg.sender, (amount * sPrice) / 10000);
    }

    function withdrawNews(uint256 tokenId) external whenNotPaused {
        require(newsOwner[tokenId] == msg.sender, "CC: Not owner");
        uint256 amount = gPrice * 1e18;
        require(balanceOf(msg.sender) >= amount, "CC: Insufficient balance");
        delete newsOwner[tokenId];
        burn(amount);
        news.transferFrom(address(this), msg.sender, tokenId);
    }

    function withdrawNiu(uint256 amount) external whenNotPaused {
        uint256 sAmount = (amount * 10000) / sPrice;
        require(balanceOf(msg.sender) >= amount, "CC: Insufficient balance");
        burn(amount);
        niu.transfer(msg.sender, sAmount);
    }

    function claim(
        string[] calldata projects,
        uint256[] calldata amounts,
        bytes32[] calldata tickets,
        uint256[] calldata timestamps,
        bytes[] calldata signatures
    ) external whenNotPaused {
        require(
            projects.length == amounts.length &&
            projects.length == tickets.length &&
            projects.length == timestamps.length &&
            projects.length == signatures.length,
            "CC: bad params"
        );
        for (uint256 i = 0; i < projects.length; i++) {
            require(
                verify(
                    msg.sender,
                    projects[i],
                    amounts[i],
                    tickets[i],
                    timestamps[i],
                    signatures[i]
                ),
                "CC: bad signatures"
            );
            claimed[tickets[i]] = true;
            niu.transfer(msg.sender, amounts[i]);
        }
    }

    function newsBalanceOf(address owner)
    external
    view
    returns (uint256[] memory)
    {
        uint256[] memory tokens = new uint256[](news.balanceOf(owner));
        uint256 totalSupply = news.totalSupply();
        uint256 j;
        for (uint256 i = 0; j < tokens.length && i < totalSupply; i++) {
            if (news.ownerOf(i) == owner) {
                tokens[j++] = i;
            }
            if (j == tokens.length) {
                break;
            }
        }
        return tokens;
    }

    function newsStaked(address owner)
    external
    view
    returns (uint256[] memory)
    {
        uint256 totalSupply = news.totalSupply();
        uint256[] memory tokens = new uint256[](totalSupply);
        uint256 j;
        for (uint256 i = 0; i < totalSupply; i++) {
            if (newsOwner[i] == owner) {
                tokens[j++] = i;
            }
        }
        uint256[] memory ret = new uint256[](j);
        for (uint256 i = 0; i < j; i++) {
            ret[i] = tokens[i];
        }
        return ret;
    }

    function verify(
        address to,
        string calldata id,
        uint256 amount,
        bytes32 ticket,
        uint256 timestamp,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 message = prefixed(
            keccak256(abi.encodePacked(to, id, amount, ticket, timestamp))
        );
        return recoverSigner(message, signature) == _signer;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setSigner(address newSigner) public onlyOwner {
        _signer = newSigner;
    }

    function splitSignature(bytes memory sig)
    internal
    pure
    returns (
        uint8 v,
        bytes32 r,
        bytes32 s
    )
    {
        require(sig.length == 65);

        assembly {
        // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
        // second 32 bytes.
            s := mload(add(sig, 64))
        // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function recoverSigner(bytes32 message, bytes memory sig)
    internal
    pure
    returns (address)
    {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }

    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return
        keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
