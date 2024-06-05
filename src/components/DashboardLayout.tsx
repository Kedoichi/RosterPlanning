import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHome,
  faEnvelope,
  faUsers,
  faList,
  faUserPlus,
  faCalendarAlt,
  faClock,
  faCog,
  faSignOutAlt,
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
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
          .catch((error) =>
            console.error("Error fetching user details:", error)
          );
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
    icon: any;
    subItems?: SidebarItem[];
  };

  const toggleMenuItem = (name: string) => {
    setOpenMenu((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const renderSidebarItems = (items: SidebarItem[]) => {
    return items.map((item) => (
      <div key={item.name}>
        {item.href && !item.subItems ? (
          <Link href={item.href}>
            <span
              className={`flex items-center space-x-2 px-4 py-2 mt-2 text-sm font-semibold rounded-lg cursor-pointer ${
                router.pathname === item.href
                  ? "bg-[#1d1d1d] text-[#ffffff]"
                  : "hover:bg-[#1d1d1d] hover:text-[#ffffff]"
              }`}
            >
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.name}</span>
            </span>
          </Link>
        ) : (
          <div
            className={`flex justify-between items-center px-4 py-2 mt-2 text-sm font-semibold rounded-lg cursor-pointer ${
              router.pathname === item.href
                ? "bg-[#1d1d1d] text-[#ffffff]"
                : "hover:bg-[#1d1d1d] hover:text-[#ffffff]"
            }`}
            onClick={() => item.subItems && toggleMenuItem(item.name)}
          >
            <span>{item.name}</span>
            {item.subItems && (
              <FontAwesomeIcon
                icon={openMenu[item.name] ? faChevronDown : faChevronRight}
              />
            )}
          </div>
        )}
        {item.subItems && openMenu[item.name] && (
          <div className="ml-4">{renderSidebarItems(item.subItems)}</div>
        )}
      </div>
    ));
  };

  const managerSidebarItems: SidebarItem[] = [
    { name: "Overview", href: "/dashboard/admin", icon: faHome },
    { name: "Messages", href: "/dashboard/admin/messages", icon: faEnvelope },
    {
      name: "Staff",
      href: "#",
      icon: faUsers,
      subItems: [
        {
          name: "Staff List",
          href: "/dashboard/admin/staff-list",
          icon: faList,
        },
        {
          name: "Add Staff",
          href: "/dashboard/admin/staff-list",
          icon: faUserPlus,
        },
      ],
    },
    {
      name: "Roster Planning",
      href: "/dashboard/admin/roster",
      icon: faCalendarAlt,
    },
    { name: "Time Clock", href: "/dashboard/admin/time-clock", icon: faClock },
    { name: "Setting", href: "/dashboard/admin/setting", icon: faCog },
  ];

  const staffSidebarItems: SidebarItem[] = [
    { name: "Overview", href: "/dashboard/staff", icon: faHome },
    { name: "Messages", href: "/dashboard/staff/messages", icon: faEnvelope },
    { name: "Roster", href: "/dashboard/staff/roster", icon: faCalendarAlt },
    {
      name: "Availability",
      href: "/dashboard/staff/availability",
      icon: faCalendarAlt,
    },
    { name: "Leave", href: "/dashboard/staff/leave", icon: faCalendarAlt },
    { name: "Timesheet", href: "/dashboard/staff/timesheet", icon: faClock },
    { name: "Setting", href: "/dashboard/staff/setting", icon: faCog },
  ];

  const sidebarItems =
    userType === "manager" ? managerSidebarItems : staffSidebarItems;

  return (
    <div className="min-h-screen flex flex-col bg-gray-s">
      <div className="flex flex-1">
        <aside className="w-64 bg-[#111111] text-[#a7a7a7] flex flex-col justify-around">
          <div className="flex flex-1 flex-col pt-8">
            <div className="px-6 py-4">
              <div className="flex items-center space-x-4">                
                <div>
                  <div className="font-bold">{userInfo?.name}</div>
                  <div className="text-sm opacity-75">{userInfo?.email}</div>
                </div>
              </div>
            </div>
            <nav className="mt-4 px-2">{renderSidebarItems(sidebarItems)}</nav>
          </div>
          <div className="mt-auto p-4">
            <Link href="/settings">
              <span className="flex items-center space-x-2 px-4 py-2 mt-2 text-sm font-semibold rounded-lg cursor-pointer hover:bg-[#1d1d1d] hover:text-[#ffffff]">
                <FontAwesomeIcon icon={faCog} />
                <span>Settings</span>
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 mt-2 text-sm font-semibold rounded-lg cursor-pointer hover:bg-[#1d1d1d] hover:text-[#ffffff] w-full text-left"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Log out</span>
            </button>
          </div>
        </aside>
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
