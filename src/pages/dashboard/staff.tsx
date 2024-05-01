import React from "react";
import DashboardLayout from "../../components/DashboardLayout";

const AdminDashboard = () => {
  return (
    <DashboardLayout userType="staff">
      <h1 className="text-3xl font-semibold">Staff Dashboard</h1>
      {/* Manager-specific content */}
    </DashboardLayout>
  );
};

export default AdminDashboard;
