const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")
const { Contract } = require("ethers")

//  I came into a small problem here \\
// Here I am pulling the functions (getNamedAccounts and deployments) out of hre, be sure the functions are named and called correctly.
// Also check what they d0, for example getNAmedAccounts looks for namedAccounts in hardhat.config, so it must be named correctly in there also. Be careful!
module.exports = async ({ getNamedAccounts, deployments } = hre) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER], // Arguments for the MockV3Aggregator contract we imported.  Checkiing Github for the code and finding the constructor (or nodemodules->chainlink->src->v0.6->test->MockV3Aggregator.sol), we find the constrcutor takes args [uint8 _decimals, int256 _initialAnswer].
        })
        log("Mocks deployed!")
        log(
            "--------------------DEPLOY SCRIPT  00-deploy-mocks FINISHED---------------------"
        )
    }
}

module.exports.tags = ["all", "mocks"]
