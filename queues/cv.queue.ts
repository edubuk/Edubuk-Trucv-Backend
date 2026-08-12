import { Queue } from "bullmq";
import { queueConnection } from "../config/redis";

export type CvJobData = {
  userId: string;
  cvVersion: number;
};

export const cvQueue = new Queue<CvJobData>("cv-processing", {
  connection: queueConnection,
  defaultJobOptions: {
   attempts: 3,
   backoff: {
    type: "exponential",
    delay: 5000,
   },
   removeOnComplete: true,
   removeOnFail: 100,
  },
});
