#!/usr/bin/env node

import { config } from "dotenv";
import { HogMindServer } from "./server.js";
import { PostHogConfig } from "./types/posthog.types.js";
import { program } from "commander";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import chalk from "chalk";
import ora from "ora";

// Load environment variables
config();

function validateConfig(): PostHogConfig {
  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_HOST || "https://app.posthog.com";
  const projectId = process.env.POSTHOG_PROJECT_ID;

  if (!apiKey) {
    console.error(
      chalk.red("Error: POSTHOG_API_KEY environment variable is required")
    );
    process.exit(1);
  }

  if (!projectId) {
    console.error(
      chalk.red("Error: POSTHOG_PROJECT_ID environment variable is required")
    );
    process.exit(1);
  }

  return {
    apiKey,
    host,
    projectId,
  };
}

async function startServer() {
  const spinner = ora("Starting HogMind MCP Server...").start();

  try {
    const config = validateConfig();
    const server = new HogMindServer(config);

    spinner.text = "Connecting to PostHog...";
    const transport = new StdioServerTransport();
    await server.start(transport);

    spinner.succeed(chalk.green("HogMind MCP Server started successfully!"));
    console.log(chalk.blue(`🐗 PostHog Host: ${config.host}`));
    console.log(chalk.blue(`📊 Project ID: ${config.projectId}`));
    console.log(chalk.yellow("Server is ready to accept MCP connections..."));

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log(chalk.yellow("\nShutting down HogMind server..."));
      await server.shutdown();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    spinner.fail(chalk.red("Failed to start HogMind MCP Server"));
    console.error(
      chalk.red("Error:"),
      error instanceof Error ? error.message : "Unknown error"
    );
    process.exit(1);
  }
}

// CLI setup
program
  .name("hogmind")
  .description("PostHog MCP Server - AI-powered analytics assistant")
  .version("1.0.0")
  .action(startServer);

program
  .command("test-connection")
  .description("Test connection to PostHog")
  .action(async () => {
    const spinner = ora("Testing PostHog connection...").start();

    try {
      const config = validateConfig();
      const { PostHogService } = await import("./services/posthog.service.js");
      const service = new PostHogService(config);

      const isHealthy = await service.healthCheck();

      if (isHealthy) {
        spinner.succeed(chalk.green("PostHog connection successful!"));
      } else {
        spinner.fail(chalk.red("PostHog connection failed!"));
        process.exit(1);
      }

      await service.shutdown();
    } catch (error) {
      spinner.fail(chalk.red("PostHog connection test failed"));
      console.error(
        chalk.red("Error:"),
        error instanceof Error ? error.message : "Unknown error"
      );
      process.exit(1);
    }
  });

program
  .command("info")
  .description("Show HogMind server information")
  .action(() => {
    console.log(chalk.bold.blue("🐗 HogMind - PostHog MCP Server"));
    console.log(chalk.gray("━".repeat(40)));
    console.log(`Version: ${chalk.green("1.0.0")}`);
    console.log(
      `Description: ${chalk.cyan("AI-powered analytics assistant for PostHog")}`
    );
    console.log(
      `Repository: ${chalk.blue("https://github.com/yourusername/hogmind")}`
    );
    console.log("");
    console.log(chalk.bold("Available Tools:"));
    console.log("  • get_events - Retrieve PostHog events");
    console.log("  • get_insights - Get existing insights");
    console.log("  • create_insight - Create new insights");
    console.log("  • get_cohorts - Retrieve user cohorts");
    console.log("  • get_persons - Get user data");
    console.log("  • get_feature_flags - Retrieve feature flags");
    console.log("  • analyze_user_journey - Analyze user behavior");
    console.log("  • get_metrics - Get analytics metrics");
    console.log("  • query_data - Natural language queries");
    console.log("  • get_session_recordings - Get session recordings");
    console.log("");
    console.log(chalk.bold("Environment Variables:"));
    console.log("  • POSTHOG_API_KEY - Your PostHog API key");
    console.log("  • POSTHOG_HOST - PostHog instance URL");
    console.log("  • POSTHOG_PROJECT_ID - Your project ID");
  });

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}
