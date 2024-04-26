import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { db } from "../../../firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import DashboardLayout from "@/components/DashboardLayout";

type Employee = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  stores: string[];
};

const EditEmployee = () => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();
  const { employeeId } = router.query as { employeeId: string };

  useEffect(() => {
    const fetchEmployeeAndStores = async () => {
      const userDetailsStr = localStorage.getItem("userDetails");
      if (userDetailsStr) {
        const userDetails = JSON.parse(userDetailsStr);
        const businessId = userDetails.businessId;

        // Fetch the employee data
        if (employeeId) {
          const empRef = doc(
            db,
            "businesses",
            businessId,
            "employees",
            employeeId
          );
          const empSnap = await getDoc(empRef);
          if (empSnap.exists()) {
            setEmployee({ id: empSnap.id, ...(empSnap.data() as Employee) });
          }
        }

        // Fetch the stores
        const storesRef = collection(db, "businesses", businessId, "stores");
        const storesSnap = await getDocs(storesRef);
        const storesData = storesSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name, // assuming each store document has a 'name' field
        }));
        setStores(storesData);
      }
    };

    fetchEmployeeAndStores();
  }, [employeeId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEmployee((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleStoresChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const storeIds = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setEmployee((prev) => (prev ? { ...prev, stores: storeIds } : null));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!employee) return;

    const userDetailsStr = localStorage.getItem("userDetails");
    if (userDetailsStr) {
      const userDetails = JSON.parse(userDetailsStr);
      const businessId = userDetails.businessId;
      const empRef = doc(
        db,
        "businesses",
        businessId,
        "employees",
        employee.id
      );

      await updateDoc(empRef, {
        name: employee.name,
        phone: employee.phone,
        email: employee.email,
        role: employee.role,
        stores: employee.stores,
      });

      router.push("/dashboard/admin/staff-list"); // Redirect to the staff list page
    }
  };

  if (!employee) return <p>Loading...</p>;

  return (
    <DashboardLayout userType="manager">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-semibold my-4">Edit Employee</h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={employee.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={employee.phone}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={employee.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                name="role"
                id="role"
                value={employee.role}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                {/* Add more roles as necessary */}
              </select>
            </div>

            {/* Stores selector */}
            {/* Existing stores select code */}
            <div>
              <label
                htmlFor="stores"
                className="block text-sm font-medium text-gray-700"
              >
                Stores
              </label>
              <select
                name="stores"
                id="stores"
                multiple
                value={employee.stores}
                onChange={handleStoresChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                size={stores.length > 10 ? 10 : stores.length} // Adjust the size as necessary
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-500 text-white rounded px-4 py-2"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EditEmployee;
