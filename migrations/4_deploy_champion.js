const NFT = artifacts.require("NewsNFT");
const Token = artifacts.require("NiuToken");
const Combinator = artifacts.require("NewsChampion");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer) {
    const genesis = await NFT.deployed();
    const see = await Token.deployed();
    await deployProxy(
        Combinator,
        [
            genesis.address,
            see.address,
            200,
            100000,
            // signer
            "0xfeeAf035243ef6ab9f127c8D525cCA1CC359fc2A",
        ],
        {
            deployer
        }
    )
};
