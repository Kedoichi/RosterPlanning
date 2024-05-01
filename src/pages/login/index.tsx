// src/pages/login.tsx
import type { NextPage } from "next";
import { useState } from "react";
import { auth, db } from "../../firebaseConfig";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const Login: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loginError, setLoginError] = useState("");
  const [code, setCode] = useState("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      // First, authenticate the user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Then, find the business associated with the provided code
      const businessQuery = query(
        collection(db, "businesses"),
        where("Code", "==", code)
      );
      const businessSnapshot = await getDocs(businessQuery);

      if (!businessSnapshot.empty) {
        const businessDoc = businessSnapshot.docs[0];
        const businessId = businessDoc.id;

        // Fetch the user document within the nested 'employees' collection of the business
        const userDocRef = doc(
          db,
          "businesses",
          businessId,
          "employees",
          user.uid
        );
        const userDoc = await getDoc(userDocRef);
        const userId = user.uid;
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Store the necessary details including the business ID in local storage
          localStorage.setItem(
            "userDetails",
            JSON.stringify({ ...userData, businessId, userId })
          );

          // Redirect based on role
          if (userData.role === "manager") {
            router.push("/dashboard/admin");
          } else if (userData.role === "staff") {
            router.push("/dashboard/staff");
          } else {
            console.error("User role is not recognized");
            setLoginError("User role is not recognized");
          }
        } else {
          console.error("User document does not exist");
          setLoginError("User document does not exist");
        }
      } else {
        console.error("Business not found for the provided code");
        setLoginError("Business not found for the provided code");
      }
    } catch (error) {
      console.error("Authentication error", error);
      setLoginError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center my-6">
        Login to your account
      </h1>
      <form onSubmit={handleLogin} className="max-w-md mx-auto">
        <div className="mb-4">
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700"
          >
            Business Code
          </label>
          <input
            id="code"
            type="text"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          {loginError && <p className="text-red-500">{loginError}</p>}
          <button
            type="submit"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign in
          </button>
          <button
            //onclick redirect
            onClick={() => router.push("/signup")}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
