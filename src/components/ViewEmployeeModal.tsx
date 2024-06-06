import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

type Employee = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  stores: string[];
};

type Store = {
  id: string;
  name: string;
};

type ViewEmployeeModalProps = {
  employee: Employee;
  businessId: string;
  closeModal: () => void;
};

const ViewEmployeeModal: React.FC<ViewEmployeeModalProps> = ({
  employee,
  businessId,
  closeModal,
}) => {
  const [storeNames, setStoreNames] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreNames = async () => {
      try {
        const storeNamesPromises = employee.stores?.map(async (storeId) => {
          const storeRef = doc(db, "businesses", businessId, "stores", storeId);
          const storeDoc = await getDoc(storeRef);
          if (storeDoc.exists()) {
            return { id: storeDoc.id, name: storeDoc.data().name };
          } else {
            return { id: storeId, name: "Unknown" };
          }
        });
        const names = await Promise.all(storeNamesPromises || []);
        setStoreNames(names);
      } catch (error) {
        console.error("Error fetching store names:", error);
        setError("Error fetching store names. Please try again later.");
      }
    };

    fetchStoreNames();
  }, [employee.stores, businessId]);

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
        &#8203;
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Employee Details
                </h3>
                {error && <div className="mt-2 text-red-500">{error}</div>}
                <div className="mt-2">
                  <div className="flex flex-col space-y-4">
                    <div>
                      <label className="font-bold">Name:</label>
                      <div>{employee.name}</div>
                    </div>
                    <div>
                      <label className="font-bold">Phone:</label>
                      <div>{employee.phone}</div>
                    </div>
                    <div>
                      <label className="font-bold">Email:</label>
                      <div>{employee.email}</div>
                    </div>
                    <div>
                      <label className="font-bold">Role:</label>
                      <div>{employee.role}</div>
                    </div>
                    <div>
                      <label className="font-bold">Stores:</label>
                      <div className="inline-flex">
                        {storeNames.map((store, index) => (
                          <p key={store.id} className="pl-2">
                            {store.name}
                            {index < storeNames.length - 1 && ","}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeModal;
