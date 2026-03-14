import fetch from "node-fetch";
import { loadQueue, saveQueue } from "./offlineQueue.js";

const CASE_API =
  process.env.CASE_API ||
  "https://studious-eureka-97r6r77x6rqr2p4gv-5050.app.github.dev";

/*
================================================
SYNC OFFLINE EVENTS
================================================
*/

export async function syncOfflineQueue() {

  const queue = loadQueue();

  if (queue.length === 0) {
    return;
  }

  console.log("Offline sync: processing", queue.length, "events");

  const remaining = [];

  for (const item of queue) {

    try {

      const res = await fetch(`${CASE_API}${item.endpoint}`, {
        method: item.method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(item.payload)
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      console.log("Offline event synced:", item.endpoint);

    } catch (err) {

      console.warn("Offline sync failed, keeping in queue");

      remaining.push(item);

    }

  }

  saveQueue(remaining);

}
