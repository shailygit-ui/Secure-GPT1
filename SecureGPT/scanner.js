function scanPrompt(text) {
    let findings = [];
    let risk = 0;

    let sanitizedText = text;

    const aadhaarRegex = /\b\d{12}\b/g;
    const phoneRegex = /\b(\+91[\s-]?)?[6-9]\d{9}\b|\b0?[6-9]\d{9}\b/g;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

    // credit card (raw detection first)
    const creditCardRegex = /\b(?:\d[ -]*?){13,19}\b/g;

    // API keys (stronger patterns)
    const apiKeyRegex = /\b(sk|AKIA|AIza)[A-Za-z0-9_\-]{10,}\b/gi;

    const passwordRegex = /password|passwd|pwd|secret|passcode/i;

    function maskDigits(str, keep = 4) {
        const digits = str.replace(/\D/g, "");
        return "X".repeat(Math.max(0, digits.length - keep)) + digits.slice(-keep);
    }

    // -----------------------
    // Luhn Algorithm (Credit Card Validation)
    // -----------------------
    function isValidCard(number) {
        let sum = 0;
        let shouldDouble = false;

        for (let i = number.length - 1; i >= 0; i--) {
            let digit = parseInt(number[i]);

            if (isNaN(digit)) return false;

            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }

        return sum % 10 === 0;
    }

    // -----------------------
    // High entropy check (for fake API keys / secrets)
    // -----------------------
    function isHighEntropy(str) {
        return (
            /[A-Za-z]/.test(str) &&
            /\d/.test(str) &&
            str.length >= 20 &&
            /[A-Za-z0-9]{20,}/.test(str)
        );
    }

    // -----------------------
    // Aadhaar
    // -----------------------
    if (aadhaarRegex.test(text)) {
        findings.push("Aadhaar Number");
        risk += 80;

        sanitizedText = sanitizedText.replace(aadhaarRegex, (m) => {
            const digits = m.replace(/\D/g, "");
            return "XXXX XXXX " + digits.slice(-4);
        });
    }

    // -----------------------
    // Phone (FIXED)
    // -----------------------
    const phoneMatches = text.match(phoneRegex);
    if (phoneMatches) {
        findings.push("Phone Number");
        risk += 70;

        sanitizedText = sanitizedText.replace(phoneRegex, (m) => {
            const digits = m.replace(/\D/g, "");
            return "XXXXXX" + digits.slice(-4);
        });
    }

    // -----------------------
    // Email
    // -----------------------
    if (emailRegex.test(text)) {
        findings.push("Email Address");
        risk += 40;

        sanitizedText = sanitizedText.replace(emailRegex, (match) => {
            const [user, domain] = match.split("@");
            return user[0] + "***@" + domain;
        });
    }

    // -----------------------
    // Credit Card (FIXED + Luhn validation)
    // -----------------------
    const cardMatches = text.match(creditCardRegex);

    if (cardMatches) {
        for (let match of cardMatches) {
            const digits = match.replace(/\D/g, "");

            if (digits.length >= 13 && digits.length <= 19 && isValidCard(digits)) {
                findings.push("Credit Card Number");
                risk += 100;

                sanitizedText = sanitizedText.replace(match, () =>
                    maskDigits(digits)
                );
            }
        }
    }

    // -----------------------
    // API Key (stronger detection)
    // -----------------------
    if (apiKeyRegex.test(text) || isHighEntropy(text)) {
        findings.push("API Key / Secret");
        risk += 100;

        sanitizedText = sanitizedText.replace(apiKeyRegex, "sk-***************");
    }

    // -----------------------
    // Password mention
    // -----------------------
    if (passwordRegex.test(text)) {
        findings.push("Password Mention");
        risk += 70;
    }

    // -----------------------
    // Final scoring
    // -----------------------
    const trustScore = Math.max(0, 100 - risk);

    return {
        findings,
        risk,
        trustScore,
        sanitizedText,
        blocked: risk >= 40
    };
}

module.exports = scanPrompt;