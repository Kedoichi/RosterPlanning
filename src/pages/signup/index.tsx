import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  or,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { auth, db } from "../../firebaseConfig"; // Update the path according to your project structure

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    businessCode: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { name, phone, email, password, businessCode } = formData;

    try {
      // Search for a business with the given business code
      let businessQuery = query(
        collection(db, "businesses"),
        where("ManagerCode", "==", businessCode)
      );
      let querySnapshot = await getDocs(businessQuery);

      if (querySnapshot.empty) {
        businessQuery = query(
          collection(db, "businesses"),
          where("StaffCode", "==", businessCode)
        );
        querySnapshot = await getDocs(businessQuery);
      }

      if (querySnapshot.empty) {
        throw new Error("Business not found");
      }

      // Retrieve the business document
      const businessDoc = querySnapshot.docs[0];
      const businessData = businessDoc.data();

      let role = "";
      let businessId = "";

      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        const data = doc.data();
        console.log(data);

        if (data.ManagerCode === businessCode) {
          role = "manager";
        } else if (data.StaffCode === businessCode) {
          role = "staff";
        }
        businessId = doc.id;
      });

      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Define the path to the nested 'employees' collection within the 'businesses' collection
      const employeeRef = doc(
        db,
        "businesses",
        businessDoc.id,
        "employees",
        user.uid
      );
      const userData = {
        name,
        phone,
        email,
        role,
        businessId: businessDoc.id,
      };
      localStorage.setItem("userDetails", JSON.stringify(userData));
      // Set the employee document
      await setDoc(
        doc(db, "businesses", businessDoc.id, "employees", user.uid),
        userData
      );

      // Redirect to the dashboard based on role
      router.push(role === "manager" ? "/dashboard/admin" : "/dashboard/staff");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign up for your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Full name
              </label>
              <input
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">
                Phone number
              </label>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="businessCode" className="sr-only">
                Business Code
              </label>
              <input
                name="businessCode"
                type="text"
                autoComplete="off"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Business Code"
                value={formData.businessCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Up
            </button>
          </div>
        </form>
        {error && (
          <div
            className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;
