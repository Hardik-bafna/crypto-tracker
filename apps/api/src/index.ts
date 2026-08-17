import { buildServer } from "./server";

const PORT = parseInt(process.env.PORT || "3001", 10);
const HOST = process.env.HOST || "0.0.0.0";

const { app } = buildServer();

async function start() {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`\n======================================================`);
    console.log(`  Crypto Tracing Forensic API running at:`);
    console.log(`  > REST API:   http://localhost:${PORT}`);
    console.log(`  > Swagger UI: http://localhost:${PORT}/docs`);
    console.log(`======================================================\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
