// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title AgentRegistry
 * @dev A "Yellow Pages" Registry that issues ERC-721 Identity Tokens (ERC-8004 style) to Agents.
 */
contract AgentRegistry is ERC721 {
    uint256 private _nextTokenId;

    struct Agent {
        address walletAddress;
        string capability; // e.g., "LIQUIDITY_PROVIDER"
        uint256 minPrice;  // Minimum price in wei
        uint256 tokenId;   // The NFT Identity ID
    }

    // Maps capability string to list of Agents
    mapping(string => Agent[]) public agentsByCapability;

    // Maps wallet address to Agent ID (for lookup)
    mapping(address => uint256) public agentIds;

    // Events for real-time indexing
    event AgentRegistered(address indexed agent, string capability, uint256 minPrice, uint256 tokenId);
    event CapabilityUpdated(address indexed agent, string newCapability);

    constructor() ERC721("AgenticIdentity", "AGID") {}

    /**
     * @notice Registers the caller as an agent, minting them an Identity NFT.
     * @param _capability The service capability offered.
     * @param _minPrice The minimum price accepted.
     */
    function registerAgent(string memory _capability, uint256 _minPrice) public {
        _nextTokenId++;
        uint256 newItemId = _nextTokenId;

        // Mint Identity NFT to the agent
        _mint(msg.sender, newItemId);

        Agent memory newAgent = Agent({
            walletAddress: msg.sender,
            capability: _capability,
            minPrice: _minPrice,
            tokenId: newItemId
        });

        agentsByCapability[_capability].push(newAgent);
        agentIds[msg.sender] = newItemId;

        emit AgentRegistered(msg.sender, _capability, _minPrice, newItemId);
    }

    /**
     * @notice Retrieves all agents registered for a specific capability.
     */
    function getAgentsByCapability(string memory _capability) public view returns (Agent[] memory) {
        return agentsByCapability[_capability];
    }

    /**
     * @notice Verify if an address holds a valid Agent Identity.
     */
    function isAgent(address _agent) public view returns (bool) {
        return balanceOf(_agent) > 0;
    }
}
