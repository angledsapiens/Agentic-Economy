"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiduciaryGuardian = void 0;
const profile_1 = require("../core/profile");
const engine_1 = require("../policy/engine");
/**
 * Fiduciary Guardian (Pure Logic)
 *
 * Responsible for verifying that an Intent is compliant with the Agent's Profile and Policy.
 * This component performs NO I/O. All data (Profile, Policy, Spend History) must be resolved
 * by the caller before invoking `validate`.
 */
class FiduciaryGuardian {
    /**
     * Validates an intent against the provided Profile and Policy context.
     * @param intent The interpreted intent to validate
     * @param profile The agent's commerce profile
     * @param policy The active policy (must match profile.activePolicyId)
     * @param currentDailySpend The total spend for the current day (in wei)
     */
    validate(intent, profile, policy, currentDailySpend) {
        // 1. Profile Status Check
        if (profile.status !== profile_1.ProfileStatus.ACTIVE) {
            return {
                allowed: false,
                decision: engine_1.PolicyDecision.DENY,
                reason: `Profile is ${profile.status}`
            };
        }
        // 2. Policy Integrity Check
        if (profile.activePolicyId !== policy.id) {
            return {
                allowed: false,
                decision: engine_1.PolicyDecision.DENY,
                reason: `Policy ID mismatch. Profile expects ${profile.activePolicyId}, got ${policy.id}`
            };
        }
        // 3. Evaluate Policy Rules
        const evalResult = (0, engine_1.evaluatePolicy)(intent, policy, currentDailySpend);
        if (evalResult.decision === engine_1.PolicyDecision.ALLOW) {
            return { allowed: true, decision: engine_1.PolicyDecision.ALLOW };
        }
        return {
            allowed: false,
            decision: evalResult.decision,
            reason: evalResult.reason
        };
    }
}
exports.FiduciaryGuardian = FiduciaryGuardian;
