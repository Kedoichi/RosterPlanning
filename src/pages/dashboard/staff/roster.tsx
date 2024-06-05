import React, { useState, useEffect } from "react";
import moment from "moment";
import DashboardLayout from "../../../components/DashboardLayout";
import { db } from "../../../firebaseConfig";
import {
  collection,
  query,
  getDocs,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

type Employee = {
  role: string;
  id: string;
  name: string;
  stores: string[];
};

type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  bgColor?: string;
};
type Store = {
  id: string;
  name: string;
};

moment.locale("en", {
  week: {
    dow: 1, // Monday is the first day of the week
  },
});
const StaffRoster = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentStore, setCurrentStore] = useState<string>("");
  const [userStores, setUserStores] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentBusinesses, setCurrentBusinesses] = useState<string>("");
  const [staffStore, setStaffStore] = useState(null);
  const [storeDetails, setStoreDetails] = useState<Store[]>([]);
  const localizer = momentLocalizer(moment);

  useEffect(() => {
    const userDetailsStr = localStorage.getItem("userDetails");
    const userDetails = userDetailsStr ? JSON.parse(userDetailsStr) : null;
    setUserId(userDetails ? userDetails.userId : null);
    setCurrentBusinesses(userDetails ? userDetails.businessId : "");
  }, []);
  const fetchStoreDetails = async (stores: string[]) => {
    const storesCollection = collection(db, "stores");
    const storesDocs = await Promise.all(
      stores.map((storeId) => {
        const storeRef = doc(storesCollection, storeId);
        return getDoc(storeRef);
      })
    );

    const fetchedStores = storesDocs.map((docSnap) => ({
      id: docSnap.id,
      name: docSnap.exists() ? docSnap.data().name : "Unknown Store",
    }));

    setStoreDetails(fetchedStores);
    if (fetchedStores.length > 0) {
      setCurrentStore(fetchedStores[0].id); // Set the first store as current
    }
  };
  useEffect(() => {
    const userDetailsStr = localStorage.getItem("userDetails");
    const userDetails = userDetailsStr ? JSON.parse(userDetailsStr) : null;
    const userId = userDetails ? userDetails.userId : null;
    const businessId = userDetails ? userDetails.businessId : "";

    const fetchUserData = async () => {
      if (!userId) return;

      const userRef = doc(db, "businesses", businessId, "employees", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as Employee;
        setUserStores(userData.stores); // Stores the array of store IDs
        fetchStoreDetails(userData.stores);
      } else {
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentStore) return;

      // Fetch rosters from the current store
      const rostersRef = collection(
        db,
        "businesses",
        currentBusinesses,
        "rosters"
      );
      const q = query(rostersRef, where("storeId", "==", currentStore));
      try {
        const snapshot = await getDocs(q);

        let fetchedEvents = [];

        // Extract events from each roster document
        snapshot.forEach((doc) => {
          const rosterEvents = doc.data().events;
          rosterEvents.forEach((event) => {
            fetchedEvents.push({
              id: event.id,
              title: event.title,
              start: new Date(event.start.seconds * 1000), // Convert Firestore Timestamp to JavaScript Date
              end: new Date(event.end.seconds * 1000),
              bgColor: event.bgColor,
            });
          });
        });

        setEvents(fetchedEvents); // Update the state with the fetched events
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();
  }, [currentStore, db]); // Ensure db is included if it's from a context or prop
  // Create date objects for 6 AM and 9 PM
  const minTime = new Date();
  minTime.setHours(6, 0, 0); // Set to 6 AM

  const maxTime = new Date();
  maxTime.setHours(21, 0, 0); // Set to 9 PM
  return (
    <DashboardLayout userType="staff">
      <div>
        <h2>View Your Roster</h2>
        {userStores.length > 0 && (
          <select
            onChange={(e) => setCurrentStore(e.target.value)}
            value={currentStore}
          >
            {userStores.map((store) => (
              <option key={store} value={store}>
                Store: {store}
              </option>
            ))}
          </select>
        )}
        <ul></ul>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        defaultView="week"
        views={["week", "day"]}
        style={{ height: 500 }}
        min={minTime} // Set the minimum time for the calendar
        max={maxTime} // Set the maximum time for the calendar
        step={30}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.bgColor || "#3174ad",
          },
        })}
      />
    </DashboardLayout>
  );
};

export default StaffRoster;
