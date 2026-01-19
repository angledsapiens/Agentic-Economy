"use strict";
/**
 * Commerce Profile Schema
 * Defines the identity and governing policy for an autonomous agent.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_POLICY = exports.ProfileStatus = void 0;
var ProfileStatus;
(function (ProfileStatus) {
    ProfileStatus["ACTIVE"] = "ACTIVE";
    ProfileStatus["PAUSED"] = "PAUSED";
    ProfileStatus["SUSPENDED"] = "SUSPENDED";
    ProfileStatus["DECOMMISSIONED"] = "DECOMMISSIONED";
})(ProfileStatus || (exports.ProfileStatus = ProfileStatus = {}));
exports.DEFAULT_POLICY = {
    id: 'policy-default-000',
    name: 'Default Safe Policy',
    version: '1.0.0',
    globalLimit: '0',
    dailyLimit: '0',
    autoApproveBelow: '0',
    requireApproval: true,
    minReputation: 0
};
