import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// FontAwesome icon import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";

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
  const [openMenu, setOpenMenu] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    if (!userInfo) {
      const savedUserDetails = localStorage.getItem("userDetails");
      if (savedUserDetails) {
        setUserInfo(JSON.parse(savedUserDetails));
      } else if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const userDocRef = doc(db, "employees", uid);
        getDoc(userDocRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const userDetails = docSnap.data() as UserDetails;
              setUserInfo(userDetails);
              localStorage.setItem("userDetails", JSON.stringify(userDetails));
            }
          })
          .catch((error) => console.error("Error fetching user details:", error));
      }
    }
  }, [userInfo]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userDetails");
      setUserInfo(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  type SidebarItem = {
    name: string;
    href: string;
    icon?: string;
    subItems?: SidebarItem[];
  };

  const toggleMenuItem = (name: string) => {
    setOpenMenu(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const renderSidebarItems = (items: SidebarItem[]) => {
    return items.map((item) => (
      <div key={item.name}>
        <div
          className={`flex justify-between items-center px-4 py-2 mt-2 text-sm font-semibold rounded-lg cursor-pointer ${
            router.pathname === item.href ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
          onClick={() => item.subItems && toggleMenuItem(item.name)}
        >
          <span>{item.name}</span>
          {item.subItems && (
            <FontAwesomeIcon icon={openMenu[item.name] ? faChevronDown : faChevronRight} />
          )}
        </div>
        {item.subItems && openMenu[item.name] && (
          <div className="ml-4">
            {renderSidebarItems(item.subItems)}
          </div>
        )}
      </div>
    ));
  };

  const sidebarItems: SidebarItem[] = userType === "manager" ? [
    { name: "Overview", href: "/dashboard/admin", icon: "fa fa-home" },
    { name: "Messages", href: "/dashboard/admin/messages" },
    {
      name: "Staff",
      href: "#",
      icon: "fa fa-users",
      subItems: [
        {
          name: "Staff List",
          href: "/dashboard/admin/staff-list",
          icon: "fa fa-list",
        },
        {
          name: "Add Staff",
          href: "/dashboard/admin/staff-list",
          icon: "fa fa-user-plus",
        },
      ],
    },
    { name: "Roster Planning", href: "/dashboard/admin/roster" },
    { name: "Time Clock", href: "/dashboard/admin/time-clock" },
    { name: "Setting", href: "/dashboard/admin/setting" },
  ] : [
    { name: "Overview", href: "/dashboard/staff" },
    { name: "Messages", href: "/dashboard/staff/messages" },
    { name: "Roster", href: "/dashboard/staff/roster" },
    { name: "Availability", href: "/dashboard/staff/availability" },
    { name: "Leave", href: "/dashboard/staff/leave" },
    { name: "Timesheet", href: "/dashboard/staff/timesheet" },
    { name: "Setting", href: "/dashboard/staff/setting" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <nav className="w-full px-4 py-2 flex justify-between items-center">
        <Link href="/">
          <span className="text-xl font-bold">Logo</span>
        </Link>
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
        <aside className="w-64 p-4">
          <nav className="mt-4">
            {renderSidebarItems(sidebarItems)}
          </nav>
        </aside>
        <main className="flex-1 h-full">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
