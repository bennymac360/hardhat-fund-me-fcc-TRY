const {getNamedAccounts, ethers, network} = require ("hardhat")
const {developmentChains} = require ("../../helper-hardhat-config")

// We use a special if statement using the ternary operator "?"
developmentChains.includes(network.name) ?
describe("FundMe", async function (){
    let fundMe
    let deployer
    const sendValue = ethers.utils.parseEther("1")
    beforeEach(async function(){
        deployer = await (getNamedAccounts()).deployer
        fundMe =  await ethers.getContract("FundMe",deployer)
    })
})