import { spawn } from "node:child_process";

function start(command, args, label, env = {}) {
  const child = spawn(command, args, {
    env: {
      ...process.env,
      ...env,
    },
    stdio: ["inherit", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[${label}] ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[${label}] ${chunk}`);
  });

  return child;
}

const decapServer = start("decap-server", [], "decap", {
  PORT: process.env.DECAP_SERVER_PORT ?? "8081",
  BIND_HOST: process.env.DECAP_SERVER_BIND_HOST ?? "127.0.0.1",
});

const nextDev = start("next", ["dev"], "next");

const children = [decapServer, nextDev];

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  process.exit(code);
}

for (const child of children) {
  child.on("exit", (code) => {
    if (code !== 0) {
      shutdown(code ?? 1);
    }
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
