import React, { useState, useEffect } from "react";
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
import Link from "next/link";

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
              className={`flex items-center space-x-2 py-4 px-4 text-base font-semibold rounded-lg cursor-pointer ${
                router.pathname === item.href
                  ? "bg-select text-textSelected my-1"
                  : "hover:bg-accent hover:text-offWhite"
              }`}
            >
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.name}</span>
            </span>
          </Link>
        ) : (
          <div
            className={`flex justify-between items-center px-4 py-4 text-base font-semibold rounded-lg cursor-pointer ${
              router.pathname === item.href
                ? "bg-select text-textSelected"
                : "hover:bg-accent hover:text-offWhite"
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
    <div className="min-h-screen flex flex-col bg-offWhite">
      <div className="flex flex-1">
        <aside className="w-60 bg-secondary text-textPrimary flex flex-col justify-between inset-y-0 pt-8">
          <nav className="mt-4 px-2">{renderSidebarItems(sidebarItems)}</nav>
          <div className="mt-auto p-4 flex flex-col items-start">
            <div className="px-6 py-4 w-full rounded-xl border-1 border-border bg-highlight">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="font-bold">{userInfo?.name}</div>
                  <div className="text-sm opacity-75">{userInfo?.email}</div>
                </div>
              </div>
            </div>

            <hr className="w-full border-[1px] border-border mt-4"></hr>

            <button
              onClick={() => router.push("/settings")}
              className="flex items-center space-x-2 px-4 py-3 w-full text-base font-semibold rounded-lg cursor-pointer hover:bg-accent hover:text-offWhite"
            >
              <FontAwesomeIcon icon={faCog} />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-3 w-full text-base font-semibold rounded-lg cursor-pointer hover:bg-accent hover:text-offWhite"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Log out</span>
            </button>
          </div>
        </aside>
        <main className="flex-1 p-4 bg-survey overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
