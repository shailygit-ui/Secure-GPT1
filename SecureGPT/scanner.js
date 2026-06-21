function scanPrompt(text) {
    let findings = [];
    let risk = 0;
    let sanitizedText = text;

    /* ---------------- NORMALIZE ---------------- */
    const normalizedText = text.replace(/\s+/g, " ");

    /* ---------------- REGEX ---------------- */

    const aadhaarRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;

    const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;

    const phoneRegex =
        /\b(\+91[\s-]?)?[6-9]\d{9}\b|\b0?[6-9]\d{9}\b/g;

    const emailRegex =
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

    const otpRegex = /\b\d{4,6}\b/g;

    const cvvRegex = /\bCVV[:\s-]*\d{3,4}\b/i;

    const ifscRegex = /\b[A-Z]{4}0[A-Z0-9]{6}\b/g;

    const accountRegex = /\b(?!0{9,18})\d{9,18}\b/g;

    const creditCardRegex = /\b(?:\d[ -]*?){13,19}\b/g;

    const apiKeyRegex =
        /\b(sk|AKIA|AIza|ghp_|xoxb-|ya29\.)[A-Za-z0-9_\-]{10,}\b/gi;

    const jwtRegex =
        /\beyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\b/g;

    const passwordRegex =
        /(password|passwd|pwd|secret|passcode|login\s*details)/i;

    /* ---------------- HELPERS ---------------- */

    function mask(str, keep = 4) {
        const digits = str.replace(/\D/g, "");
        return "X".repeat(Math.max(0, digits.length - keep)) + digits.slice(-keep);
    }

    function luhnCheck(num) {
        let sum = 0;
        let alt = false;

        for (let i = num.length - 1; i >= 0; i--) {
            let n = parseInt(num[i]);
            if (alt) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alt = !alt;
        }
        return sum % 10 === 0;
    }

    function highEntropy(str) {
        return (
            /[A-Za-z]/.test(str) &&
            /\d/.test(str) &&
            str.length >= 20 &&
            /[A-Za-z0-9+/=]{20,}/.test(str)
        );
    }

    function addFinding(label, score) {
        findings.push(label);
        risk += score;
    }

    /* ---------------- DETECTION ---------------- */

    // Aadhaar
    const aadhaarMatches = normalizedText.match(aadhaarRegex);
    if (aadhaarMatches) {
        addFinding("Aadhaar Number", 80);
        sanitizedText = sanitizedText.replace(aadhaarRegex, "XXXX XXXX XXXX");
    }

    // PAN
    if (panRegex.test(text)) {
        addFinding("PAN Card Number", 80);
        sanitizedText = sanitizedText.replace(panRegex, "XXXXX****X");
    }

    // Phone
    if (phoneRegex.test(text)) {
        addFinding("Phone Number", 70);
        sanitizedText = sanitizedText.replace(phoneRegex, "XXXXXX####");
    }

    // Email
    if (emailRegex.test(text)) {
        addFinding("Email Address", 40);
        sanitizedText = sanitizedText.replace(emailRegex, (m) => {
            const [u, d] = m.split("@");
            return u[0] + "***@" + d;
        });
    }

    // OTP (FIXED - avoids false positives)
    const otpMatches = text.match(otpRegex);
    if (otpMatches) {
        const validOtp = otpMatches.some(
            m => m.length <= 6 && !accountRegex.test(m) && !phoneRegex.test(m)
        );

        if (validOtp) {
            addFinding("OTP Code", 60);
        }
    }

    // CVV
    if (cvvRegex.test(text)) {
        addFinding("CVV Code", 100);
    }

    // IFSC
    if (ifscRegex.test(text)) {
        addFinding("Bank IFSC Code", 50);
    }

    // Bank account
    const accMatches = text.match(accountRegex);
    if (accMatches) {
        accMatches.forEach((m) => {
            if (m.length >= 9 && m.length <= 18) {
                addFinding("Bank Account Number", 85);
                sanitizedText = sanitizedText.replace(m, mask(m));
            }
        });
    }

    // Credit / Debit Card (FIXED)
    const cardMatches = text.match(creditCardRegex);
    if (cardMatches) {
        cardMatches.forEach((m) => {
            const digits = m.replace(/\D/g, "");
            if (
                digits.length >= 13 &&
                digits.length <= 19 &&
                luhnCheck(digits)
            ) {
                addFinding("Credit/Debit Card Number", 100);
                sanitizedText = sanitizedText.replace(m, mask(digits));
            }
        });
    }

    // API Keys
    if (apiKeyRegex.test(text)) {
        addFinding("API Key / Secret Token", 100);
        sanitizedText = sanitizedText.replace(apiKeyRegex, "sk-********");
    }

    // JWT
    if (jwtRegex.test(text)) {
        addFinding("JWT Token", 90);
    }

    // Password mention
    if (passwordRegex.test(text)) {
        addFinding("Password Mention", 70);
    }

    // High entropy secret
    if (highEntropy(text)) {
        addFinding("High Entropy Secret", 90);
    }

    /* ---------------- FINAL SCORING (FIXED) ---------------- */

    // 🔥 HARD CAP (IMPORTANT)
    risk = Math.min(risk, 100);

    const trustScore = Math.max(0, 100 - risk);

    function getRiskLevel(score) {
        if (score >= 90) return "CRITICAL";
        if (score >= 70) return "HIGH";
        if (score >= 40) return "MEDIUM";
        return "LOW";
    }

    return {
        findings,
        risk,
        trustScore,
        sanitizedText,
        blocked: risk >= 40,
        riskLevel: getRiskLevel(risk),
    };
}

module.exports = scanPrompt;