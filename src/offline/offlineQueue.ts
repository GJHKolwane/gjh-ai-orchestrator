import fs from "fs";
import path from "path";

interface OfflineTransaction {
  consultationId: string;
  medication: string;
  quantity: number;
  timestamp: number;
}

const queueFile = path.join("data", "pharmacyOfflineQueue.json");

let offlineQueue: OfflineTransaction[] = [];

/*
================================================
LOAD QUEUE FROM DISK
================================================
*/

function loadQueue() {

  try {

    if (!fs.existsSync(queueFile)) {
      offlineQueue = [];
      return;
    }

    const raw = fs.readFileSync(queueFile);

    offlineQueue = JSON.parse(raw.toString());

  } catch (err) {

    console.error("Pharmacy queue load error:", err);

    offlineQueue = [];

  }

}

/*
================================================
SAVE QUEUE
================================================
*/

function saveQueue() {

  try {

    const dir = path.dirname(queueFile);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(queueFile, JSON.stringify(offlineQueue, null, 2));

  } catch (err) {

    console.error("Pharmacy queue save error:", err);

  }

}

/*
================================================
ADD OFFLINE TRANSACTION
================================================
*/

export function addOfflineTransaction(tx: OfflineTransaction) {

  const record: OfflineTransaction = {
    ...tx,
    timestamp: Date.now()
  };

  offlineQueue.push(record);

  saveQueue();

}

/*
================================================
GET QUEUE
================================================
*/

export function getOfflineQueue(): OfflineTransaction[] {

  return offlineQueue;

}

/*
================================================
CLEAR QUEUE
================================================
*/

export function clearOfflineQueue() {

  offlineQueue = [];

  saveQueue();

}

/*
================================================
INITIALIZE QUEUE
================================================
*/

loadQueue();
