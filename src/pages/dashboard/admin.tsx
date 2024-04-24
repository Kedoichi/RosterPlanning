// src/pages/manager-dashboard.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../../firebaseConfig";
import { checkUserRole } from "../../utils/auth";

const ManagerDashboard = () => {
  const router = useRouter();

  useEffect(() => {
    const verifyRole = async () => {
      const hasRole = await checkUserRole(auth.currentUser, "manager");
      if (!hasRole) {
        router.push("/login");
      }
      // else {
      // The user is verified as a manager; proceed to fetch dashboard data
      // }
    };

    if (!auth.currentUser) {
      router.push("/login");
    } else {
      verifyRole();
    }
  }, [router]);

  return (
    <div>
      <h1>Manager Dashboard</h1>
      {/* Implement the dashboard features here */}
    </div>
  );
};

export default ManagerDashboard;
