"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaValidator = void 0;
const constants_1 = require("../core/constants");
class SchemaValidator {
    validate(data, envelopeType) {
        switch (envelopeType) {
            case constants_1.EnvelopeType.LIP_JSON:
                // If data is string, try parse. If object, pass.
                if (typeof data === 'string') {
                    try {
                        JSON.parse(data);
                        return true;
                    }
                    catch {
                        return false;
                    }
                }
                return typeof data === 'object' && data !== null;
            case constants_1.EnvelopeType.LIP_TEXT:
                return typeof data === 'string';
            case constants_1.EnvelopeType.LIP_HASH:
                // Standard 32-byte hex hash (0x + 64 chars)
                return typeof data === 'string' && /^0x[a-fA-F0-9]{64}$/.test(data);
            case constants_1.EnvelopeType.LIP_URL:
                if (typeof data !== 'string')
                    return false;
                try {
                    new URL(data);
                    return true;
                }
                catch {
                    return false;
                }
            case constants_1.EnvelopeType.LIP_BOOLEAN:
                return typeof data === 'boolean';
            default:
                console.warn(`Unknown envelope type: ${envelopeType}`);
                return false;
        }
    }
}
exports.SchemaValidator = SchemaValidator;
