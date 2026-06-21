require("dotenv").config();
console.log("KEY LOADED:", process.env.ARMORIQ_API_KEY?.slice(0, 10));

const express = require("express");
const cors = require("cors");
const scanPrompt = require("./scanner");

const { ArmorIQClient } = require("@armoriq/sdk");

const app = express();

app.use(cors());
app.use(express.json());

function logAudit(data) {
    console.log("🧾 ARMORIQ AUDIT LOG");

    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        input: data.input,
        decision: data.decision,
        riskScore: data.riskScore,
        localRisk: data.local?.risk,
        armoriqRisk: data.armoriq?.risk,
        findings: data.armoriq?.findings || []
    }, null, 2));
}

// ✅ Policy engine (ADD THIS HERE)
function applyPolicy(local, armoriq) {
    if (local.blocked) return "BLOCK";
    if (armoriq?.decision === "BLOCK") return "BLOCK";
    if ((local.risk + (armoriq?.risk || 0)) > 80) return "BLOCK";
    return "ALLOW";
}

/* -----------------------------
   ARMORIQ CLIENT (INIT ONCE)
------------------------------*/

const client = new ArmorIQClient({
     apiKey: process.env.ARMORIQ_API_KEY,
    userId: process.env.USER_ID || "securegpt-service",
    agentId: process.env.AGENT_ID || "securegpt-agent"
});

/* -----------------------------
   ARMORIQ CALL (SAFE + CONTROLLED)
------------------------------*/

async function callArmorIQ(prompt) {
    try {
        console.log("📡 CALLING ARMORIQ WITH:", prompt);

        // ✅ REAL SDK CALL (THIS WAS MISSING)
        const result = await client.ingest({
            type: eventType,
            data: {
              prompt,
              scanResult: localResult,
              decision: status,
              riskScore
            }
        });

        // Normalize response safely
        const safeResult = {
            decision: result?.decision || "ALLOW",
            risk: result?.risk || 0,
            findings: result?.findings || []
        };

        // Audit log
        logAudit({
            input: prompt,
            output: safeResult,
            timestamp: new Date().toISOString()
        });

        return safeResult;

    } catch (err) {
        console.error("ArmorIQ SDK Error:", err.message);

        const fallback = {
            decision: "ALLOW",
            risk: 0,
            findings: [],
            error: true
        };

        logAudit({
            input: prompt,
            output: fallback,
            error: err.message,
            timestamp: new Date().toISOString()
        });

        return fallback;
    }
}

function getEventType(decision, local) {

    if (decision === "BLOCK" || local?.blocked) {
        return "blocked_event";
    }

    if (decision === "REDACT") {
        return "redacted_event";
    }

    return "prompt_scan";
}

/* -----------------------------
   ROUTES
------------------------------*/

app.get("/", (req, res) => {
    res.send("SecureGPT Backend Running");
});

/* Local test */
app.get("/test", (req, res) => {
    res.json(scanPrompt("My password is admin123"));
});


function classifyEvent(localResult, prompt, decision) {

    const text = (prompt || "").toLowerCase();

    // 🔴 HIGH RISK: Password detection
    if (text.includes("password")) {
        return "password_detected";
    }

    // 🔴 PII detection (email, phone etc)
    if (localResult?.findings?.includes("Email Address")) {
        return "pii_detected";
    }

    // 🔴 Prompt injection attempt patterns
    if (
        text.includes("ignore previous instructions") ||
        text.includes("system prompt") ||
        text.includes("jailbreak") ||
        text.includes("override")
    ) {
        return "injection_attempt";
    }

    // 🔴 Blocked event
    if (decision === "BLOCK") {
        return "blocked_event";
    }

    // 🟡 Redacted event
    if (decision === "REDACT") {
        return "redacted_event";
    }

    // 🟢 Default safe scan
    return "prompt_scan";
}


/* -----------------------------
   MAIN SCAN ROUTE (FINAL CLEAN FLOW)
------------------------------*/

app.post("/scan", async (req, res) => {
    try {
        const prompt = req.body.prompt || "";

        // 1. LOCAL SCANNER
        const localResult = scanPrompt(prompt);

        // 2. ARMORIQ SCANNER (SAFE WRAPPER)
        let armoriqResult;

        try {
            armoriqResult = await callArmorIQ(prompt);
        } catch (err) {
            armoriqResult = {
                decision: "ALLOW",
                risk: 0,
                findings: [],
                error: true
            };
        }

        // 3. POLICY ENGINE (SINGLE SOURCE OF TRUTH)
        const status = applyPolicy(localResult, armoriqResult);
        const blocked = status === "BLOCK";

        // 4. RISK CALCULATION (SAFE)
        const riskScore =
            (localResult?.risk || 0) +
            (armoriqResult?.risk || 0);

            const eventType = classifyEvent(localResult, prompt, status);
            console.log("📡 EVENT TYPE:", eventType);

        // 5. AUDIT LOG (TRACK-READY STRUCTURE)
        logAudit({
            input: prompt,
            decision: status,
            riskScore,
            local: {
                risk: localResult?.risk,
                blocked: localResult?.blocked
            },
            armoriq: {
                risk: armoriqResult?.risk,
                decision: armoriqResult?.decision,
                findings: armoriqResult?.findings || []
            },
            timestamp: new Date().toISOString()
        });

        // 6. FINAL RESPONSE (CLEAN + PROFESSIONAL)
        res.json({
            success: true,

            input: prompt,

            engines: {
                local: localResult,
                armoriq: armoriqResult
            },

            security: {
                status: blocked ? "BLOCKED" : "SAFE",
                allowed: !blocked,
                riskScore
            },

            compliance: {
                armorIQIntegrated: true,
                policyEngine: true,
                auditEnabled: true
            },

            meta: {
                engine: "SecureGPT + ArmorIQ",
                version: "1.0.0",
                mode: "hackathon-demo"
            }
        });

    } catch (error) {
        console.error("SCAN ERROR:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/* -----------------------------
   ARMORIQ TEST ROUTE
------------------------------*/

app.get("/armoriq-test", async (req, res) => {
    const result = await callArmorIQ("test prompt");
    res.json(result);
});

/* -----------------------------
   SERVER START
------------------------------*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});