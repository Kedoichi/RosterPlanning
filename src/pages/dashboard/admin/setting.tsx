// pages/admin/settings.tsx

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ManagerList from "@/components/ManagerList";
import { auth, db } from "@/firebaseConfig";
import { collection, addDoc, getDocs, doc } from "firebase/firestore";

type Store = {
  id: string;
  name: string;
  managerId?: string;
};

const AdminSettings: React.FC = () => {
  const [storeName, setStoreName] = useState("");
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    const userDetailsStr = localStorage.getItem("userDetails");
    if (!userDetailsStr) {
      console.error("User details are not found in localStorage.");
      return;
    }

    const userDetails = JSON.parse(userDetailsStr);
    const businessId = userDetails.businessId;

    if (!businessId) {
      console.error("Business ID is not available.");
      return;
    }

    // Construct the path to the 'stores' subcollection within the business document
    const storesRef = collection(db, "businesses", businessId, "stores");

    try {
      const storesSnapshot = await getDocs(storesRef);
      const storesData = storesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Store[];
      setStores(storesData);
    } catch (error) {
      console.error("Error fetching stores: ", error);
    }
  };
  const getUID = () => {
    const user = auth.currentUser;
    if (user) {
      return user.uid;
    } else {
      console.error("No user is currently signed in.");
      return null; // or handle the absence of a user accordingly
    }
  };
  const handleAddStore = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const uid = getUID(); // Make sure this is synchronous and not null.

    if (!uid) {
      console.error("Error: No UID found for current user.");
      return;
    }

    try {
      const userDetails = JSON.parse(
        localStorage.getItem("userDetails") || "{}"
      );
      const businessId = userDetails.businessId;

      if (!businessId) {
        console.error("Error: Business ID is missing from the user details.");
        return;
      }

      const storeRef = collection(db, "businesses", businessId, "stores");
      const docRef = await addDoc(storeRef, {
        name: storeName,
        managerId: uid,
      });

      // Use the uid to immediately reflect the correct manager
      const newStore = { id: docRef.id, name: storeName, managerId: uid };

      setStores((prevStores) => [...prevStores, newStore]);

      setStoreName("");
    } catch (error) {
      console.error("Error adding new store: ", error);
    }
  };

  return (
    <DashboardLayout userType="manager">
      <div className="settings p-4">
        <h1 className="text-2xl font-semibold mb-4">Admin Settings</h1>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Add New Store</h2>
          <form onSubmit={handleAddStore} className="space-y-4">
            <div>
              <label
                htmlFor="storeName"
                className="block text-sm font-medium text-gray-700"
              >
                Store Name
              </label>
              <input
                type="text"
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Enter store name"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Store
            </button>
          </form>
        </section>
        <ManagerList
          stores={stores}
          onStoresUpdated={fetchStores}
          setStores={setStores}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
