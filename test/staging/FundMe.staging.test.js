const { assert } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

// let variable = false
// let someVar = variable ? "yes" : "no"   ========>  // if (variable) {someVar = "yes"} else {someVar = "no"}

// We use a special if statement using the ternary operator "?"
// only runs on test nets!

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Tests", function () {
          let deployer
          let fundMe
          const sendValue = ethers.parseEther("0.01")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              const contract = await deployments.get("FundMe")
              fundMe = await ethers.getContractAt(
                  contract.abi,
                  contract.address
              )
          })

          it("allows people to fund and withdraw", async function () {
              const fundTxResponse = await fundMe.fund({ value: sendValue })
              await fundTxResponse.wait(1)
              const withdrawTxResponse = await fundMe.withdraw()
              await withdrawTxResponse.wait(1)

              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              console.log(
                  endingFundMeBalance.toString() +
                      " should equal 0, running assert equal..."
              )
              assert.equal(endingFundMeBalance.toString(), "0")
          })
      })
