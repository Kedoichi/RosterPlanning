import React from "react";
import DashboardLayout from "../../components/DashboardLayout";

const AdminDashboard = () => {
  return (
    <DashboardLayout userType="manager">
      <h1 className="text-3xl font-semibold">Manager Dashboard</h1>
      {/* Manager-specific content */}
    </DashboardLayout>
  );
};

export default AdminDashboard;
