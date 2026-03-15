import fetch from "node-fetch";

import {
  readOfflineQueue,
  clearOfflineQueue
} from "./offlineQueue.js";

const CASE_API =
  process.env.CASE_API ||
  "https://studious-eureka-97r6r77x6rqr2p4gv-5050.app.github.dev";

/*
================================================
OFFLINE QUEUE SYNC
================================================
Replays stored clinical operations
when connectivity returns
*/

export async function syncOfflineQueue() {

  try {

    const queue = readOfflineQueue();

    if (!queue.length) {
      return;
    }

    console.log("Syncing offline queue:", queue.length, "items");

    const remaining = [];

    for (const item of queue) {

      try {

        const res = await fetch(`${CASE_API}${item.endpoint}`, {
          method: item.method,
          headers: {
            "Content-Type": "application/json"
          },
          body: item.payload
            ? JSON.stringify(item.payload)
            : undefined
        });

        if (!res.ok) {

          console.warn("Replay failed:", item.endpoint);

          remaining.push(item);

          continue;

        }

        console.log("Replayed:", item.endpoint);

      } catch (err) {

        console.warn("Replay network error:", item.endpoint);

        remaining.push(item);

      }

    }

    if (remaining.length) {

      console.log("Remaining offline items:", remaining.length);

      clearOfflineQueue();

      const fs = await import("fs");
      const path = await import("path");

      const queueFile = path.join("data", "clinicalOfflineQueue.json");

      fs.writeFileSync(queueFile, JSON.stringify(remaining, null, 2));

    } else {

      console.log("Offline queue fully synced");

      clearOfflineQueue();

    }

  } catch (err) {

    console.error("Offline sync failed:", err);

  }

}
