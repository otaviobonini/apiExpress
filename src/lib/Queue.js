import { Queue } from "bullmq";

export const connection = {
  host: "localhost",
  port: 6379,
};

export function createQueue(name) {
  return new Queue(name, { connection });
}