const truffleAssert = require('truffle-assertions');
const { assert } = require("chai");
const { default: BigNumber } = require("bignumber.js");
const NewsNFT = artifacts.require('NewsNFT');
const NewsChampion = artifacts.require('NewsChampion');

const GENESIS_PRICE = new BigNumber(200e18);

contract("Combinator (development)", async accounts => {
    it('Deposit and withdraw NFT correctly', async () => {
        const newsNFT = await NewsNFT.deployed();
        console.log("SeeDAOGenesis address: %s", newsNFT.address);
        const newsChampion = await NewsChampion.deployed();
        console.log("Combinator address: %s", newsChampion.address);

        const account = accounts[1];
        await newsNFT.mint(account, 1, { from: accounts[0] });
        let owner = await newsNFT.ownerOf(0);
        assert.equal(owner, account, "Owner should be account[1]");
        await newsNFT.approve(newsChampion.address, 0, { from: account });
        await newsChampion.depositGenesis(0, { from: account });
        owner = await newsNFT.ownerOf(0);
        assert.equal(owner, newsChampion.address, "Owner should be combinator now");
        let balance = await newsChampion.balanceOf(account);
        console.log("Deposit token 0, got balance: ", balance.toString());
        assert.equal(balance.toString(), GENESIS_PRICE.toString(), "Balance wrong");

        await newsChampion.withdrawGenesis(0, { from: account });
        owner = await newsNFT.ownerOf(0);
        assert.equal(owner, account, "Owner should be account[1] again");
        balance = await newsChampion.balanceOf(account);
        console.log("Withdraw token 0, got balance: ", balance.toString());
        assert.equal(balance.toString(), "0", "Balance wrong");
    });
    it('Find NFT tokenId correctly', async () => {
        const newsNFT = await NewsNFT.deployed();
        const newsChampion = await NewsChampion.deployed();
        const account = accounts[1];
        let tokens = await newsChampion.genesisBalanceOf(account);
        console.log("Balance before: ", tokens.length);
        for (var i = 0; i < tokens.length; i++) {
            console.log("%d: %s", i, tokens[i].toString());
        }

        await newsNFT.mint(account, 1, { from: accounts[0] });
        tokens = await newsChampion.genesisBalanceOf(account);
        console.log("Balance after", tokens.length);
        for (var i = 0; i < tokens.length; i++) {
            console.log("%d: %s", i, tokens[i].toString());
        }
        await newsNFT.mint(account, 1, { from: accounts[0] });
        tokens = await newsChampion.genesisBalanceOf(account);
        console.log("Balance after", tokens.length);
        for (var i = 0; i < tokens.length; i++) {
            console.log("%d: %s", i, tokens[i].toString());
        }
        await newsNFT.mint(accounts[2], 1, { from: accounts[0] });
        tokens = await newsChampion.genesisBalanceOf(account);
        console.log("Balance after", tokens.length);
        for (var i = 0; i < tokens.length; i++) {
            console.log("%d: %s", i, tokens[i].toString());
        }
    });
});
