// src/pages/login.tsx
import type { NextPage } from "next";
import { useState } from "react";
import { auth, db } from "../../firebaseConfig";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Login: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(user);

      // Fetch the user document to determine the role
      const userDocRef = doc(db, "employees", user.uid);
      const userDoc = await getDoc(userDocRef);
      console.log(userDoc);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(userData);
        // Redirect based on role
        if (userData.role === "manager") {
          router.push("/dashboard/admin");
        } else if (userData.role === "staff") {
          router.push("/dashboard/staff");
        } else {
          // Handle case for unknown role or additional roles if needed
          console.error("User role is not recognized");
          // Optionally, sign out the user or redirect to a default page
        }
      } else {
        console.error("User document does not exist");
        // Optionally, sign out the user or handle this case as needed
      }
    } catch (error) {
      console.error("Authentication error", error);
      // Handle error - show user a message, log, etc.
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
          <button
            type="submit"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
