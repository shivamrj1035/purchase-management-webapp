import { create } from "zustand";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

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
  setPropertyDetails: (details: PropertyDetails, userId: string) => Promise<void>;
  updatePropertyDetails: (updates: Partial<PropertyDetails>, userId: string) => Promise<void>;
  loadPropertyDetails: (userId: string) => Promise<void>;
  getTotalCost: () => number;
  clearPropertyDetails: () => void;
}

export const usePropertyStore = create<PropertyStore>()((set, get) => ({
  propertyDetails: null,
  loading: false,

  loadPropertyDetails: async (userId: string) => {
    try {
      set({ loading: true });
      const docRef = doc(db, "users", userId, "config", "propertyDetails");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ propertyDetails: docSnap.data() as PropertyDetails });
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

  setPropertyDetails: async (details, userId) => {
    try {
      const totalCost =
        details.purchasePrice +
        details.registrationFees +
        details.stampDuty +
        details.legalFees +
        details.brokerageFees +
        details.otherFees;

      const propertyData = { ...details, totalCost };

      // Save to Firestore
      const docRef = doc(db, "users", userId, "config", "propertyDetails");
      await setDoc(docRef, propertyData);

      // Update local state
      set({ propertyDetails: propertyData });
    } catch (error) {
      console.error("Error saving property details:", error);
      throw error;
    }
  },

  updatePropertyDetails: async (updates, userId) => {
    try {
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

      // Save to Firestore
      const docRef = doc(db, "users", userId, "config", "propertyDetails");
      await setDoc(docRef, propertyData);

      // Update local state
      set({ propertyDetails: propertyData });
    } catch (error) {
      console.error("Error updating property details:", error);
      throw error;
    }
  },

  getTotalCost: () => {
    const details = get().propertyDetails;
    if (!details) return 0;
    return details.totalCost;
  },

  clearPropertyDetails: () => set({ propertyDetails: null }),
}));
