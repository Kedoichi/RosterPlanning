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

        const storesRef = collection(db, "businesses", businessId, "stores");
        const storesSnap = await getDocs(storesRef);
        const storesData = storesSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
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

  const handleStoreChange = (storeId: string) => {
    setEmployee((prev) => {
      if (!prev) return null;
      const updatedStores = prev.stores.includes(storeId)
        ? prev.stores.filter((id) => id !== storeId)
        : [...prev.stores, storeId];
      return { ...prev, stores: updatedStores };
    });
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

      router.push("/dashboard/admin/staff-list");
    }
  };

  if (!employee) return <p>Loading...</p>;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-secondary w-fit rounded ">
          <h1 className="text-3xl font-semibold mb-8 text-textPrimary px-4 py-2">
            Edit Employee
          </h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-gray-700 text-sm font-bold mb-2"
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="phone"
              className="block text-gray-700 text-sm font-bold mb-2"
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="role"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Role
            </label>
            <select
              name="role"
              id="role"
              value={employee.role}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div className="mt-2 space-y-2 mb-5">
            {stores.map((store) => (
              <div key={store.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`store-${store.id}`}
                  checked={employee.stores.includes(store.id)}
                  onChange={() => handleStoreChange(store.id)}
                  className="w-5 h-5 text-highlight bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-highlight focus:ring-offset-2 cursor-pointer"
                />
                <label
                  htmlFor={`store-${store.id}`}
                  className="ml-2 block text-lg font-semibold bg-highlight px-3 py-1 rounded-lg text-gray-800"
                >
                  {store.name}
                </label>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-boldhighlight  hover:bg-accent hover:text-offWhite  text-textPrimary  font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
