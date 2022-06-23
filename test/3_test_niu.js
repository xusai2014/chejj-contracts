const truffleAssert = require('truffle-assertions');
const { assert } = require("chai");
const { default: BigNumber } = require("bignumber.js");
const SeeDAOToken = artifacts.require('SeeDAOToken');
const Combinator = artifacts.require('Combinator');

const SEE_PRICE = new BigNumber(1e19);

contract("SEED", async accounts => {
    it('Deposit and withdraw $SEE correctly', async () => {
        const see = await SeeDAOToken.deployed();
        console.log("SeeDAO Token address: %s", see.address);
        const combinator = await Combinator.deployed();
        console.log("Combinator address: %s", combinator.address);

        const account = accounts[1];
        const amount = new BigNumber(1e18);
        await see.mint(account, amount, { from: accounts[0] });
        let sBalance = await see.balanceOf(account);
        console.log("Acount 1 minted %s $SEE", web3.utils.fromWei(sBalance));
        assert.equal(sBalance.toString(), amount.toString(), "Initial alance wrong");
        await see.approve(combinator.address, amount, { from: account });
        await truffleAssert.reverts(
            combinator.depositSee(amount, { from: account }),
            "AccessControl: account "
        );
        await see.addAdmin(combinator.address);
        await combinator.depositSee(amount, { from: account });
        sBalance = await see.balanceOf(account);
        assert.equal(sBalance.toString(), "0", "Account 1 should have no $SEE balance now");
        sBalance = await see.balanceOf(combinator.address);
        assert.equal(sBalance.toString(), amount.toString(), "Combinator has all $SEE balance now");
        let cBalance = await combinator.balanceOf(account);
        console.log("Deposit $SEE token, got %s $cSEE", web3.utils.fromWei(cBalance));
        assert.equal(cBalance.toString(), SEE_PRICE.toString(), "Balance wrong");

        await see.delAdmin(combinator.address);
        await truffleAssert.reverts(
            combinator.withdrawSee(cBalance, { from: account }),
            "AccessControl: account "
        );
        await see.addAdmin(combinator.address);
        await combinator.withdrawSee(cBalance, { from: account });
        sBalance = await see.balanceOf(account);
        assert.equal(sBalance.toString(), amount.toString(), "Initial balance wrong");
        cBalance = await combinator.balanceOf(account);
        console.log("Withdraw $SEE token, got balance: ", cBalance.toString());
        assert.equal(cBalance.toString(), "0", "Balance wrong");
    });
});