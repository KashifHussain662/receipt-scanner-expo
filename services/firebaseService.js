import { onValue, push, ref, remove, set } from "firebase/database";
import { database } from "../firebaseConfig";

export const firebaseService = {
  // Vendor save karein
  async saveVendor(vendor) {
    try {
      const vendorRef = ref(database, `vendors/${vendor.id}`);
      await set(vendorRef, vendor);
      return true;
    } catch (error) {
      console.error("Error saving vendor:", error);
      return false;
    }
  },

  // Vendor delete karein (vendor aur uski data dono delete)
  async deleteVendor(vendorId) {
    try {
      const vendorRef = ref(database, `vendors/${vendorId}`);
      const vendorDataRef = ref(database, `vendor_data/${vendorId}`);
      await remove(vendorRef);
      await remove(vendorDataRef);
      return true;
    } catch (error) {
      console.error("Error deleting vendor:", error);
      return false;
    }
  },

  // Vendors fetch karein
  async getVendors() {
    try {
      const vendorsRef = ref(database, "vendors");
      return new Promise((resolve) => {
        onValue(vendorsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const vendors = Object.keys(data).map((key) => ({
              ...data[key],
              id: key,
            }));
            resolve(vendors);
          } else {
            resolve([]);
          }
        });
      });
    } catch (error) {
      console.error("Error fetching vendors:", error);
      return [];
    }
  },

  // Vendor data save karein (table row add karein)
  async saveVendorData(vendorId, data) {
    try {
      const vendorDataRef = ref(database, `vendor_data/${vendorId}`);
      const newRecordRef = push(vendorDataRef);
      await set(newRecordRef, {
        ...data,
        id: newRecordRef.key,
        createdAt: new Date().toISOString(),
        scanned: true, // Mark as scanned receipt
      });
      console.log("Data saved to vendor table:", vendorId, newRecordRef.key);
      return newRecordRef.key;
    } catch (error) {
      console.error("Error saving vendor data:", error);
      return null;
    }
  },

  // Vendor ka data fetch karein (table data)
  async getVendorData(vendorId) {
    try {
      const vendorDataRef = ref(database, `vendor_data/${vendorId}`);
      return new Promise((resolve) => {
        onValue(vendorDataRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const records = Object.keys(data).map((key) => ({
              ...data[key],
              id: key,
            }));
            resolve(records);
          } else {
            resolve([]);
          }
        });
      });
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      return [];
    }
  },

  // Vendor data delete karein (specific row delete)
  async deleteVendorData(vendorId, recordId) {
    try {
      const recordRef = ref(database, `vendor_data/${vendorId}/${recordId}`);
      await remove(recordRef);
      return true;
    } catch (error) {
      console.error("Error deleting vendor data:", error);
      return false;
    }
  },
};
