import { InterpretedIntent } from '../core/interpretation';
import { CommercePolicy } from '../core/profile';
export declare enum PolicyDecision {
    ALLOW = "ALLOW",
    DENY = "DENY",
    REQUIRE_APPROVAL = "REQUIRE_APPROVAL"
}
export interface EvaluationResult {
    decision: PolicyDecision;
    reason?: string;
}
/**
 * Pure function to evaluate a transaction against a policy.
 * @param intent The interpreted intent to evaluate.
 * @param policy The active commerce policy.
 * @param currentDailySpend The total amount spent so far today (in wei).
 * @returns EvaluationResult
 */
export declare function evaluatePolicy(intent: InterpretedIntent, policy: CommercePolicy, currentDailySpend: string): EvaluationResult;
