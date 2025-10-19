import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  setPropertyDetails: (details: PropertyDetails) => void;
  updatePropertyDetails: (updates: Partial<PropertyDetails>) => void;
  getTotalCost: () => number;
  clearPropertyDetails: () => void;
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      propertyDetails: null,

      setPropertyDetails: (details) => {
        const totalCost =
          details.purchasePrice +
          details.registrationFees +
          details.stampDuty +
          details.legalFees +
          details.brokerageFees +
          details.otherFees;
        
        set({ propertyDetails: { ...details, totalCost } });
      },

      updatePropertyDetails: (updates) => {
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

        set({ propertyDetails: { ...updated, totalCost } });
      },

      getTotalCost: () => {
        const details = get().propertyDetails;
        if (!details) return 0;
        return details.totalCost;
      },

      clearPropertyDetails: () => set({ propertyDetails: null }),
    }),
    {
      name: "property-details-storage",
    }
  )
);
