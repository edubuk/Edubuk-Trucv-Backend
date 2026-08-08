


import { Worker } from "bullmq";
import { CvJobData} from "../queues/cv.queue";
import { ENV } from "../config/env";
import { workerConnection } from "../config/redis";

const worker = new Worker<CvJobData>("cv-processing", 
  async (job) => {
  const { userId, cvVersion } = job.data;
  console.log("Processing CV for user:", userId, "version:", cvVersion);
  const reIndexRes = await fetch(`${ENV.REINDEX_BASEURL}/api/candidate/reindex-cv`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-api-key": ENV.REINDEX_API_KEY,
    },
    body: JSON.stringify({
      user_id: userId,
    }),
  });
  console.log("Reindex response:", await reIndexRes.json());
  console.log(`Processing CV for user ${userId}, version ${cvVersion} and job ID ${job.id}`);
},
{
    connection: workerConnection,
}
);



worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.log(`Job ${job?.id} failed with error:`, error.message);
});

async function shutdown(): Promise<void> {
  console.log("Closing CV worker");

  await worker.close();
  await workerConnection.quit();

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
