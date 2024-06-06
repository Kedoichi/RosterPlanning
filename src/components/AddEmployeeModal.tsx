import { useState, ChangeEvent, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

type AddEmployeeModalProps = {
  businessId: string | null;
  fetchEmployees: () => Promise<void>;
};

type Store = { id: string; name: string };

const AddEmployeeModal = ({
  businessId,
  fetchEmployees,
}: AddEmployeeModalProps) => {
  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    phone: "",
    email: "",
    role: "staff",
    stores: [],
  });
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      if (!businessId) return;
      try {
        const storesRef = collection(db, "businesses", businessId, "stores");
        const storesSnapshot = await getDocs(storesRef);
        const storesList: Store[] = storesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setStores(storesList);
      } catch (error) {
        console.error("Error fetching stores:", error); // Display error to the UI
      }
    };
    fetchStores();
  }, [businessId]);

  const handleAddEmployee = async () => {
    if (!businessId) return;
    try {
      const employeesRef = collection(
        db,
        "businesses",
        businessId,
        "employees"
      );
      await addDoc(employeesRef, {
        ...newEmployee,
        stores: newEmployee.stores,
      });
      setNewEmployee({
        name: "",
        phone: "",
        email: "",
        role: "staff",
        stores: [],
      });
      fetchEmployees(); // Refresh the list
      setShowModal(false);
    } catch (error) {
      console.error("Error adding employee:", error);
      // Display error to the UI
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-3 bg-highlight text-md text-textPrimary font-semibold rounded-md hover:bg-accent hover:text-offWhite"
      >
        Add Employee
      </button>

      {showModal && (
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
                      Add New Employee
                    </h3>
                    <div className="mt-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          name="name"
                          value={newEmployee.name}
                          onChange={handleChange}
                          placeholder="Employee name"
                          className="flex-1 px-2 py-1 border rounded"
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={newEmployee.phone}
                          onChange={handleChange}
                          placeholder="Employee phone"
                          className="flex-1 px-2 py-1 border rounded"
                        />
                        <input
                          type="email"
                          name="email"
                          value={newEmployee.email}
                          onChange={handleChange}
                          placeholder="Employee email"
                          className="flex-1 px-2 py-1 border rounded"
                        />
                        <select
                          name="role"
                          value={newEmployee.role}
                          onChange={handleChange}
                          className="flex-1 px-2 py-1 border rounded"
                        >
                          <option value="staff">Staff</option>
                          <option value="manager">Manager</option>
                        </select>
                        <div className="flex-1">
                          <select
                            name="stores"
                            multiple
                            value={newEmployee.stores}
                            onChange={(e) => {
                              const storeIds = Array.from(
                                e.target.selectedOptions,
                                (option) => option.value
                              );
                              setNewEmployee({
                                ...newEmployee,
                                stores: storeIds,
                              });
                            }}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 h-[66px] overflow-auto"
                          >
                            {" "}
                            {stores.map((store) => (
                              <option key={store.id} value={store.id}>
                                {" "}
                                {store.name}{" "}
                              </option>
                            ))}{" "}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAddEmployee}
                >
                  Add Employee
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEmployeeModal;
