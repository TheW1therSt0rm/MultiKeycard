const path = require("path");
const { Service } = require("node-windows");

const svc = new Service({
  name: "Multi-Card Server",
  script: path.join(__dirname, "server.js"),
});

svc.on("uninstall", () => console.log("Service uninstalled."));
svc.uninstall();