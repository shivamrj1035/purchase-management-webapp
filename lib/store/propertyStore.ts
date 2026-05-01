import { create } from "zustand";

export interface PropertyDetails {
  purchasePrice: number;
  registrationFees: number;
  stampDuty: number;
  legalFees: number;
  brokerageFees: number;
  otherFees: number;
  propertyAddress?: string;
  propertyType?: string;
  totalCost: number;
}

interface PropertyStore {
  propertyDetails: PropertyDetails | null;
  loading: boolean;
  setPropertyDetails: (details: PropertyDetails) => Promise<void>;
  updatePropertyDetails: (updates: Partial<PropertyDetails>) => Promise<void>;
  loadPropertyDetails: () => Promise<void>;
  getTotalCost: () => number;
  clearPropertyDetails: () => void;
}

const mapDetailsToStore = (details: Record<string, string>): PropertyDetails => {
  return {
    purchasePrice: Number(details["purchase_price"]) || 0,
    registrationFees: Number(details["registration_fees"]) || 0,
    stampDuty: Number(details["stamp_duty"]) || 0,
    legalFees: Number(details["legal_fees"]) || 0,
    brokerageFees: Number(details["brokerage_fees"]) || 0,
    otherFees: Number(details["other_fees"]) || 0,
    propertyAddress: details["property_address"] || "",
    propertyType: details["property_type"] || "",
    totalCost: Number(details["total_cost"]) || 0,
  };
};

const mapStoreToDetails = (details: PropertyDetails): Record<string, string> => {
  return {
    purchase_price: String(details.purchasePrice),
    registration_fees: String(details.registrationFees),
    stamp_duty: String(details.stampDuty),
    legal_fees: String(details.legalFees),
    brokerage_fees: String(details.brokerageFees),
    other_fees: String(details.otherFees),
    property_address: details.propertyAddress || "",
    property_type: details.propertyType || "",
    total_cost: String(details.totalCost),
  };
};

export const usePropertyStore = create<PropertyStore>()((set, get) => ({
  propertyDetails: null,
  loading: false,

  loadPropertyDetails: async () => {
    try {
      set({ loading: true });
      const res = await fetch("/api/sheets/details");
      if (!res.ok) throw new Error("Failed to load property details");
      
      const data = await res.json();
      if (data.details) {
        set({ propertyDetails: mapDetailsToStore(data.details) });
      } else {
        set({ propertyDetails: null });
      }
    } catch (error) {
      console.error("Error loading property details:", error);
      set({ propertyDetails: null });
    } finally {
      set({ loading: false });
    }
  },

  setPropertyDetails: async (details) => {
    try {
      set({ loading: true });
      const totalCost =
        details.purchasePrice +
        details.registrationFees +
        details.stampDuty +
        details.legalFees +
        details.brokerageFees +
        details.otherFees;

      const propertyData = { ...details, totalCost };
      const detailsMap = mapStoreToDetails(propertyData);

      const res = await fetch("/api/sheets/details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details: detailsMap }),
      });

      if (!res.ok) throw new Error("Failed to save property details");

      set({ propertyDetails: propertyData });
    } catch (error) {
      console.error("Error saving property details:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updatePropertyDetails: async (updates) => {
    try {
      set({ loading: true });
      const current = get().propertyDetails;
      if (!current) return;

      const updated = { ...current, ...updates };
      const totalCost =
        updated.purchasePrice +
        updated.registrationFees +
        updated.stampDuty +
        updated.legalFees +
        updated.brokerageFees +
        updated.otherFees;

      const propertyData = { ...updated, totalCost };
      const detailsMap = mapStoreToDetails(propertyData);

      // We need to fetch current details first to preserve other keys if any
      const resGet = await fetch("/api/sheets/details");
      const currentData = await resGet.json();
      const mergedDetails = { ...(currentData.details || {}), ...detailsMap };

      const resPut = await fetch("/api/sheets/details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details: mergedDetails }),
      });

      if (!resPut.ok) throw new Error("Failed to update property details");

      set({ propertyDetails: propertyData });
    } catch (error) {
      console.error("Error updating property details:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getTotalCost: () => {
    const details = get().propertyDetails;
    if (!details) return 0;
    return details.totalCost;
  },

  clearPropertyDetails: () => set({ propertyDetails: null }),
}));

