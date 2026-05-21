import "dotenv/config";

import { app } from "./app";
import { config } from "./config/config";

async function bootstrap() {
  app.listen(config.server.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.server.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
