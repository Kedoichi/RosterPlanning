import { useState, useEffect } from "react";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { Employee, Event, Store } from "@/components/roster/types";

export const useRosterLogic = () => {
  const [events, setEvents] = useState<{ [key: string]: Event }>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [currentViewStart, setCurrentViewStart] = useState<Date>(new Date(0, 0, 0, 6, 0, 0));
  const [currentViewEnd, setCurrentViewEnd] = useState<Date>(new Date(0, 0, 0, 21, 0, 0));

  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");
    setBusinessId(userDetails.businessId);
  }, []);

  useEffect(() => {
    if (businessId) {
      fetchStores();
      fetchEmployees();
    }
  }, [businessId]);

  useEffect(() => {
    if (selectedStore) {
      fetchRostersForStore();
    }
  }, [selectedStore, businessId]);

  const fetchStores = async () => {
    if (!businessId) return;
    const storesSnapshot = await getDocs(collection(db, "businesses", businessId, "stores"));
    const storesData = storesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Store));
    setStores(storesData);
  };

  const fetchEmployees = async () => {
    if (!businessId) return;
    const employeesQuery = query(collection(db, "businesses", businessId, "employees"));
    const employeesSnapshot = await getDocs(employeesQuery);
    const employeesData = employeesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Employee));
    setEmployees(employeesData);
  };

  const fetchRostersForStore = async () => {
    if (!selectedStore || !businessId) return;
    const rostersRef = collection(db, "businesses", businessId, "rosters");
    const q = query(rostersRef, where("storeId", "==", selectedStore.id));
    const querySnapshot = await getDocs(q);
    const allRosterEvents = querySnapshot.docs.flatMap((doc) =>
      doc.data().events.map((event) => ({
        ...event,
        start: new Date(event.start.toDate ? event.start.toDate() : event.start),
        end: new Date(event.end.toDate ? event.end.toDate() : event.end),
        rosterId: doc.id,
      }))
    );
    setEvents(allRosterEvents.reduce((acc, event) => ({ ...acc, [event.id]: event }), {}));
  };

  return {
    events,
    employees,
    stores,
    selectedStore,
    currentViewStart,
    currentViewEnd,
    setSelectedStore,
    setCurrentViewStart,
    setCurrentViewEnd,
    fetchRostersForStore,
  };
};