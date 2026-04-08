const path = require("path");
const { Service } = require("node-windows");

// IMPORTANT: point to the script you normally run successfully
const scriptPath = path.join(__dirname, "server.js"); // or "dist/server.js"

const svc = new Service({
  name: "Multi-Card Server",
  description: "Runs the server for Multi-Card in the background",
  script: scriptPath,
  // optional: set env vars for the service
  env: [{ name: "PORT", value: "5000" }],
});

svc.on("install", () => {
  console.log("Service installed.");
  svc.start();
});

svc.on("alreadyinstalled", () => console.log("Service already installed."));
svc.on("start", () => console.log("Service started."));
svc.on("error", (err) => console.error("Service error:", err));

svc.install();