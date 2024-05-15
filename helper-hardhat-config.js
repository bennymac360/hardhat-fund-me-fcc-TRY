const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    1: {
        name: "ethereum",
        ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    },
    43114: {
        name: "avalanche",
        ethUsdPriceFeed: "0x976B3D034E162d8bD72D6b9C989d545b839003b0",
    },
    31337: {
        name: "localhost",
    },
}

// I can define my development chains. I do this because I can deploy mock contracts on development chains to interact with during testing. VERY POWERFUL!
const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000 // 2000 00000000 (8 DECIMALS)

module.exports = { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER }
