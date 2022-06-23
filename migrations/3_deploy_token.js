const Token = artifacts.require("NiuToken");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer) {
    await deployProxy(Token, [], { deployer })
};
