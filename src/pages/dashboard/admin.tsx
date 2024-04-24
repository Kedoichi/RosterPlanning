// src/pages/manager-dashboard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { checkUserRole } from "../../utils/auth";

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, see if they have the 'manager' role.
        const hasRole = await checkUserRole(user, "manager");
        if (!hasRole) {
          // User is not a manager; redirect them.
          router.push("/login");
        }
        setLoading(false);
      } else {
        // No user is signed in; redirect to login page.
        router.push("/login");
      }
    });

    // Cleanup the listener when the component unmounts
    return unsubscribe;
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Manager Dashboard</h1>
      {/* Dashboard content goes here */}
    </div>
  );
};

export default ManagerDashboard;
