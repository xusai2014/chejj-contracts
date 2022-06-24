const NFT = artifacts.require("NewsNFT");
const Token = artifacts.require("NiuToken");
const NewsChampion = artifacts.require("NewsChampion");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer) {
    const genesis = await NFT.deployed();
    const see = await Token.deployed();
    await deployProxy(
        NewsChampion,
        [
            genesis.address,
            see.address,
            200,
            100000,
            // signer
            "0x35FC7103Bd824874b4c6bf258F086ec981739F7C",
        ],
        {
            deployer
        }
    )
};
