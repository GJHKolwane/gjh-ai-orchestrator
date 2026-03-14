import fs from "fs";
import path from "path";

/*
================================================
CONFIGURATION
================================================
*/

const queueFile = path.join("data", "offlineQueue.json");

const MAX_QUEUE_SIZE = 500;

/*
================================================
LOAD QUEUE
================================================
*/

export function loadQueue() {

  try {

    if (!fs.existsSync(queueFile)) {
      return [];
    }

    const raw = fs.readFileSync(queueFile);

    return JSON.parse(raw);

  } catch (err) {

    console.error("Offline queue load error:", err);

    return [];

  }

}

/*
================================================
SAVE QUEUE
================================================
*/

export function saveQueue(queue) {

  try {

    const dir = path.dirname(queueFile);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2));

  } catch (err) {

    console.error("Offline queue save error:", err);

  }

}

/*
================================================
ADD TO QUEUE
================================================
*/

export function enqueueOffline(item) {

  const queue = loadQueue();

  queue.push({
    ...item,
    createdAt: new Date().toISOString()
  });

  /*
  ========================================================
  QUEUE SIZE PROTECTION
  Prevent infinite growth during long outages
  ========================================================
  */

  if (queue.length > MAX_QUEUE_SIZE) {

    console.warn("Offline queue limit reached — removing oldest event");

    queue.shift();

  }

  saveQueue(queue);

    }
