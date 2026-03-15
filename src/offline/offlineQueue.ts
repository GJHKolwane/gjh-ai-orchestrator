import fs from "fs";
import path from "path";

const queueFile = path.join("data", "clinicalOfflineQueue.json");

/*
================================================
LOAD QUEUE
================================================
*/

function loadQueue(): any[] {

  try {

    if (!fs.existsSync(queueFile)) {
      return [];
    }

    const raw = fs.readFileSync(queueFile, "utf-8");

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

function saveQueue(queue: any[]) {

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
ADD ITEM TO QUEUE
================================================
*/

export function enqueueOfflineItem(item: any) {

  const queue = loadQueue();

  queue.push({
    ...item,
    createdAt: new Date().toISOString()
  });

  saveQueue(queue);

}

/*
================================================
READ QUEUE
================================================
*/

export function readOfflineQueue(): any[] {

  return loadQueue();

}

/*
================================================
CLEAR QUEUE
================================================
*/

export function clearOfflineQueue() {

  saveQueue([]);

}
