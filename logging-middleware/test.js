const Log = require("./logger");

async function main() {
  await Log(
    "frontend",
    "info",
    "component",
    "Frontend Application Started"
  );
}

main();