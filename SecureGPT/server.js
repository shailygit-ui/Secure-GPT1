require("dotenv").config();
console.log("KEY LOADED:", process.env.ARMORIQ_API_KEY?.slice(0, 10));

const express = require("express");
const cors = require("cors");

const scanPrompt = require("./scanner");

const { ArmorIQClient } = require("@armoriq/sdk");

const app = express();

app.use(cors());
app.use(express.json());

/* -----------------------------
   ARMORIQ CLIENT (INIT ONCE)
------------------------------*/

const client = new ArmorIQClient({
    apiKey: process.env.ARMORIQ_API_KEY,
    userId: "securegpt-service",
    agentId: "securegpt-agent",
});

/* -----------------------------
   ARMORIQ CALL
------------------------------*/

async function callArmorIQ(prompt) {
    try {
        console.log("CALLING ARMORIQ WITH:", prompt);

        const result = await client.invoke({
            userId: "securegpt-service",
            agentId: "securegpt-agent",
            input: prompt
        });

        console.log("ARMORIQ RESULT:", result);

        return result;

    } catch (err) {
        console.error("ArmorIQ SDK Error:", err);

        return {
            decision: "ERROR",
            risk: 0,
            findings: []
        };
    }
}

/* -----------------------------
   ROUTES
------------------------------*/

app.get("/", (req, res) => {
    res.send("SecureGPT Backend Running");
});

/* simple local test */
app.get("/test", (req, res) => {
    res.json(scanPrompt("My password is admin123"));
});

/* -----------------------------
   MAIN SCAN ROUTE (CLEAN)
------------------------------*/

app.post("/scan", async (req, res) => {
    try {
        const prompt = req.body.prompt || "";

        // LOCAL SCAN
        const localResult = scanPrompt(prompt);

        // ARMORIQ SCAN
        const armoriqResult = await callArmorIQ(prompt);

        // FINAL DECISION (simple + stable)
        const blocked =
            localResult.blocked === true ||
            armoriqResult?.decision === "BLOCK";

        const risk =
            (localResult.risk || 0) + (armoriqResult?.risk || 0);

        res.json({
            input: prompt,

            local: localResult,
            armoriq: armoriqResult,

            security: {
                riskScore: risk,
                status: blocked ? "BLOCKED" : "SAFE",
                allowed: !blocked
            }
        });

    } catch (error) {
        console.error("SCAN ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
});

/* -----------------------------
   TEST ROUTE
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