// src/pages/dashboard.tsx
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";
import { useRouter } from "next/router";
import firebase from "firebase/compat/app";

const Dashboard: NextPage = () => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Not signed in
        router.push("/login");
      } else {
        setUser(user as firebase.User); // Update the type of the user state variable
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <p className="my-4">Welcome, {user?.email}</p>
      <button
        onClick={handleLogout}
        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
      >
        Logout
      </button>
      {/* Add more dashboard content here */}
    </div>
  );
};

export default Dashboard;
