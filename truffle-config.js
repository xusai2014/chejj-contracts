/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * https://trufflesuite.com/docs/truffle/reference/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

// const HDWalletProvider = require('@truffle/hdwallet-provider');
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();
const HDWalletProvider = require("truffle-hdwallet-provider");
const fs = require('fs');

function mnemonic() {
  try {
    return fs.readFileSync("./mnemonic.txt").toString().trim();
  } catch (e) {
    console.log(
        "☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`."
    );
  }
  return "";
}
const mnemonic_str = mnemonic();

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache, geth, or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 7545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
    rinkeby: {
      networkCheckTimeout: 1000000,
      // provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/` + infuraKey),
      provider: () => new HDWalletProvider(mnemonic_str, 'https://eth-rinkeby.alchemyapi.io/v2/o97t68XYmkk7qnGyMg8MeDGGFHc4HwDL'),
      network_id: 4,       // Rinkeby's id
      // gas: 5500000,        // Rinkeby has a lower block limit than mainnet
      // type: 2,
      maxFeePerGas: 1600000000,         // use maxFeePerGas and maxPriorityFeePerGas if creating type 2 transactions (https://eips.ethereum.org/EIPS/eip-1559)
      maxPriorityFeePerGas: 1600000000, //
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200000,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true,    // Skip dry run before migrations? (default: false for public nets )
      disableConfirmationListener: true,

      // optional config values:
      // gas                  - use gas and gasPrice if creating type 0 transactions
      // gasPrice             - all gas values specified in wei
      // maxFeePerGas         - use maxFeePerGas and maxPriorityFeePerGas if creating type 2 transactions (https://eips.ethereum.org/EIPS/eip-1559)
      // maxPriorityFeePerGas -
      // from - default address to use for any transaction Truffle makes during migrations
      // provider - web3 provider instance Truffle should use to talk to the Ethereum network.
      //          - function that returns a web3 provider instance (see below.)
      //          - if specified, host and port are ignored.
      // production: - set to true if you would like to force a dry run to be performed every time you migrate using this network (default: false)
      //             - during migrations Truffle performs a dry-run if you are deploying to a 'known network'
      // skipDryRun: - set to true if you don't want to test run the migration locally before the actual migration (default: false)
      // confirmations: - number of confirmations to wait between deployments (default: 0)
      // timeoutBlocks: - if a transaction is not mined, keep waiting for this number of blocks (default: 50)
      // deploymentPollingInterval: - duration between checks for completion of deployment transactions
      // networkCheckTimeout: - amount of time for Truffle to wait for a response from the node when testing the provider (in milliseconds)
      //                      - increase this number if you have a slow internet connection to avoid connection errors (default: 5000)
      // disableConfirmationListener: - set to true to disable web3's confirmation listener
    },
    // Another network with more advanced options...
    // advanced: {
    // port: 8777,             // Custom port
    // network_id: 1342,       // Custom network
    // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
    // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
    // from: <address>,        // Account to send txs from (default: accounts[0])
    // websocket: true        // Enable EventEmitter interface for web3 (default: false)
    // },
    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    // ropsten: {
    // provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/YOUR-PROJECT-ID`),
    // network_id: 3,       // Ropsten's id
    // gas: 5500000,        // Ropsten has a lower block limit than mainnet
    // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    // },
    // Useful for private networks
    // private: {
    // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
    // network_id: 2111,   // This network is yours, in the cloud.
    // production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.4",      // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: true,
         runs: 200
       },
      //  evmVersion: "byzantium"
      }
    }
  },

  // Truffle DB is currently disabled by default; to enable it, change enabled:
  // false to enabled: true. The default storage location can also be
  // overridden by specifying the adapter settings, as shown in the commented code below.
  //
  // NOTE: It is not possible to migrate your contracts to truffle DB and you should
  // make a backup of your artifacts to a safe location before enabling this feature.
  //
  // After you backed up your artifacts you can utilize db by running migrate as follows:
  // $ truffle migrate --reset --compile-all
  //
  // db: {
    // enabled: false,
    // host: "127.0.0.1",
    // adapter: {
    //   name: "sqlite",
    //   settings: {
    //     directory: ".db"
    //   }
    // }
  // }
    plugins: ["truffle-contract-size"]
};
