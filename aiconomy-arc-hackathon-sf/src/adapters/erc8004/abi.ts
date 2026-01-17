/**
 * ERC-8004 Service Manager ABI
 * Standard interface for registering services (agents) and emitting discovery events.
 */
export const ServiceManagerABI = [
  // Methods
  "function register(string memory metadata) external returns (uint256)",
  "function updateRegistration(uint256 serviceId, string memory metadata) external",
  "function deregister(uint256 serviceId) external",

  // Events
  "event ServiceRegistered(uint256 indexed serviceId, address indexed operator, string metadata)",
  "event ServiceUpdated(uint256 indexed serviceId, string metadata)",
  "event ServiceDeregistered(uint256 indexed serviceId)"
];
