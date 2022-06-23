const truffleAssert = require('truffle-assertions');
const { assert } = require("chai");
const { default: BigNumber } = require("bignumber.js");
const SeeDAOGenesis = artifacts.require('SeeDAOGenesis');
const Combinator = artifacts.require('Combinator');

const SEE_PRICE = new BigNumber(1e19);

contract("Combinator Staked SGN List", async accounts => {
    it('Deposit SGN correctly', async () => {
        const genesis = await SeeDAOGenesis.deployed();
        console.log("SeeDAOGenesis address: %s", genesis.address);
        const combinator = await Combinator.deployed();
        console.log("Combinator address: %s", combinator.address);

        const account = accounts[1];
        for (var i = 0; i < 10; i++) {
            await genesis.mint(account, 1, { from: accounts[0] });
            let owner = await genesis.ownerOf(i);
            assert.equal(owner, account, "Owner should be account[1]");
            await genesis.approve(combinator.address, i, { from: account });
            await combinator.depositGenesis(i, { from: account });
            let staked = await combinator.genesisStaked(account);
            console.log("[%d] staked: %s", i, JSON.stringify(staked));
        }
    });
});