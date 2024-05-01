import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.scss";
import moment from "moment";
import PreviewRoster from "@/components/PreviewRoster";
import DashboardLayout from "../../../components/DashboardLayout";
import { db } from "../../../firebaseConfig";
import {
  collection,
  query,
  getDocs,
  where,
  documentId,
  setDoc,
  doc,
  getDoc,
  orderBy,
  startAt,
  endAt,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
declare global {
  interface Window {
    draggedEmployeeName: string;
  }
}

type Employee = {
  role: string;
  id: string;
  name: string;
};

type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  duration: number; // in minutes
  resourceId?: string; // optional property if you're using resource views
  bgColor?: string; // New property for background color
};
moment.locale("en", {
  week: {
    dow: 1, // Monday is the first day of the week
  },
});
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const Roster = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [events, setEvents] = useState<{ [key: string]: Event }>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [storeForSaving, setStoreForSaving] = useState(null);
  const [isControlPressed, setIsControlPressed] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [staffStore, setStaffStore] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [currentViewStart, setCurrentViewStart] = useState<Date>(
    moment().startOf("week").toDate()
  );
  const [currentViewEnd, setCurrentViewEnd] = useState<Date>(
    moment().endOf("week").toDate()
  );

  const [stores, setStores] = useState([]);
  useEffect(() => {
    // Since useEffect runs on the client, it's safe to access localStorage here
    const userDetailsStr = localStorage.getItem("userDetails");
    if (userDetailsStr) {
      const userDetails = JSON.parse(userDetailsStr);
      setBusinessId(userDetails.businessId);
    } else {
      // Handle the case where userDetails is not set in localStorage
      console.error("No user details found in localStorage.");
      // Redirect to login or show an error message
    }
  }, []);
  useEffect(() => {
    const fetchRostersForStore = async () => {
      if (!storeForSaving || !businessId) return;

      const rostersRef = collection(db, "businesses", businessId, "rosters");
      const q = query(rostersRef, where("storeId", "==", storeForSaving.id));

      try {
        console.log("in try");

        const querySnapshot = await getDocs(q);
        let allRosterEvents = [];
        querySnapshot.forEach((doc) => {
          // Assuming that 'events' is an array of objects and 'start' and 'end' are Firestore Timestamps
          const rosterEvents = doc.data().events.map((event) => ({
            id: event.id,
            title: event.title,
            start: event.start.toDate
              ? new Date(event.start.toDate())
              : new Date(event.start),
            end: event.end.toDate
              ? new Date(event.end.toDate())
              : new Date(event.end),

            duration: event.duration,
            resourceId: event.resourceId,
            bgColor: event.bgColor,
            rosterId: doc.id, // Store roster ID with each event for reference
          }));
          allRosterEvents = [...allRosterEvents, ...rosterEvents];
        });
        // Now you have all events from all rosters for the given store
        // You can now set them into your state
        setEvents(
          allRosterEvents.reduce((acc, event) => {
            acc[event.id] = event; // Store each event by its id
            return acc;
          }, {})
        );
      } catch (error) {
        console.error("Error fetching rosters for store:", error);
      }
    };
    fetchRostersForStore();
  }, [storeForSaving, businessId]);
  useEffect(() => {
    const fetchEmployees = async () => {
      let employeesQuery;
      if (staffStore) {
        // Query for employees who are part of the selected store
        employeesQuery = query(
          collection(db, "businesses", businessId, "employees"),
          where("stores", "array-contains", staffStore.id)
        );
      } else {
        // Query for all employees
        employeesQuery = query(
          collection(db, "businesses", businessId, "employees")
        );
      }

      try {
        const employeesSnapshot = await getDocs(employeesQuery);
        const employeesData = employeesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Employee[];
        setEmployees(employeesData);
      } catch (error) {
        console.error("Error fetching employees:", error);
        // Handle errors, e.g., show an error message to the user
      }
    };

    if (businessId) {
      fetchEmployees();
    }
  }, [staffStore, businessId]);

  useEffect(() => {
    const fetchStores = async () => {
      if (businessId) {
        // Make sure businessId is not null
        const storesSnapshot = await getDocs(
          collection(db, "businesses", businessId, "stores")
        );
        const storesData = storesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          employees: doc.data().employees, // Assuming you have an array of employee IDs
        }));
        setStores(storesData);
      }
    };

    if (businessId) {
      // Only run fetchStores if businessId is available
      fetchStores();
    }
  }, [businessId]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        setIsControlPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Control" || event.key === "Meta") {
        setIsControlPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  const handleRangeChange = (range) => {
    // This will depend on the view type, for 'week' view it gives an array of days in the week
    if (Array.isArray(range)) {
      setCurrentViewStart(range[0]);
      setCurrentViewEnd(range[range.length - 1]);
    } else {
      // For 'day' view, it gives the current day, you can handle this as needed
    }
  };

  const handleNavigate = (date) => {
    // Update the state to the current week being viewed
    setCurrentViewStart(moment(date).startOf("week").toDate());
    setCurrentViewEnd(moment(date).endOf("week").toDate());
  };
  const getTotalHours = (employeeId) => {
    const employeeEvents = Object.values(events).filter(
      (event) =>
        event.title === employeeId &&
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
  const generateNewId = uuidv4;
  // Handling the movement or duplication of an event
  const moveEvent = ({
    event,
    start,
    end,
  }: {
    event: Event;
    start: Date | string; // Accept string if there's a possibility of receiving a string representation of the date
    end: Date | string;
  }) => {
    // If 'start' or 'end' are strings, convert them to Date objects
    const newStart = typeof start === "string" ? new Date(start) : start;
    const newEnd = typeof end === "string" ? new Date(end) : end;

    const id = event.id || uuidv4(); // Use existing ID or generate a new one
    if (isControlPressed) {
      // Duplicate the event
      const newId = generateNewId();
      setEvents((prevEvents) => {
        // Add the new event as a duplicate of the existing one, with a new ID
        const updatedEvents = {
          ...prevEvents,
          [newId]: { ...event, id: newId, start: newStart, end: newEnd },
        };
        return updatedEvents;
      });
    } else {
      // Move the event
      setEvents((prevEvents) => {
        // Update event by key
        const updatedEvents = {
          ...prevEvents,
          [id]: { ...event, start: newStart, end: newEnd },
        };
        return updatedEvents;
      });
    }
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents((prevEvents) => {
        const updatedEvents = { ...prevEvents };
        delete updatedEvents[(selectedEvent as Event).id];
        return updatedEvents;
      });
      setSelectedEvent(null);
    }
  };
  const handleSelectEvent = (event: Event) => {
    console.log(event);
    setSelectedEvent(event);
  };
  const onDropFromOutside = ({
    start,
    end,
    allDay,
  }: {
    start: Date;
    end: Date;
    allDay: boolean;
  }) => {
    const id = uuidv4(); // Generate a new ID for the new event
    const title = window.draggedEmployeeName;
    // Create new event and add to state
    setEvents((prevEvents) => ({
      ...prevEvents,
      [id]: {
        id,
        title,
        start,
        end: new Date(start.getTime() + 3 * 60 * 60 * 1000),
        allDay,
        duration: 0, // Add the required duration property
      },
    }));
  };
  const saveRoster = async () => {
    if (!storeForSaving) {
      alert("Please select a store for saving the roster.");
      return;
    }

    // Find the latest event date to determine the current week's Monday
    const latestEventDate = new Date(
      Math.max(
        ...Object.values(events).map((event) => new Date(event.start).getTime())
      )
    );
    // Find the Monday of that week
    const startOfWeek = moment(latestEventDate).startOf("isoWeek").toDate();
    // find the sunday of week
    const endOfWeek = moment(latestEventDate).endOf("isoWeek").toDate();

    // Filter the events to only include those that are within the current week
    const rosterEvents = Object.values(events).filter((event) => {
      let eventStart = event.start;
      let eventEnd = event.end;

      // Check if start and end are not Date objects and try to convert them
      if (!(eventStart instanceof Date)) eventStart = new Date(eventStart);
      if (!(eventEnd instanceof Date)) eventEnd = new Date(eventEnd);

      // Now eventStart and eventEnd should be Date objects
      return eventStart >= startOfWeek && eventEnd < endOfWeek;
    });

    // Construct the roster ID using the store name and the starting Monday date
    const rosterId = `${storeForSaving.name}-${moment(endOfWeek).format(
      "DDMMMYYYY"
    )}`;

    // Define the roster object with events from the current week
    const roster = {
      id: rosterId,
      events: rosterEvents,
      storeId: storeForSaving.id, // Use the store ID
    };

    // Save the roster to Firestore
    try {
      const rostersRef = collection(db, "businesses", businessId, "rosters");
      await setDoc(doc(rostersRef, rosterId), roster); // Create or overwrite the document with the rosterId
      alert("Roster saved successfully!");
    } catch (error) {
      console.error("Error saving roster:", error);
      alert("Failed to save roster.");
    }
  };

  // Function to handle form submission for event updates
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent) {
      setEvents((prevEvents) => ({
        ...prevEvents,
        [(selectedEvent as Event).id]: {
          ...prevEvents[(selectedEvent as Event).id],
          title: selectedEvent.title as string,
          start: selectedEvent.start as Date,
          end: selectedEvent.end as Date,
          bgColor: selectedEvent.bgColor as string,
        },
      }));
      setSelectedEvent(null);
    }
  };
  const handleDragStart = (employee: Employee) => {
    setSelectedEmployee(employee);
  };
  const CustomEvent = ({ event }: { event: Event }) => {
    let durationMs = event.end.getTime() - event.start.getTime();
    let durationMin = Math.floor(durationMs / 60000);
    let hours = Math.floor(durationMin / 60);
    let minutes = durationMin % 60;

    // Determine the background color based on the event.bgColor
    const bgColorClass =
      event.bgColor === "#FF8F8F"
        ? "bg-red-200"
        : event.bgColor === "#EEF296"
        ? "bg-yellow-200"
        : event.bgColor === "#9ADE7B"
        ? "bg-green-200"
        : "bg-blue-200";

    return (
      <div
        className={`flex flex-col justify-evenly h-full p-1 rounded shadow ${bgColorClass} text-[#508D69]`}
      >
        <strong className="font-bold">{event.title}</strong>
        <span className="text-lg">
          {hours}h {minutes}m
        </span>
      </div>
    );
  };

  // Convert events object to an array for the calendar component
  const eventsArray = Object.values(events);
  const toLocalTimeString = (date) => {
    const offset = date.getTimezoneOffset() * 60000; // Convert offset to milliseconds
    const localISOTime = new Date(date - offset).toISOString().slice(0, -1);
    return localISOTime.slice(0, 16);
  };
  const ColorPicker = ({ onSelectColor }) => {
    const colors = ["#FF8F8F", "#EEF296", "#9ADE7B"];

    return (
      <div style={{ display: "flex", gap: "10px" }}>
        {colors.map((color) => (
          <div
            key={color}
            onClick={() => onSelectColor(color)}
            style={{
              width: "25px",
              height: "25px",
              backgroundColor: color,
              cursor: "pointer",
            }}
          ></div>
        ))}
      </div>
    );
  };

  // Create date objects for 6 AM and 9 PM
  const minTime = new Date();
  minTime.setHours(6, 0, 0); // Set to 6 AM

  const maxTime = new Date();
  maxTime.setHours(21, 0, 0); // Set to 9 PM
  return (
    <DashboardLayout userType="manager">
      {/* Store selector */}

      <div className="flex">
        <div className="flex-1 pr-4 ">
          <div className="mb-4 w-full flex justify-between items-center">
            <div className="flex-grow flex-auto">
              <label
                htmlFor="storeSelector"
                className="block text-xl font-bold text-gray-700"
              >
                Roster for store:
              </label>
              <select
                id="storeSelector"
                value={storeForSaving?.id || ""}
                onChange={(e) => {
                  const store = stores.find((s) => s.id === e.target.value);
                  setStoreForSaving(store);
                }}
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
            <div className="flex ">
              {/* Button to toggle between views */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 self-start"
              >
                {showPreview ? "Show Calendar View" : "Show Preview View"}
              </button>
              <button
                onClick={saveRoster}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 self-start"
              >
                Save Roster
              </button>
            </div>
          </div>
          {showPreview ? (
            <PreviewRoster
              events={Object.values(events)}
              employees={employees}
              currentViewStart={currentViewStart}
              currentViewEnd={currentViewEnd}
            />
          ) : (
            <DnDCalendar
              style={{ height: "500pt" }}
              localizer={localizer}
              events={eventsArray}
              onEventDrop={moveEvent}
              resizable
              onEventResize={moveEvent}
              onDropFromOutside={onDropFromOutside}
              onNavigate={handleNavigate}
              onView={handleRangeChange}
              onRangeChange={handleRangeChange}
              selectable
              defaultView="week"
              min={minTime} // Set the minimum time for the calendar
              max={maxTime} // Set the maximum time for the calendar
              onSelectEvent={handleSelectEvent}
              views={["week", "day"]}
              step={30}
              showMultiDayTimes
              draggableAccessor={() => true} // allows all events to be draggable
              components={{
                event: CustomEvent, // Use the custom event component
              }}
            />
          )}
        </div>
        {!showPreview ? (
          <aside className="w-64">
            <h3 className="text-xl font-semibold mb-4">Employees & Hours</h3>
            <select
              id="storeSelector"
              value={staffStore?.id || ""}
              onChange={(e) => {
                const store = stores.find((s) => s.id === e.target.value);
                setStaffStore(store);
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Store</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hours
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-500">
                  {employees.map((employee) => {
                    const totalHours = getTotalHours(employee.name).toFixed(2);
                    return (
                      <tr key={employee.id}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            key={employee.id}
                            draggable={true}
                            onDragStart={(e) => {
                              window.draggedEmployeeName = employee.name; // You will need to set up this global variable to make it available for the calendar's drag and drop functionality
                            }}
                            className="mb-3 p-2 bg-gray-100 rounded cursor-pointer"
                          >
                            {employee.name}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {totalHours} h
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </aside>
        ) : null}
      </div>
      {selectedEvent && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-gray-700 bg-opacity-50">
          {/* Modal Background */}
          <div className="bg-white p-6 rounded shadow-lg">
            {/* Modal Content */}
            <h2 className="text-lg font-bold mb-4">Edit Shift</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="eventTitle"
                  className="block text-sm font-medium text-gray-700"
                >
                  Staff
                </label>
                <select
                  id="eventEmployee"
                  value={selectedEvent.title}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      title: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.name}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  value={toLocalTimeString(selectedEvent.start)}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      start: new Date(e.target.value),
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  value={toLocalTimeString(selectedEvent.end)}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      end: new Date(e.target.value),
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label htmlFor="eventBgColor">Background Color:</label>
                <ColorPicker
                  onSelectColor={(color) => {
                    setSelectedEvent({ ...selectedEvent, bgColor: color });
                  }}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Roster;
