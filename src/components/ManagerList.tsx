import React, { useState, useEffect } from "react";
import { db } from "@/firebaseConfig"; // Make sure the path is correct for your setup
import {
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  collection,
  deleteDoc,
} from "firebase/firestore";

// Define your Employee and Store types
type Employee = {
  role: string;
  id: string;
  name: string;
  // Add other employee properties as necessary
};

type Store = {
  id: string;
  name: string;
  managerId?: string;
};

type ManagerListProps = {
  stores: Store[];
  onStoresUpdated: () => void;
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
};

const ManagerList: React.FC<ManagerListProps> = ({
  stores,
  onStoresUpdated,
  setStores,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  // Fetch employees who are not currently managers
  useEffect(() => {
    const fetchEmployeesAndManagers = async () => {
      const userDetailsStr = localStorage.getItem("userDetails");
      if (userDetailsStr) {
        const userDetails = JSON.parse(userDetailsStr);
        const businessId = userDetails.businessId;

        // Fetch employees from the nested collection within the business
        const employeesQuery = query(
          collection(db, "businesses", businessId, "employees"),
          where("role", "in", ["staff", "manager"])
        );
        const employeesSnapshot = await getDocs(employeesQuery);
        const employeesData = employeesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Employee[];

        // Separate managers from other employees
        const managersData = employeesData.filter((e) => e.role === "manager");
        const staffData = employeesData.filter((e) => e.role === "staff");

        setManagers(managersData);
        setEmployees(staffData);
      } else {
        console.error("User details are not stored in local storage.");
      }
    };

    fetchEmployeesAndManagers();
  }, [stores]);

  // Find a manager's name by ID
  const findManagerName = (managerId?: string) => {
    if (!managerId) {
      return "No manager";
    }
    const manager = managers.find((manager) => manager.id === managerId);
    return manager ? manager.name : "No manager";
  };
  // Promote an employee to a manager

  // Update store to remove manager
  const deleteManager = async (storeId: string) => {
    try {
      const storeRef = doc(db, "stores", storeId);
      await updateDoc(storeRef, {
        managerId: null,
      });
      onStoresUpdated(); // Refresh the list of stores
    } catch (error) {
      console.error("Error removing manager from store: ", error);
    }
  };

  // Delete a store
  const deleteStore = async (storeId: string) => {
    try {
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
      const storeRef = doc(db, "businesses", businessId, "stores", storeId);
      await deleteDoc(storeRef);
      onStoresUpdated(); // Refresh the list of stores
    } catch (error) {
      console.error("Error deleting store: ", error);
    }
  };
  return (
    <>
      <div className="w-full mb-4">
        {/* Table headers */}
        <div className="flex border-b-2 mb-2">
          <div className="w-1/2 p-2 font-bold">Store Name</div>
          <div className="w-1/2 p-2 font-bold">Actions</div>
        </div>

        {/* Table rows */}
        {stores.map((store) => (
          <div key={store.id} className="flex border-b">
            {/* Store name and manager */}
            <div className="store-info w-1/2 p-2 flex flex-col">
              <span>{store.name}</span>
              <span className="text-sm text-gray-600">
                Manager: {findManagerName(store.managerId)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="store-actions w-1/2 p-2 flex items-center justify-end space-x-2">
              {/* Action buttons 
             

              {/* Promote employee section 
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="p-1 border rounded-md"
              >
                <option value="">Promote Employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => promoteToManager(store.id, selectedEmployee)}
                disabled={!selectedEmployee}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              >
                Promote
              </button>

              {/* Delete manager button
              <button
                onClick={() => deleteManager(store.id)}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Remove Manager
              </button>

             

             
             */}

              {/* Delete store button */}
              <button
                onClick={() => deleteStore(store.id)}
                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Delete Store
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ManagerList;
