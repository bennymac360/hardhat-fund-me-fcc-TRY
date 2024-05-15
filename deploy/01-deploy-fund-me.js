// imports
// main
// calling main

const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config") // from helper-hardhat-config we are pulling out the const networkConfig to be used within this script! EASY!
const { verify } = require("../utils/verify")
// We could use the define a function like this, and it works okay.
// function deployFunc(hre) {
//     console.log("Hi")
// }

// module.exports.default = deployFunc

// It's better to wrap the function as so therefore We will use an anonyous function instead
// module.exports = async (hre) => {
//     const {getNamedAccounts, deployments} = hre
//     // We call the function from hre instead of calling them everytime within hre like below
//     //something = hre.getNamedAccounts()
//     //something = hre.deployments
// }

// We can imporve even more like below
module.exports = async ({ getNamedAccounts, deployments } = hre) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if chainId is X use chain Y.....We can use Aave library, useful!!!!!

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    // if the contract, in this case pricefeed, doesn't exisat we can make a mock version, by depoloying a minimal version of it, so we can test it locally.

    console.log(`InitiatingS`)

    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        // It looks in our compiled contracts to see if we have a contract called "MockV3Aggreagator" and deploys it as a constant ethUsdAggregator (that is type V3Aggregator)
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    console.log(`${ethUsdPriceFeedAddress}`)

    // we what happens when you want to change chains??
    // when going for local host or hardhat network we want to use a mock contract that this contract depends on (in this case the price feed contract)
    args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer, // Use deployer account settings
        args: args, // one arg is price feed address
        log: true,
        waitConfirmation: network.config.blockConfirmations || 1,
    })
    log("FundMe deployed!")

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log(
        "--------------------DEPLOY SCRIPT  01-deploy-fund me FINISHED---------------------"
    )
}

module.exports.tags = ["all", "mocks", "fundme"]
