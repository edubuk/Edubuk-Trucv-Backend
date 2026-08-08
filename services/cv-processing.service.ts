import { cvQueue } from "../queues/cv.queue";

const CV_PROCESSING_DELAY_MS = Number(
  process.env.CV_PROCESSING_DELAY_MS ?? 20000
);

export async function scheduleCvProcessing(userId: string, cvVersion: number): Promise<void> {
  const jobId = `cv-process-${userId}`;
  const existingJob = await cvQueue.getJob(jobId);

  if(existingJob)
  {
    const state = await existingJob.getState();
    if(state === "waiting" || state === "delayed") {
      await existingJob.remove();
      console.log(`Previous job removed for user ${userId}`);
    }
  }
  
  await cvQueue.add("process-cv", { userId, cvVersion }, {
    jobId,
    delay: CV_PROCESSING_DELAY_MS,
  });

  console.log(
    `CV processing scheduled for user ${userId} after ${CV_PROCESSING_DELAY_MS}ms`
  );
}