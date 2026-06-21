import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ArmorIQClient } from "@armoriq/sdk";
import { evaluateRisk } from "./policyEngine.js";

async function main() {

    const armoriq = new ArmorIQClient({
        apiKey: process.env.ARMORIQ_API_KEY,
        userId: "securegpt",
        agentId: "securegpt-agent",
    });

    const transport = new StdioClientTransport({
        command: "node",
        args: ["mcp-server.mjs"]
    });

    const client = new Client({
        name: "securegpt-client",
        version: "1.0.0"
    });

    await client.connect(transport);

    console.log("✅ MCP Connected");

    const result = await client.callTool({
        name: "scan_prompt",
        arguments: {
            prompt: "My email is test@gmail.com and password is 123456"
        }
    });

    const scanResult = JSON.parse(result.content[0].text);

    console.log("🔍 Scan Result:", scanResult);

    // 🚨 STEP 1: POLICY ENGINE
    const decision = evaluateRisk(scanResult);

    console.log("🧠 Decision:", decision);

    // 🚫 BLOCK CASE
    if (decision.action === "BLOCK") {

        await armoriq.ingest({
            type: "blocked_event",
            data: { scanResult, decision }
        });

        console.log("🚫 REQUEST BLOCKED");
        return;
    }

    // 🟡 REDACT CASE
    if (decision.action === "REDACT") {

        scanResult.sanitizedText = "[REDACTED]";

        await armoriq.ingest({
            type: "redacted_event",
            data: { scanResult, decision }
        });

        console.log("🟡 REQUEST SANITIZED");
    }

    // 🟢 ALLOW CASE
    if (decision.action === "ALLOW") {

        await armoriq.ingest({
            type: "allowed_event",
            data: { scanResult, decision }
        });

        console.log("🟢 REQUEST ALLOWED");
    }
}

main().catch(console.error);