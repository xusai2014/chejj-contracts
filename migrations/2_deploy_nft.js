const NFT = artifacts.require("NewsNFT");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer) {
    await deployProxy(NFT, [], { deployer })
};
