import React, { useState, useEffect, useCallback } from "react";

declare global {
  interface Window {
    draggedEmployeeData: { id: string; name: string };
  }
}
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import {
  collection,
  query,
  getDocs,
  where,
  setDoc,
  doc,
  or,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import DashboardLayout from "../../../components/DashboardLayout";
import PreviewRoster from "@/components/PreviewRoster";
import CustomEvent from "@/components/roster/CustomEvent";
import EventModal from "@/components/roster/EventModal";
import { Employee, Event, Store } from "@/components/roster/types";

moment.locale("en", { week: { dow: 1 } });
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const Roster: React.FC = () => {
  const [displayEvents, setDisplayEvents] = useState<{ [key: string]: Event }>(
    {}
  );
  const [saveEvents, setSaveEvents] = useState<{ [key: string]: Event }>({});

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [staffStore, setStaffStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isControlPressed, setIsControlPressed] = useState(false);
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
    if (businessId) {
      fetchEmployees();
    }
  }, [staffStore]);

  useEffect(() => {
    if (selectedStore) {
      fetchRostersForStore();
    }
  }, [selectedStore, businessId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) =>
      setIsControlPressed(event.ctrlKey || event.metaKey);
    const handleKeyUp = () => setIsControlPressed(false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  const getTotalHours = useCallback(
    (employeeName: string): number => {
      const employeeEvents = Object.values(displayEvents).filter(
        (event) =>
          event.title === employeeName &&
          new Date(event.start) >= currentViewStart &&
          new Date(event.end) <= currentViewEnd
      );

      return employeeEvents.reduce((total, event) => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // convert to hours
        return total + duration;
      }, 0);
    },
    [displayEvents, currentViewStart, currentViewEnd]
  );
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
    const baseQuery = collection(db, "businesses", businessId, "employees");

    let employeesQuery;
    if (staffStore) {
      employeesQuery = query(
        baseQuery,
        or(
          where("stores", "array-contains", staffStore.id),
          where("role", "==", "manager")
        )
      );
    } else {
      employeesQuery = baseQuery;
    }
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
    const eventsObj = allRosterEvents.reduce(
      (acc, event) => ({ ...acc, [event.id]: event }),
      {}
    );
    setDisplayEvents(eventsObj);
    setSaveEvents(eventsObj);
  };

  const handleRangeChange = (range: Date[] | { start: Date; end: Date }) => {
    if (Array.isArray(range)) {
      setCurrentViewStart(range[0]);
      setCurrentViewEnd(range[range.length - 1]);
    } else {
      setCurrentViewStart(range.start);
      setCurrentViewEnd(range.end);
    }

    const hasUnsavedChanges =
      JSON.stringify(displayEvents) !== JSON.stringify(saveEvents);
    if (hasUnsavedChanges) {
      const confirmChange = window.confirm(
        "You have unsaved changes. Moving to another week will discard these changes. Do you want to continue?"
      );
      if (confirmChange) {
        setDisplayEvents(saveEvents);
      } else {
        // Revert the range change
        return;
      }
    }
  };

  const moveEvent = ({
    event,
    start,
    end,
  }: {
    event: Event;
    start: Date;
    end: Date;
  }) => {
    const id = isControlPressed ? uuidv4() : event.id;
    const isPastEvent = moment(start).isBefore(moment(), "day");

    if (isPastEvent) {
      alert("Cannot edit events from previous weeks.");
      return;
    }

    setDisplayEvents((prevEvents) => ({
      ...prevEvents,
      [id]: { ...event, id, start, end },
    }));
  };

  const handleSelectEvent = (event: Event) => setSelectedEvent(event);

  const onDropFromOutside = ({
    start,
    end,
    allDay,
  }: {
    start: Date;
    end: Date;
    allDay: boolean;
  }) => {
    const isPastEvent = moment(start).isBefore(moment(), "day");

    if (isPastEvent) {
      alert("Cannot add events to previous weeks.");
      return;
    }

    const id = uuidv4();
    const draggedEmployee = window.draggedEmployeeData;

    if (draggedEmployee) {
      const { id: employeeId, name: employeeName } = draggedEmployee;

      setDisplayEvents((prevEvents) => ({
        ...prevEvents,
        [id]: {
          id,
          title: employeeName,
          employeeId,
          start,
          end: new Date(start.getTime() + 3 * 60 * 60 * 1000),
          allDay,
          duration: 0,
        },
      }));
    }

    console.log(displayEvents);
  };

  const saveRoster = async () => {
    if (!selectedStore) {
      alert("Please select a store for saving the roster.");
      return;
    }

    const rosterEvents = Object.values(displayEvents)
      .filter((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return eventStart >= currentViewStart && eventEnd <= currentViewEnd;
      })
      .map((event) => ({
        ...event,
        employeeId: event.employeeId,
      }));

    const rosterId = `${selectedStore.name}-${moment(currentViewEnd).format(
      "DDMMMYYYY"
    )}`;
    const roster = {
      id: rosterId,
      events: rosterEvents,
      storeId: selectedStore.id,
    };

    try {
      const rostersRef = collection(db, "businesses", businessId!, "rosters");
      await setDoc(doc(rostersRef, rosterId), roster);
      alert("Roster saved successfully!");
      setSaveEvents(displayEvents);
    } catch (error) {
      console.error("Error saving roster:", error);
      alert("Failed to save roster.");
    }
  };

  const handleEventUpdate = (updatedEvent: Event) => {
    const isPastEvent = moment(updatedEvent.start).isBefore(moment(), "day");

    if (isPastEvent) {
      alert("Cannot edit events from previous weeks.");
      return;
    }

    setDisplayEvents((prevEvents) => ({
      ...prevEvents,
      [updatedEvent.id]: updatedEvent,
    }));
    setSelectedEvent(null);
  };
  const handleEventDelete = (eventId: string) => {
    const eventToDelete = displayEvents[eventId];
    const isPastEvent = moment(eventToDelete.start).isBefore(moment(), "day");

    if (isPastEvent) {
      alert("Cannot delete events from previous weeks.");
      return;
    }

    setDisplayEvents((prevEvents) => {
      const { [eventId]: deletedEvent, ...remainingEvents } = prevEvents;
      return remainingEvents;
    });
    setSelectedEvent(null);
  };

  const onEventChange = (args: {
    event: Event;
    start: Date;
    end: Date;
    isAllDay: boolean;
  }) => {
    const { event, start, end } = args;
    moveEvent({ event, start, end });
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
  if (!selectedStore) {
    return (
      <DashboardLayout userType="manager">
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl font-bold mb-4">
            Please select a store to continue
          </h2>
          <select
            value={selectedStore?.id || ""}
            onChange={(e) =>
              setSelectedStore(
                stores.find((s) => s.id === e.target.value) || null
              )
            }
            className="mt-1 block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select A Store</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      </DashboardLayout>
    );
  }
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
            <button
              onClick={saveRoster}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md  bg-boldhighlight text-select  hover:bg-accent hover:text-offWhite "
            >
              Save Roster
            </button>
          </div>
        </div>

        <div className="flex">
          <div className="flex-grow">
            {showPreview ? (
              <PreviewRoster
                events={Object.values(displayEvents)}
                employees={employees}
                currentViewStart={currentViewStart}
                currentViewEnd={currentViewEnd}
              />
            ) : (
              <DnDCalendar
                localizer={localizer}
                events={Object.values(displayEvents)}
                onEventDrop={moveEvent}
                resizable
                onEventResize={moveEvent}
                onDropFromOutside={onDropFromOutside}
                onRangeChange={handleRangeChange}
                onSelectEvent={handleSelectEvent}
                onEventDrop={onEventChange}
                onEventResize={onEventChange}
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
                draggableAccessor={() => true}
                components={{
                  event: CustomEvent,
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
              <select
                id="staffStoreSelector"
                value={staffStore?.id || ""}
                onChange={(e) => {
                  const store =
                    stores.find((s) => s.id === e.target.value) || null;
                  setStaffStore(store);
                }}
                className="mb-4 w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Stores</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
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
                    {employees.map((employee) => {
                      const totalHours = getTotalHours(employee.name).toFixed(
                        2
                      );
                      return (
                        <tr key={employee.id}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              data-id={employee.id}
                              draggable={true}
                              onDragStart={() => {
                                window.draggedEmployeeData = {
                                  id: employee.id,
                                  name: employee.name,
                                };
                              }}
                              className="inline-block px-4 py-2 cursor-move bg-boldhighlight text-select w-full rounded-md  hover:bg-accent hover:text-offWhite  transition-colors duration-200 tracking-wider font-semibold"
                            >
                              {employee.name}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-right">
                            {totalHours} h
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </aside>
          )}
        </div>
      </div>

      {selectedEvent && (
        <div className="z-30">
          <EventModal
            event={selectedEvent}
            employees={employees}
            onSave={handleEventUpdate}
            onDelete={handleEventDelete}
            onClose={() => setSelectedEvent(null)}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default Roster;
