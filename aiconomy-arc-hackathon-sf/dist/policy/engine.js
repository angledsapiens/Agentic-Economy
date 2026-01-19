"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyDecision = void 0;
exports.evaluatePolicy = evaluatePolicy;
var PolicyDecision;
(function (PolicyDecision) {
    PolicyDecision["ALLOW"] = "ALLOW";
    PolicyDecision["DENY"] = "DENY";
    PolicyDecision["REQUIRE_APPROVAL"] = "REQUIRE_APPROVAL";
})(PolicyDecision || (exports.PolicyDecision = PolicyDecision = {}));
/**
 * Pure function to evaluate a transaction against a policy.
 * @param intent The interpreted intent to evaluate.
 * @param policy The active commerce policy.
 * @param currentDailySpend The total amount spent so far today (in wei).
 * @returns EvaluationResult
 */
function evaluatePolicy(intent, policy, currentDailySpend) {
    /*
      Updated for Sprint 2 Schema Correction:
      Accessing amount via `settlement` object.
    */
    const amount = BigInt(intent.settlement.amount);
    const globalLimit = BigInt(policy.globalLimit);
    const dailyLimit = BigInt(policy.dailyLimit);
    const autoApproveBelow = BigInt(policy.autoApproveBelow);
    const dailySpend = BigInt(currentDailySpend);
    // 1. Check Global Transaction Limit
    if (globalLimit > 0n && amount > globalLimit) {
        return {
            decision: PolicyDecision.DENY,
            reason: `Amount ${amount} exceeds global single-transaction limit of ${globalLimit}`
        };
    }
    // 2. Check Daily Limit
    if (dailyLimit > 0n && (dailySpend + amount) > dailyLimit) {
        return {
            decision: PolicyDecision.DENY,
            reason: `Transaction would exceed daily limit. Current: ${dailySpend}, Limit: ${dailyLimit}`
        };
    }
    // 3. Manual Approval Override
    if (policy.requireApproval) {
        return {
            decision: PolicyDecision.REQUIRE_APPROVAL,
            reason: 'Policy requires manual approval for all transactions'
        };
    }
    // 4. Auto-Approval Threshold
    if (amount > autoApproveBelow) {
        return {
            decision: PolicyDecision.REQUIRE_APPROVAL,
            reason: `Amount ${amount} exceeds auto-approval threshold of ${autoApproveBelow}`
        };
    }
    // 5. Success
    return {
        decision: PolicyDecision.ALLOW,
        reason: 'Transaction within policy limits'
    };
}
