import { Server } from "http";

import { configs } from "@/app/configs";
import { logger } from "@/app/utils";
import app from "./app";

let server: Server;
//  bootstrap function :
const bootstrap = async () => {
  try {
    // server listen :
    server = app.listen(configs.port, () => {
      logger.info(`🧑‍🚀🚀 Server is running on ${configs.port}`);

      // schedularUtils.startSchedules();
    });
  } catch (err) {
    logger.error(`❌ Database connection failed ❌`, err);
  }
};

// bootstrap the project
bootstrap();

// handle unhandled rejection
process.on("unhandledRejection", (reason) => {
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// handled uncaughtException:
process.on("uncaughtException", (error) => {
  logger.error("uncaughtException: ERROR", error.message);
  console.error("uncaughtException: ERROR", error.message);
  process.exit(1);
});
