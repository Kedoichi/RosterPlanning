import React, { useState, useEffect, useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import moment from "moment";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import DashboardLayout from "../../../components/DashboardLayout";
import PreviewRoster from "@/components/PreviewRoster";
import CustomEvent from "@/components/roster/CustomEvent";
import { Employee, Event, Store } from "@/components/roster/types";

moment.locale("en", { week: { dow: 1 } });
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const Roster: React.FC = () => {
  const [events, setEvents] = useState<{ [key: string]: Event }>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentView, setCurrentView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentViewStart, setCurrentViewStart] = useState<Date>(
    moment().startOf("week").toDate()
  );
  const [currentViewEnd, setCurrentViewEnd] = useState<Date>(
    moment().endOf("week").toDate()
  );
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [view, setView] = useState<"week" | "day">("week");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const displayedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return employees.slice(startIndex, endIndex);
  }, [currentPage, employees]);

  const totalPages = Math.ceil(employees.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
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

  const getTotalHours = (employeeId: string): number => {
    const employeeEvents = Object.values(events).filter(
      (event) =>
        event.employeeId === employeeId &&
        new Date(event.start) >= currentViewStart &&
        new Date(event.end) <= currentViewEnd
    );

    return employeeEvents.reduce((total, event) => {
      const start = new Date(event.start);
      const end = new Date(event.end);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // convert to hours
      return total + duration;
    }, 0);
  };
  const fetchStores = async () => {
    if (!businessId) return;
    const storesSnapshot = await getDocs(
      collection(db, "businesses", businessId, "stores")
    );
    const storesData = storesSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Store)
    );
    setStores(storesData);
  };

  const fetchEmployees = async () => {
    if (!businessId) return;
    const employeesQuery = query(
      collection(db, "businesses", businessId, "employees")
    );
    const employeesSnapshot = await getDocs(employeesQuery);
    const employeesData = employeesSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Employee)
    );
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
        start: new Date(
          event.start.toDate ? event.start.toDate() : event.start
        ),
        end: new Date(event.end.toDate ? event.end.toDate() : event.end),
        rosterId: doc.id,
      }))
    );
    setEvents(
      allRosterEvents.reduce(
        (acc, event) => ({ ...acc, [event.id]: event }),
        {}
      )
    );
  };
  const handleRangeChange = (range: Date[] | { start: Date; end: Date }) => {
    if (Array.isArray(range)) {
      setCurrentViewStart(range[0]);
      setCurrentViewEnd(range[range.length - 1]);
    } else {
      setCurrentViewStart(range.start);
      setCurrentViewEnd(range.end);
    }
  };
  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
    setCurrentViewStart(
      moment(newDate)
        .startOf(currentView as moment.unitOfTime.StartOf)
        .toDate()
    );
    setCurrentViewEnd(
      moment(newDate)
        .endOf(currentView as moment.unitOfTime.StartOf)
        .toDate()
    );
  };

  const toggleView = () => {
    setShowPreview((prevShowPreview) => !prevShowPreview);
    // When toggling, update the current view range based on the last currentDate and view
    setCurrentViewStart(
      moment(currentDate)
        .startOf(currentView as moment.unitOfTime.StartOf)
        .toDate()
    );
    setCurrentViewEnd(
      moment(currentDate)
        .endOf(currentView as moment.unitOfTime.StartOf)
        .toDate()
    );
  };
  return (
    <DashboardLayout userType="manager">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="w-64">
            <label
              htmlFor="storeSelector"
              className="block text-sm font-medium text-gray-700"
            >
              Select Store
            </label>
            <select
              id="storeSelector"
              value={selectedStore?.id || ""}
              onChange={(e) =>
                setSelectedStore(
                  stores.find((s) => s.id === e.target.value) || null
                )
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Select A Store</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-boldhighlight text-select  hover:bg-accent hover:text-offWhite "
            >
              {showPreview ? "Show Calendar View" : "Show Table View"}
            </button>
          </div>
        </div>

        <div className="flex">
          <div className="flex-grow">
            {showPreview ? (
              <PreviewRoster
                events={Object.values(events)}
                employees={employees}
                currentViewStart={currentViewStart}
                currentViewEnd={currentViewEnd}
              />
            ) : (
              <DnDCalendar
                localizer={localizer}
                events={Object.values(events)}
                resizable
                onRangeChange={handleRangeChange}
                defaultView={currentView}
                view={currentView}
                onView={handleViewChange}
                date={currentDate}
                onNavigate={handleNavigate}
                views={["week", "day"]}
                step={30}
                selectable
                min={new Date(0, 0, 0, 6, 0, 0)}
                max={new Date(0, 0, 0, 21, 0, 0)}
                showMultiDayTimes
                components={{
                  event: (props) => (
                    <CustomEvent
                      {...props}
                      view={view}
                      event={props.event as Event}
                    />
                  ),
                }}
                formats={{
                  timeGutterFormat: (
                    date: Date,
                    culture: string,
                    localizer: any
                  ) => localizer.format(date, "HH:mm", culture),
                  dayFormat: "ddd D/M",
                }}
              />
            )}
          </div>

          {!showPreview && (
            <aside className="w-64 ml-4">
              <h3 className="text-lg font-semibold mb-2  bg-offWhite rounded-md px-4 py-2 text-center">
                Employees & Hours
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-textPrimary bg-offWhite rounded-md">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-textPrimary uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-textPrimary uppercase tracking-wider">
                        Total Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-textPrimary">
                    {displayedEmployees.map((employee) => {
                      const totalHours = getTotalHours(employee.id).toFixed(2);
                      return parseFloat(totalHours) > 0 ? (
                        <tr key={employee.id}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="inline-block px-4 py-2 bg-boldhighlight text-select w-full rounded-md transition-colors duration-200 tracking-wider font-semibold">
                              {employee.name}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-right">
                            {totalHours} h
                          </td>
                        </tr>
                      ) : null;
                    })}
                  </tbody>
                </table>
              </div>
            </aside>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Roster;
