// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Treasury
 * @notice A secure treasury contract for managing ERC20 tokens and Ether deposits
 * @dev This contract allows users to deposit ERC20 tokens and Ether, while providing
 *      administrative functions for the owner to withdraw funds. It includes reentrancy
 *      protection and comprehensive balance tracking.
 *
 * Key Features:
 * - Accept deposits of any ERC20 token
 * - Accept Ether deposits via receive function
 * - Track individual token balances
 * - Owner-only withdrawal functions
 * - Reentrancy protection on all state-changing functions
 * - Event logging for all deposits and withdrawals
 *
 * Security Considerations:
 * - Uses OpenZeppelin's ReentrancyGuard for protection against reentrancy attacks
 * - Uses OpenZeppelin's Ownable for access control on withdrawal functions
 * - Validates all inputs and checks balances before transfers
 * - Follows checks-effects-interactions pattern
 */
contract Treasury is Ownable, ReentrancyGuard {
    // Mapping to track token balances: token address => balance
    mapping(address => uint256) public tokenBalances;

    // Array to keep track of all tokens that have been deposited
    address[] public supportedTokens;

    // Mapping to check if a token is already in the supportedTokens array
    mapping(address => bool) public isTokenSupported;

    // Events
    event TokenDeposited(
        address indexed token,
        address indexed from,
        uint256 amount
    );
    event TokenWithdrawn(
        address indexed token,
        address indexed to,
        uint256 amount
    );
    event EtherDeposited(address indexed from, uint256 amount);
    event EtherWithdrawn(address indexed to, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Accept ERC20 tokens as income for the treasury
     * @param token The address of the ERC20 token to deposit
     * @param amount The amount of tokens to deposit
     */
    function depositToken(address token, uint256 amount) external nonReentrant {
        require(token != address(0), "Treasury: Invalid token address");
        require(amount > 0, "Treasury: Amount must be greater than 0");

        IERC20 tokenContract = IERC20(token);

        // Check if the sender has enough balance
        require(
            tokenContract.balanceOf(msg.sender) >= amount,
            "Treasury: Insufficient token balance"
        );

        // Check if the treasury has been approved to spend the tokens
        require(
            tokenContract.allowance(msg.sender, address(this)) >= amount,
            "Treasury: Insufficient allowance"
        );

        // Transfer tokens from sender to treasury
        require(
            tokenContract.transferFrom(msg.sender, address(this), amount),
            "Treasury: Token transfer failed"
        );

        // Update treasury token balance
        tokenBalances[token] += amount;

        // Add token to supported tokens list if not already present
        if (!isTokenSupported[token]) {
            supportedTokens.push(token);
            isTokenSupported[token] = true;
        }

        emit TokenDeposited(token, msg.sender, amount);
    }

    /**
     * @dev Accept Ether as income for the treasury
     */
    receive() external payable {
        emit EtherDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw ERC20 tokens from the treasury (only owner)
     * @param token The address of the ERC20 token to withdraw
     * @param to The address to send the tokens to
     * @param amount The amount of tokens to withdraw
     */
    function withdrawToken(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(token != address(0), "Treasury: Invalid token address");
        require(to != address(0), "Treasury: Invalid recipient address");
        require(amount > 0, "Treasury: Amount must be greater than 0");
        require(
            tokenBalances[token] >= amount,
            "Treasury: Insufficient treasury balance"
        );

        IERC20 tokenContract = IERC20(token);

        // Update treasury balance before transfer
        tokenBalances[token] -= amount;

        // Transfer tokens to recipient
        require(
            tokenContract.transfer(to, amount),
            "Treasury: Token transfer failed"
        );

        emit TokenWithdrawn(token, to, amount);
    }

    /**
     * @dev Withdraw Ether from the treasury (only owner)
     * @param to The address to send the Ether to
     * @param amount The amount of Ether to withdraw (in wei)
     */
    function withdrawEther(
        address payable to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(to != address(0), "Treasury: Invalid recipient address");
        require(amount > 0, "Treasury: Amount must be greater than 0");
        require(
            address(this).balance >= amount,
            "Treasury: Insufficient Ether balance"
        );

        to.transfer(amount);

        emit EtherWithdrawn(to, amount);
    }

    /**
     * @dev Get the balance of a specific token in the treasury
     * @param token The address of the ERC20 token
     * @return The balance of the token
     */
    function getTokenBalance(address token) external view returns (uint256) {
        return tokenBalances[token];
    }

    /**
     * @dev Get the Ether balance of the treasury
     * @return The Ether balance in wei
     */
    function getEtherBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get all supported tokens
     * @return Array of token addresses
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    /**
     * @dev Get the number of different tokens supported
     * @return The count of supported tokens
     */
    function getSupportedTokensCount() external view returns (uint256) {
        return supportedTokens.length;
    }
}
