const { version } = require("chai")

require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config() // Allows us to use .env files
//require("./tasks/block-number")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")
// ADDED hardhat-deploy-ethers by overwriting hardhat-ethers with the command: -------    yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers

/** @type import('hardhat/config').HardhatUserConfig */

// LOCAL NETWORK
const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL || "https://eth-sepolia"
const LOCAL_ACCOUNT1_KEY = process.env.LOCAL_ACCOUNT1_KEY || "0xKey"
LOCAL_CHAIN_ID = Number(process.env.LOCAL_CHAIN_ID) // pulls varialbe in as a string, so we convert to number
// ETH -SEPOLIA
const SEP_RPC_URL = process.env.SEP_RPC_URL || "something"
const SEP_ACCOUNT1_KEY = process.env.SEP_ACCOUNT1_KEY || "0xKey"
SEP_CHAIN_ID = Number(process.env.SEP_CHAIN_ID) || "something" // pulls varialbe in as a string, so we convert to number
// FLARE - COSTON2
const COSTON2_RPC_URL = process.env.COSTON2_RPC_URL
const COSTON2_ACCOUNT1_KEY = process.env.COSTON2_ACCOUNT1_KEY || "0xKey"
const COSTON2_CHAIN_ID = Number(process.env.COSTON2_CHAIN_ID) || "something" // pulls varialbe in as a string, so we convert to number

// ETHERSCAN
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "0xKey"

// COINMARKETCAP
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "something"

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {},
        sepolia: {
            url: SEP_RPC_URL,
            accounts: [SEP_ACCOUNT1_KEY],
            chainId: SEP_CHAIN_ID,
            blockConfirmations: 6,
        },
        coston2: {
            url: COSTON2_RPC_URL,
            accounts: [COSTON2_ACCOUNT1_KEY],
            chainId: COSTON2_CHAIN_ID,
            blockConfirmations: 1,
        },
        local: {
            url: LOCAL_RPC_URL,
            accounts: [LOCAL_ACCOUNT1_KEY], // Not neccesarily needed here. Hardhat provides us with 10 fake wallets to use on local host, with the accounts already know by hardhat
            chainId: LOCAL_CHAIN_ID,
            blockConfirmations: 1,
        },
    },
    // solidity: "0.8.8",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        // requires connection to network that allows access to ETHERSCAN!
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        //token : "ETH",
        //tokwn : "MATIC",
        token: "FLR",
    },
    Solcover: {
        matrixOutputPath: "test-matrix.json",
        abiOutputPath: "humanReadableAbis.json",
    },
    namedAccounts: {
        //
        deployer: {
            default: 0, // As defualt use account index 0
            //            4: 1,        // If on chain ID = 4 use account index 1
        },
        user: {
            default: 5, // If "user" the default account is index 5 from the list
        },
    },
}
