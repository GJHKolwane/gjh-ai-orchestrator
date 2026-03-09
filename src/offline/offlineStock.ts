/**
 *  * =====================================================
  * OFFLINE STOCK MIRROR
   * =====================================================
    * Temporary in-memory stock representation for rural
     * offline autonomy.
      *
       * Later this will be replaced by:
        * - Firestore
         * - SQLite
          * - Redis
           */

           export interface StockEntry {
             availableUnits: number;
               thresholdPercent: number;
               }

               export interface FacilityStock {
                 [medication: string]: StockEntry;
                 }

                 export interface StockMirror {
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

                                           export interface OfflineDecision {
                                             available: boolean;
                                               availableUnits: number;
                                                 thresholdPercent: number;
                                                   message: string;
                                                     decremented: boolean;
                                                     }

                                                     /*
                                                     =====================================================
                                                     EVALUATE OFFLINE STOCK
                                                     =====================================================
                                                     */

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

                                                                                                                                                     /*
                                                                                                                                                       =====================================================
                                                                                                                                                         OFFLINE DECREMENT
                                                                                                                                                           =====================================================
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
 