import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// Define the UserDetails type based on your Firestore document
type UserDetails = {
  name: string;
  email: string;
  phone: string;
  role: string;
  businessId: string;
};

type DashboardLayoutProps = {
  children: React.ReactNode;
  userType: "manager" | "staff";
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  userType,
}) => {
  const [userInfo, setUserInfo] = useState<UserDetails | null>(null);
  const router = useRouter();

  useEffect(() => {
    // This effect runs only once on component mount.
    if (!userInfo) {
      // Attempt to retrieve user details from localStorage first
      const savedUserDetails = localStorage.getItem("userDetails");
      if (savedUserDetails) {
        setUserInfo(JSON.parse(savedUserDetails));
      } else if (auth.currentUser) {
        // If not found in localStorage, fetch from Firestore
        const uid = auth.currentUser.uid;
        const userDocRef = doc(db, "employees", uid);
        getDoc(userDocRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const userDetails = docSnap.data() as UserDetails;
              setUserInfo(userDetails);
              localStorage.setItem("userDetails", JSON.stringify(userDetails));
            } else {
              console.log("No user document found!");
            }
          })
          .catch((error) => {
            console.error("Error fetching user details:", error);
          });
      }
    }
  }, [userInfo]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear user details from local storage on logout
      localStorage.removeItem("userDetails");
      setUserInfo(null); // Clear user info state
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  type SidebarItem = {
    name: string;
    href: string;
  };

  const managerSidebarItems: SidebarItem[] = [
    { name: "Overview", href: "/dashboard/admin" },
    { name: "Messages", href: "/dashboard/admin/messages" },
    { name: "Staff List", href: "/dashboard/admin/staff-list" },
    { name: "Roster Planning", href: "/dashboard/admin/roster" },
    { name: "Time Clock", href: "/dashboard/admin/time-clock" },
    { name: "Setting", href: "/dashboard/admin/setting" },
  ];

  const staffSidebarItems: SidebarItem[] = [
    { name: "Overview", href: "/dashboard/staff" },
    { name: "Messages", href: "/dashboard/staff/messages" },
    { name: "Roster", href: "/dashboard/staff/roster" },
    { name: "Availability", href: "/dashboard/staff/availability" },
    { name: "Leave", href: "/dashboard/staff/leave" },
    { name: "Timesheet", href: "/dashboard/staff/timesheet" },
    { name: "Setting", href: "/dashboard/staff/setting" },
  ];

  const sidebarItems =
    userType === "manager" ? managerSidebarItems : staffSidebarItems;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top navbar */}
      <nav className="w-full px-4 py-2 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <span className="text-xl font-bold">Logo</span>
        </Link>

        {/* User Info & Logout */}
        <div className="flex items-center space-x-3">
          {userInfo ? (
            <>
              <div className="font-semibold">{userInfo.name}</div>
              <div className="text-sm text-gray-600">{userInfo.email}</div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white text-sm font-medium rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </nav>

      <div className="flex flex-1 flex-row">
        {/* Sidspan className=" */}
        <aside className="w-64 p-4">
          {/* Navigation */}
          <nav className="mt-4">
            {sidebarItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <span
                  className={`block px-4 py-2 mt-2 text-sm font-semibold rounded-lg ${
                    router.pathname === item.href
                      ? "bg-gray-200"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content area */}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
