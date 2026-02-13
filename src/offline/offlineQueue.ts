interface OfflineTransaction {
  consultationId: string;
  medication: string;
  quantity: number;
  timestamp: number;
}

let offlineQueue: OfflineTransaction[] = [];

export function addOfflineTransaction(tx: OfflineTransaction) {
  offlineQueue.push(tx);
}

export function getOfflineQueue(): OfflineTransaction[] {
  return offlineQueue;
}

export function clearOfflineQueue() {
  offlineQueue = [];
}
