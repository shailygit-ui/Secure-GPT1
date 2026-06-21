import { McpServer } from "./node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.js";
import { StdioServerTransport } from "./node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js";
import { z } from "zod";

import scanPrompt from "./scanner.js";

//creating mcp server 
const server = new McpServer({
    name: "securegpt-scanner",
    version: "1.0.0"
});

server.registerTool(
    "scan_prompt",
    {
        description: "Scan a prompt for sensitive information and return a risk assessment.",
        inputSchema: {
            prompt: z.string().describe("The prompt to scan")
        }
    },
    async ({ prompt }) => {
        const result = scanPrompt(prompt);

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
);

async function main() {
    const transport = new StdioServerTransport();

    await server.connect(transport);

    console.error("✅ SecureGPT MCP Server started");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});