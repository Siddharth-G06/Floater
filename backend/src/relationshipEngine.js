/**
 * Relationship Status Tracker module (JS Port)
 */

class VendorRelationship {
    constructor(vendorName) {
        this.vendor_name = vendorName;
        this.score = 70.0;   // default starting score
        this.total_transactions = 0;
        this.delayed_payments = 0;
        this.on_time_payments = 0;
        this.total_outstanding = 0.0;
    }
}

class RelationshipEngine {
    constructor() {
        this.vendors = {};
    }

    getOrCreateVendor(vendorName) {
        if (!this.vendors[vendorName]) {
            this.vendors[vendorName] = new VendorRelationship(vendorName);
        }
        return this.vendors[vendorName];
    }

    clear() {
        this.vendors = {};
    }

    updateRelationship(vendorName, amount, paidOnTime, delayed = false) {
        const vendor = this.getOrCreateVendor(vendorName);

        vendor.total_transactions += 1;
        vendor.total_outstanding += amount;

        if (paidOnTime) {
            vendor.on_time_payments += 1;
            vendor.score += 5;
        }

        if (delayed) {
            vendor.delayed_payments += 1;
            vendor.score -= 7;
        }

        // Penalty for frequent delays
        if (vendor.delayed_payments > 2) {
            vendor.score -= 5;
        }

        // Bonus for long relationship
        if (vendor.total_transactions > 10) {
            vendor.score += 5;
        }

        // Clamp score between 0–100
        vendor.score = Math.max(0, Math.min(100, vendor.score));
    }

    getStatus(vendorName) {
        const vendor = this.getOrCreateVendor(vendorName);

        if (vendor.score >= 80) {
            return "strong";
        } else if (vendor.score >= 50) {
            return "neutral";
        } else {
            return "sensitive";
        }
    }

    getRiskMultiplier(vendorName) {
        /**
         * Higher multiplier → more risky to delay
         */
        const status = this.getStatus(vendorName);

        if (status === "strong") {
            return 0.8;   // safe to delay
        } else if (status === "neutral") {
            return 1.0;
        } else {
            return 1.5;   // risky to delay
        }
    }

    getEmailTone(vendorName) {
        const status = this.getStatus(vendorName);

        if (status === "strong") {
            return "friendly";
        } else if (status === "neutral") {
            return "professional";
        } else {
            return "formal";
        }
    }
}

// Export a singleton instance
export const relationshipEngine = new RelationshipEngine();
