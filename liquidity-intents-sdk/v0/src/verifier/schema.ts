import { EnvelopeType } from '../core/constants';

export class SchemaValidator {
  validate(data: any, envelopeType: EnvelopeType): boolean {
    switch (envelopeType) {
      case EnvelopeType.LIP_JSON:
        // If data is string, try parse. If object, pass.
        if (typeof data === 'string') {
          try { JSON.parse(data); return true; } catch { return false; }
        }
        return typeof data === 'object' && data !== null;

      case EnvelopeType.LIP_TEXT:
        return typeof data === 'string';

      case EnvelopeType.LIP_HASH:
        // Standard 32-byte hex hash (0x + 64 chars)
        return typeof data === 'string' && /^0x[a-fA-F0-9]{64}$/.test(data);

      case EnvelopeType.LIP_URL:
        if (typeof data !== 'string') return false;
        try {
          new URL(data);
          return true;
        } catch {
          return false;
        }

      case EnvelopeType.LIP_BOOLEAN:
        return typeof data === 'boolean';

      default:
        console.warn(`Unknown envelope type: ${envelopeType}`);
        return false;
    }
  }
}
