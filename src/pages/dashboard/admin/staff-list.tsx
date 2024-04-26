// src/pages/dashboard/admin/staff-list.tsx
import { useState, useEffect, ChangeEvent, useCallback } from "react";
import { useRouter } from "next/router";
import { db } from "../../../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

type Employee = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  stores: string[]; // 'manager' or 'staff'
};

const StaffList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stores, setStores] = useState([]);
  const [storeOptions, setStoreOptions] = useState<
    { id: string; name: string }[]
  >([]);

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    phone: "",
    email: "",
    role: "staff",
    stores: [],
  });

  const router = useRouter();

  useEffect(() => {
    // Since useEffect runs on the client, it's safe to access localStorage here
    const userDetailsStr = localStorage.getItem("userDetails");
    if (userDetailsStr) {
      const userDetails = JSON.parse(userDetailsStr);
      setBusinessId(userDetails.businessId);
    } else {
      // Handle the case where userDetails is not set in localStorage
      console.error("No user details found in localStorage.");
      // Redirect to login or show an error message
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
    // Function to fetch stores
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

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone.includes(searchTerm)
  );

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };

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
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!businessId) return; // Check if businessId is null
    const employeeRef = doc(
      db,
      "businesses",
      businessId,
      "employees",
      employeeId
    );
    await deleteDoc(employeeRef);
    fetchEmployees(); // Refresh the list
  };

  return (
    <DashboardLayout userType="manager">
      <div className="container mx-auto px-4 ">
        <h1 className="text-2xl font-semibold my-4">Staff List</h1>

        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search employees..."
          className="mb-4 px-2 py-1 border rounded"
        />

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="border px-6 py-4">Name</th>
                <th className="border px-6 py-4">Phone</th>
                <th className="border px-6 py-4">Email</th>
                <th className="border px-6 py-4">Role</th>
                <th className="border px-6 py-4">Stores</th>
                <th className="border px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td className="border px-6 py-4">{employee.name}</td>
                  <td className="border px-6 py-4">{employee.phone}</td>
                  <td className="border px-6 py-4">{employee.email}</td>
                  <td className="border px-6 py-4">{employee.role}</td>
                  <td className="border px-6 py-4">
                    {employee.stores
                      ? employee.stores
                          .map(
                            (storeId) =>
                              stores.find((store) => store.id === storeId)?.name
                          )
                          .filter((name) => name)
                          .join(", ")
                      : ""}
                  </td>
                  <td className="border px-6 py-4">
                    <Link href={`edit?employeeId=${employee.id}`}>
                      <button className=" hover:text-indigo-900 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        Edit
                      </button>
                    </Link>
                    {employee.role !== "manager" && (
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
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

        <div className="mt-6 ">
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
                id="employeeStores relative"
                value={newEmployee.stores}
                multiple
                onChange={(e) => {
                  const storeIds = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setNewEmployee({ ...newEmployee, stores: storeIds });
                }}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 h-[66px] overflow-auto"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddEmployee}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Add Employee
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffList;
