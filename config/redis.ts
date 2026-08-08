import IORedis from "ioredis";

const redisOptions = {
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(process.env.REDIS_PORT ?? 6379),
};

/**
 * Used by the API to add jobs.
 */
export const queueConnection = new IORedis({
  ...redisOptions,
  maxRetriesPerRequest: 1,
});

/**
 * Used by the BullMQ worker.
 */
export const workerConnection = new IORedis({
  ...redisOptions,
  maxRetriesPerRequest: null,
});

queueConnection.on("connect", () => {
  console.log("Queue connected to Redis");
});

queueConnection.on("error", (error) => {
  console.error("Queue Redis error:", error.message);
});

workerConnection.on("connect", () => {
  console.log("Worker connected to Redis");
});

workerConnection.on("error", (error) => {
  console.error("Worker Redis error:", error.message);
});