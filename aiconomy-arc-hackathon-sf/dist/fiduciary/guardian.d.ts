import { InterpretedIntent } from '../core/interpretation';
import { CommerceProfile, CommercePolicy } from '../core/profile';
import { PolicyDecision } from '../policy/engine';
export interface ValidationResult {
    allowed: boolean;
    reason?: string;
    decision: PolicyDecision;
}
/**
 * Fiduciary Guardian (Pure Logic)
 *
 * Responsible for verifying that an Intent is compliant with the Agent's Profile and Policy.
 * This component performs NO I/O. All data (Profile, Policy, Spend History) must be resolved
 * by the caller before invoking `validate`.
 */
export declare class FiduciaryGuardian {
    /**
     * Validates an intent against the provided Profile and Policy context.
     * @param intent The interpreted intent to validate
     * @param profile The agent's commerce profile
     * @param policy The active policy (must match profile.activePolicyId)
     * @param currentDailySpend The total spend for the current day (in wei)
     */
    validate(intent: InterpretedIntent, profile: CommerceProfile, policy: CommercePolicy, currentDailySpend: string): ValidationResult;
}
