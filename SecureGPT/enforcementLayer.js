export function enforce(decision, scanResult, originalInput) {

    let output = originalInput;

    // 🔴 BLOCK
    if (decision.action === "BLOCK") {
        return {
            allowed: false,
            output: "🚫 BLOCKED: Sensitive information detected.",
            metadata: {
                reason: decision.reason,
                severity: decision.severity,
            }
        };
    }

    // 🟡 REDACT
    if (decision.action === "REDACT") {

        output = scanResult.sanitizedText || "[REDACTED]";

        return {
            allowed: true,
            output,
            metadata: {
                reason: decision.reason,
                severity: decision.severity,
            }
        };
    }

    // 🟢 ALLOW
    return {
        allowed: true,
        output,
        metadata: {
            reason: decision.reason,
            severity: decision.severity,
        }
    };
}