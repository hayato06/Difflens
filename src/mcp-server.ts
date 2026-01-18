import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

// Create an MCP server
const server = new McpServer({
    name: "difflens",
    version: "0.0.1",
});

// Define the 'difflens_check' tool
server.tool(
    "difflens_check",
    "Run visual regression test and accessibility audit for a given URL",
    {
        url: z.string().url().describe("The URL to check"),
        label: z.string().optional().describe("Label for the scenario (default: 'check')"),
    },
    async ({ url, label }) => {
        const scenarioLabel = label || "check";

        // Resolve path to CLI
        // Assuming mcp-server.js and cli.js are in the same directory (dist)
        const cliPath = path.resolve(__dirname, 'cli.js');

        // Construct command arguments
        const args = [cliPath, 'test', '--url', url, '--label', scenarioLabel, '--format', 'ai'];

        try {
            const { stdout, stderr } = await execFileAsync(process.execPath, args);
            // Combine stdout and stderr, prioritizing stdout as it contains the report
            const output = stdout + (stderr ? `\n[Stderr]\n${stderr}` : "");
            return {
                content: [
                    {
                        type: "text",
                        text: output,
                    },
                ],
            };
        } catch (error: any) {
            // execFile throws if exit code is not 0 (e.g. test failure)
            // But we still want the output (report)
            const output = (error.stdout || "") + (error.stderr ? `\n[Stderr]\n${error.stderr}` : "");
            return {
                content: [
                    {
                        type: "text",
                        text: output || error.message,
                    },
                ],
                // Don't mark as error for MCP if it's just a test failure, 
                // but maybe we should? 
                // If it's a test failure, the tool executed successfully but found issues.
                // So isError: false is probably better, letting the agent interpret the result.
            };
        }
    }
);

// Connect via Stdio
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("DiffLens MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in MCP server:", error);
    process.exit(1);
});
