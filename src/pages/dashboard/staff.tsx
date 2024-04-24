// src/pages/staff-dashboard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../firebaseConfig";
import { checkUserRole } from "../../utils/auth"; // Utility function for role checking

const StaffDashboard = () => {
  const [rosters, setRosters] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const verifyRole = async () => {
      const isStaff = await checkUserRole(auth.currentUser, "staff");
      if (!isStaff) {
        // If not staff, redirect to login
        router.push("/login");
      } else {
        // Fetch rosters and other staff dashboard data
        // setRosters(...)
      }
    };

    // Check if the user is authenticated and a staff member
    if (auth.currentUser) {
      verifyRole();
    } else {
      router.push("/login");
    }

    // Cleanup function isn't needed for this async operation
  }, [router]);

  // UI for viewing rosters, submitting availability, etc.

  return (
    <div>
      <h1>Staff Dashboard</h1>
      {/* Implement the dashboard features here */}
    </div>
  );
};

export default StaffDashboard;
