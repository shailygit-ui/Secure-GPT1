export function evaluateRisk(scanResult) {

    const risk = scanResult.risk || 0;
    const level = scanResult.riskLevel || "LOW";
    const findings = scanResult.findings || [];

    // 🔴 HARD BLOCK CONDITIONS
    const isCritical =
        level === "CRITICAL" ||
        risk > 100 ||
        findings.includes("Password Mention");

    if (isCritical) {
        return {
            action: "BLOCK",
            reason: "Critical sensitive data detected",
            severity: "HIGH",
        };
    }

    // 🟡 SOFT BLOCK / REDACT CONDITIONS
    const isHigh =
        level === "HIGH" ||
        risk > 60 ||
        findings.includes("Email Address");

    if (isHigh) {
        return {
            action: "REDACT",
            reason: "Sensitive data detected, redaction required",
            severity: "MEDIUM",
        };
    }

    // 🟢 SAFE
    return {
        action: "ALLOW",
        reason: "No sensitive data detected",
        severity: "LOW",
    };
}