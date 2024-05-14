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

    const sendValue = ethers.parseEther("1") //"100000000000000000" // 1ETH

    beforeEach(async () => {
        // const accounts = await ethers.getSigners()
        // deployer = accounts[0]
        deployer = (await getNamedAccounts()).deployer
        console.log(`deployer is:${deployer}`)

        // This deploys all solidity contracts which are assoicated with the fixture "tag", here the tag is: "all"
        await deployments.fixture(["all"])

        // had to use X = deployments.get() then getContractAt(X.abi,X.address) instead of getContract in V6
        const contract = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt(contract.abi, contract.address)

        const aggregator = await deployments.get("MockV3Aggregator")
        // mockV3Aggregator = await ethers.getContractAt("MockV3Aggregator", deployer)
        mockV3Aggregator = await ethers.getContractAt(aggregator.abi, deployer)
    })
    console.log("-----------test constructor-----------")
    describe("Constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.getPriceFeed()
            assert.equal(response.target, mockV3Aggregator.address)
        })
    })
    console.log("-----------test fund-----------")
    describe("fund", function () {
        it("Fails if you don't send enough ETH", async function () {
            //Reverts with specific error message.
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
            // await expect(fundMe.fund()).to.be.revertedWithCustomError(
            //     fundMe,
            //     "FundMe__NotEnoughEth"
            // )
        })
        it("updated the amount funded data structure", async function () {
            // funds contract with amount "sendValue"
            await fundMe.fund({ value: sendValue })
            // gets the respose of the mapping-function "addressToAmountFunded"
            const response = await fundMe.getAddressToAmountFunded(deployer)
            // Asserting that the value sent by the deployer/interacter is equal to the values returned from the mapping
            assert.equal(response.toString(), sendValue.toString())
        })
        it("adds funder to array of funders", async function () {
            // fund with value = "sendValue"
            await fundMe.fund({ value: sendValue })
            // get response
            const funder = await fundMe.getFunder(0)
            // assert the funder{address} must equal the deployer{address}
            assert.equal(funder, deployer)
        })
    })
    console.log("-----------test withdraw-----------")
    describe("withdraw", function () {
        //Before the test we should fund the contract in order to test correctly
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })
        it("Withdraw ETH from a single founder", async function () {
            //ARRANGE
            //ACT
            //ASSERT

            //ARRANGE

            // Get balance (ethers.provider.getBalance)
            let startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            let startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )

            //ACT,
            // Call withdraw function
            const transactionResponse = await fundMe.withdraw()
            // wait 1 block to get transactionResponse
            const transactionReceipt = await transactionResponse.wait(1)
            // gasUsed and gasPrice from used from transactionReceipt=transactionResponse
            const { gasUsed, gasPrice } = transactionReceipt
            // calculate gasCost = gasPrice x gasUsed
            const gasCost = gasPrice * gasUsed

            // Balance after withdrawing
            const endingFundMeBlance = await ethers.provider.getBalance(
                fundMe.target
            )
            let endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )

            //ASSERT
            // fundMe balance = 0
            assert.equal(endingFundMeBlance, 0)
            // deployer balance
            assert.equal(
                (startingFundMeBalance = (
                    startingFundMeBalance + startingDeployerBalance
                ).toString()),
                (endingDeployerBalance = (endingDeployerBalance + gasCost) // MUST INCLUDE THE GAS COST!!
                    .toString())
            )
        })
        it("Allows us to withdraw with multiple funders", async function () {
            //Arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 8; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            let startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            let startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            // Act

            // Call withdraw function
            const transactionResponse = await fundMe.withdraw()
            // wait 1 block to get transactionResponse
            const transactionReceipt = await transactionResponse.wait(1)
            // gasUsed and gasPrice from used from transactionReceipt=transactionResponse
            const { gasUsed, gasPrice } = transactionReceipt
            // calculate gasCost = gasPrice x gasUsed
            const gasCost = gasPrice * gasUsed

            // Balance after withdrawing
            const endingFundMeBlance = await ethers.provider.getBalance(
                fundMe.target
            )
            let endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )

            //ASSERT
            // fundMe balance = 0
            assert.equal(endingFundMeBlance, 0)
            // deployer balance
            assert.equal(
                (startingFundMeBalance = (
                    startingFundMeBalance + startingDeployerBalance
                ).toString()),
                (endingDeployerBalance = (endingDeployerBalance + gasCost) // MUST INCLUDE THE GAS COST!!
                    .toString())
            )
            // Make sure funders array is reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted

            for (let i = 1; i < 8; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })
        it("only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1] //Simulate an account that tires to attack the contract
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(
                attackerConnectedContract.withdraw()
            ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner") // i referenced the contract and the custom error defined in FundMe.sol
        })

        it("Cheaper Withdraw testing....", async function () {
            //Arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 8; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            let startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            let startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            // Act

            // Call withdraw function
            const transactionResponse = await fundMe.cheaperWithdraw()
            // wait 1 block to get transactionResponse
            const transactionReceipt = await transactionResponse.wait(1)
            // gasUsed and gasPrice from used from transactionReceipt=transactionResponse
            const { gasUsed, gasPrice } = transactionReceipt
            // calculate gasCost = gasPrice x gasUsed
            const gasCost = gasPrice * gasUsed

            // Balance after withdrawing
            const endingFundMeBlance = await ethers.provider.getBalance(
                fundMe.target
            )
            let endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )

            //ASSERT
            // fundMe balance = 0
            assert.equal(endingFundMeBlance, 0)
            // deployer balance
            assert.equal(
                (startingFundMeBalance = (
                    startingFundMeBalance + startingDeployerBalance
                ).toString()),
                (endingDeployerBalance = (endingDeployerBalance + gasCost) // MUST INCLUDE THE GAS COST!!
                    .toString())
            )
            // Make sure funders array is reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted

            for (let i = 1; i < 8; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })
    })
    console.log("-----------FINISHED FundMe.test-----------")
})
