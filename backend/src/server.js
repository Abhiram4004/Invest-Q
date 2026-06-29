const app = require("./app");
const config = require("./config");

const server = app.listen(config.port, () => {
  console.log(`🚀 InvestIQ API listening on port ${config.port}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});

process.on("SIGINT", () => {
  console.log("Shutting down...");
  server.close(() => process.exit(0));
});