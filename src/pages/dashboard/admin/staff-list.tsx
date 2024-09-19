import { useState, useEffect, ChangeEvent, useCallback } from "react";
import { useRouter } from "next/router";
import { db } from "../../../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import AddEmployeeModal from "@/components/AddEmployeeModal";
import ViewEmployeeModal from "@/components/ViewEmployeeModal";
import ConfirmationModal from "@/components/ConfirmationModal";

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

const StaffList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const userDetailsStr = localStorage.getItem("userDetails");
    if (userDetailsStr) {
      const userDetails = JSON.parse(userDetailsStr);
      setBusinessId(userDetails.businessId);
    } else {
      console.error("No user details found in localStorage.");
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    if (!businessId) return;
    try {
      const employeesRef = collection(
        db,
        "businesses",
        businessId,
        "employees"
      );
      const snapshot = await getDocs(employeesRef);
      const employeesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Employee[];
      setEmployees(employeesList);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }, [businessId]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const fetchStores = async () => {
      if (!businessId) return;

      try {
        const storesRef = collection(db, "businesses", businessId, "stores");
        const snapshot = await getDocs(storesRef);
        const storesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStores(storesData);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, [businessId]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStoreChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedStore(event.target.value);
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearchTerm =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone.includes(searchTerm);
    const matchesStore =
      !selectedStore || employee.stores.includes(selectedStore);

    return matchesSearchTerm && matchesStore;
  });

  const handleDeleteEmployee = async (employeeId: string) => {
    setIsConfirmationModalOpen(true);
    setEmployeeToDelete(employeeId);
  };
  const confirmDeleteEmployee = async () => {
    if (!businessId || !employeeToDelete) return;
    const employeeRef = doc(
      db,
      "businesses",
      businessId,
      "employees",
      employeeToDelete
    );
    try {
      await deleteDoc(employeeRef);
      fetchEmployees();
      setIsConfirmationModalOpen(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };
  const cancelDeleteEmployee = () => {
    setIsConfirmationModalOpen(false);
    setEmployeeToDelete(null);
  };
  const toggleViewModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(!isViewModalOpen);
  };
  return (
    <DashboardLayout userType="manager">
      <div className="container mx-auto px-2">
        <h1 className="text-3xl tracking-wider font-bold mt-8 mb-4 ml-4">
          Staff List
        </h1>
        <div className="bg-secondary p-6 rounded-xl border-1 border-border">
          <div className="mb-4 flex justify-between items-center ">
            <div className="flex space-x-10 h-[3rem]">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search employees..."
                className="px-2 py-1  border-2  rounded-[11px]   border-border "
              />
              <select
                value={selectedStore || ""}
                onChange={handleStoreChange}
                className=" px-4 py-1 border-2  rounded-[11px]   border-border"
              >
                <option value="">All Stores</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <AddEmployeeModal
              businessId={businessId}
              fetchEmployees={fetchEmployees}
            />
          </div>

          <hr className="w-full border-[1px] border-border mb-2"></hr>
          <div className="h-[600px] overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 scrollbar-thumb-rounded-full">
            <table className="min-w-full bg-white  border-gray-300 rounded-md shadow-sm table-auto">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-survey text-left text-md font-semibold text-textSecondary uppercase tracking-wider rounded-ss-lg">
                    Name
                  </th>
                  <th className="px-6 py-3 bg-survey text-left text-md font-semibold text-textSecondary uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 bg-survey text-left text-md font-semibold text-textSecondary uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 bg-survey text-left text-md font-semibold text-textSecondary uppercase tracking-wider">
                    Stores
                  </th>{" "}
                  <th className="px-6 py-3 bg-survey text-left text-md font-semibold text-textSecondary uppercase tracking-wider rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-8 py-2 whitespace-nowrap text-sm font-medium text-textPrimary">
                      {employee.name}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-textPrimary">
                      {employee.phone}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-textPrimary">
                      {employee.role.charAt(0).toUpperCase() +
                        employee.role.slice(1)}
                    </td>
                    <td className="px-10 py-2 whitespace-nowrap text-sm font-medium text-textPrimary">
                      {employee.stores
                        ? employee.stores
                            .map(
                              (storeId) =>
                                stores.find((store) => store.id === storeId)
                                  ?.name
                            )
                            .filter((name) => name)
                            .join(", ")
                        : ""}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-textPrimary">
                      <button
                        className="px-4 py-2 text-md font-semibold tracking-wider bg-highlight text-textPrimary rounded-md hover:bg-boldhighlight mr-2"
                        onClick={() => toggleViewModal(employee)}
                      >
                        View
                      </button>
                      <Link href={`edit?employeeId=${employee.id}`}>
                        <button className="px-4 py-2 text-md font-semibold tracking-wider bg-highlight text-textPrimary hover:bg-boldhighlight rounded-md  mr-2">
                          Edit
                        </button>
                      </Link>
                      {employee.role !== "manager" && (
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="px-4 py-2 text-md font-semibold tracking-wider bg-boldhighlight text-textPrimary  hover:bg-accent hover:text-offWhite rounded-md"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {isViewModalOpen && selectedEmployee && (
          <ViewEmployeeModal
            employee={selectedEmployee}
            businessId={businessId}
            closeModal={() => setIsViewModalOpen(false)}
          />
        )}
        {isConfirmationModalOpen && (
          <ConfirmationModal
            title="Delete Employee"
            message="Are you sure you want to delete this employee?"
            onConfirm={confirmDeleteEmployee}
            onCancel={cancelDeleteEmployee}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default StaffList;
