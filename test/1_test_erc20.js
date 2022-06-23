const truffleAssert = require('truffle-assertions');
const { assert } = require("chai");
const { default: BigNumber } = require("bignumber.js");
const NewsNFT = artifacts.require('NewsNFT');
const NiuToken = artifacts.require('NiuToken');
const NewsChampion = artifacts.require('NewsChampion');

const NAME = 'NewsChampion';
const SYMBOL = "nNiu";

contract("NewsChampion (development)", async accounts => {
    it('Print account balance', async () => {
        for (var i = 0; i < 10; i++) {
            let balance = await web3.eth.getBalance(accounts[i]);
            console.log("[%d] %s Balance: %s", i, accounts[i], balance.toString());
        }
    });
    it('Initialized correctly', async () => {
        const token = await NiuToken.deployed();
        console.log("NiuToken address: %s", token.address);
        const genesis = await NewsNFT.deployed();
        console.log("NewsNFT address: %s", genesis.address);
        const newsChampion = await NewsChampion.deployed();
        console.log("NewsChampion address: %s", combinator.address);
        const name = await newsChampion.name.call();
        // console.log("Name:", name);
        assert.equal(name, NAME, "name wrong");
        const symbol = await newsChampion.symbol.call();
        // console.log("Symbol:", symbol);
        assert.equal(symbol, SYMBOL, "name wrong");

        let paused = await newsChampion.paused.call();
        // console.log("Paused: ", paused);
        assert.equal(paused, false, "Status paused should be false");
        let nftAddress = await newsChampion.news.call();
        assert.equal(nftAddress, genesis.address, "Genesis address wrong");
        let tokenAddress = await newsChampion.niu.call();
        assert.equal(tokenAddress, token.address, "Token address wrong");
    });
    it('Public mint correctly', async () => {

    });
});
