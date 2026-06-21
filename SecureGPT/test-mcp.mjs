import { Client } from "./node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js";
import { StdioClientTransport } from "./node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js";

const transport = new StdioClientTransport({
    command: "node",
    args: ["mcp-server.mjs"]
});

const client = new Client({
    name: "securegpt-test-client",
    version: "1.0.0"
});

await client.connect(transport);

console.log("✅ Connected to MCP Server");

const result = await client.callTool({
    name: "scan_prompt",
    arguments: {
        prompt: "My Aadhaar is 123456789012 and email is shaily@gmail.com"
    }
});

console.log(JSON.stringify(result, null, 2));

await client.close();