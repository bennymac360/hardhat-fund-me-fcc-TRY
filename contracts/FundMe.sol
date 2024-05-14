// SPDX-License-Identifier: MIT
// 1. Pragma
pragma solidity ^0.8.7;
// 2. Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
import "hardhat/console.sol";

// 3. Interfaces, Libraries, Contracts
error FundMe__NotOwner();
error FundMe__NotEnoughEth();

/**@title A sample Funding Contract
 * @author Patrick Collins
 * @notice This contract is for creating a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    // Type Declarations
    using PriceConverter for uint256;

    // State variables - GAS DEPENDING
    // We must understand which variables are allocated to "STORAGE" as interacting with them costs gas
    // Each storage slot is 32 bytes long and represents the byte version of the object
    // NOTE interesting: even if variables are private or internal, by interogating "STORAGE" we can obtain these variables also, it's an advanced operation.
    // MOST EXPENSIVE OPCODES ======> SLOAD & SSTORE
        
    uint256 public constant MINIMUM_USD = 50 * 10**18; //CONSTANT --> NOT STORED --> inserted in contract byte code
    address private immutable i_owner; // IMMUTABLE --> NOT STORED --> inserted in contract byte code
    address[] private s_funders; // STORED
    mapping(address => uint256) private s_addressToAmountFunded; // STORED
    AggregatorV3Interface private s_priceFeed; // STORED

    // Events (we have none!)

    // Modifiers
    modifier onlyOwner() {
        // require(msg.sender == i_owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // Functions Order:
    //// constructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure

    constructor(address priceFeed) {
        s_priceFeed = AggregatorV3Interface(priceFeed);
        i_owner = msg.sender;
    }

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }

    /// @notice Funds our contract based on the ETH/USD price
    function fund() public payable {
        console.log("Contract being funded.......");
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );

        // if (msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD) revert FundMe__NotEnoughEth();
        
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
        console.log("Contract successfully funded");
    }

    function withdraw() public onlyOwner {
        console.log("Performing withdrawl");
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length; // EXPENSIVE!!! each iteration of the loop we read from s_funders to compare with funderIndex, can be improved
            funderIndex++
        ) {
            address funder = s_funders[funderIndex]; // EXPENSIVE!!! each iteration we read from s_funders to allocate the funder
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // Transfer vs call vs Send
        // payable(msg.sender).transfer(address(this).balance);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
        console.log("Withdrawl complete!");
    }

    function cheaperWithdraw() public onlyOwner {
        // Read entire array of s_funders into memory of funders (array of address) 
        address[] memory funders = s_funders;
        // mappings can't be in memory, sorry!
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length; //we use the memory-variable funders instead of reading from s_funders
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // payable(msg.sender).transfer(address(this).balance);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }


    // View and Pure Functions

    /** @notice Gets the amount that an address has funded
     *  @param fundingAddress the address of the funder
     *  @return the amount funded
     */
    function getAddressToAmountFunded(address fundingAddress)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[fundingAddress];
    }

    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
