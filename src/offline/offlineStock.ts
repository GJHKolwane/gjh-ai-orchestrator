/**
 * Temporary in-memory facility stock mirror
 * Replace with Firestore / SQLite / Redis later
 */

interface StockEntry {
  availableUnits: number;
  thresholdPercent: number;
}

interface FacilityStock {
  [medication: string]: StockEntry;
}

interface StockMirror {
  [facilityId: string]: FacilityStock;
}

const stockMirror: StockMirror = {
  "FAC-A": {
    "Amoxicillin 500mg": {
      availableUnits: 40,
      thresholdPercent: 60
    }
  }
};

interface OfflineDecision {
  available: boolean;
  availableUnits: number;
  thresholdPercent: number;
  message: string;
  decremented: boolean;
}

export function evaluateOfflineStock(
  medication: string,
  facilityId: string,
  quantity: number
): OfflineDecision {

  const facility = stockMirror[facilityId];

  if (!facility || !facility[medication]) {
    return {
      available: false,
      availableUnits: 0,
      thresholdPercent: 0,
      message: "Medication not found locally",
      decremented: false
    };
  }

  const stock = facility[medication];

  if (stock.availableUnits < quantity) {
    return {
      available: false,
      availableUnits: stock.availableUnits,
      thresholdPercent: stock.thresholdPercent,
      message: "Insufficient stock locally",
      decremented: false
    };
  }

  /**
   * 🔻 OFFLINE DECREMENT HAPPENS HERE
   */
  stock.availableUnits -= quantity;

  return {
    available: true,
    availableUnits: stock.availableUnits,
    thresholdPercent: stock.thresholdPercent,
    message: "Approved via offline stock mirror",
    decremented: true
  };
}
