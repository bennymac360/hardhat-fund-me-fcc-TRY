const {
    isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace")

const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

describe("FundMe", function () {
    console.log("-----------STARTED FundMe.test-----------")
    let fundMe
    let deployer
    let mockV3Aggregator

    beforeEach(async () => {
        // const accounts = await ethers.getSigners()
        // deployer = accounts[0]
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContractAt("FundMe", deployer)
        mockV3Aggregator = await ethers.getContractAt(
            "MockV3Aggregator",
            deployer
        )
    })
    console.log("-----------test constructor-----------")
    describe("Constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.s_priceFeed
            assert.equal(response, mockV3Aggregator.address)
        })
    })
    console.log("-----------test fund-----------")
    describe("fund", function () {
        // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
        // could also do assert.fail
        it("Fails if you don't send enough ETH", async function () {
            await expect(fundMe.fund({ value: 1 })).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
    })
    console.log("-----------FINISHED FundMe.test-----------")
})
