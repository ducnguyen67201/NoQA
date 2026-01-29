// Validate environment variables at startup
import { env } from "./env.js";

import { prisma } from "@noqa/db";
import { getInternalCaller } from "./lib/trpc-caller.js";

async function main() {
  console.log("🚀 Worker starting...");
  console.log(`   Environment: ${env.NODE_ENV}`);

  // Test database connection
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }

  // Test internal API
  try {
    const caller = getInternalCaller();
    const health = await caller.internal.healthCheck();
    console.log("✅ Internal API:", health);
  } catch (error) {
    console.error("❌ Internal API check failed:", error);
    process.exit(1);
  }

  console.log("🎉 Worker ready!");

  // Keep the process running
  process.on("SIGINT", async () => {
    console.log("Shutting down...");
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("Shutting down...");
    await prisma.$disconnect();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Worker failed to start:", error);
  process.exit(1);
});
