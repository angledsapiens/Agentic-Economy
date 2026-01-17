import { InterpretedIntent } from '../core/interpretation';
import { CommerceProfile, CommercePolicy, ProfileStatus } from '../core/profile';
import { evaluatePolicy, PolicyDecision } from '../policy/engine';

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
export class FiduciaryGuardian {

  /**
   * Validates an intent against the provided Profile and Policy context.
   * @param intent The interpreted intent to validate
   * @param profile The agent's commerce profile
   * @param policy The active policy (must match profile.activePolicyId)
   * @param currentDailySpend The total spend for the current day (in wei)
   */
  validate(
    intent: InterpretedIntent,
    profile: CommerceProfile,
    policy: CommercePolicy,
    currentDailySpend: string
  ): ValidationResult {

    // 1. Profile Status Check
    if (profile.status !== ProfileStatus.ACTIVE) {
      return {
        allowed: false,
        decision: PolicyDecision.DENY,
        reason: `Profile is ${profile.status}`
      };
    }

    // 2. Policy Integrity Check
    if (profile.activePolicyId !== policy.id) {
      return {
        allowed: false,
        decision: PolicyDecision.DENY,
        reason: `Policy ID mismatch. Profile expects ${profile.activePolicyId}, got ${policy.id}`
      };
    }

    // 3. Evaluate Policy Rules
    const evalResult = evaluatePolicy(intent, policy, currentDailySpend);

    if (evalResult.decision === PolicyDecision.ALLOW) {
      return { allowed: true, decision: PolicyDecision.ALLOW };
    }

    return {
      allowed: false,
      decision: evalResult.decision,
      reason: evalResult.reason
    };
  }
}
