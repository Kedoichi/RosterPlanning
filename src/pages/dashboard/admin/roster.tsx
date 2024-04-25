import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.scss";
import moment from "moment";
import DashboardLayout from "../../../components/DashboardLayout";
import { db } from "../../../firebaseConfig";
import { collection, query, getDocs } from "firebase/firestore";

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
  title: string;
  start: Date;
  end: Date;
  duration: number; // in minutes
  resourceId?: string; // optional property if you're using resource views
};

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const Roster = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isControlPressed, setIsControlPressed] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      const userDetailsStr = localStorage.getItem("userDetails");
      const userDetails = userDetailsStr ? JSON.parse(userDetailsStr) : null;
      if (userDetails && userDetails.businessId) {
        const employeesQuery = query(
          collection(db, "businesses", userDetails.businessId, "employees")
        );
        const employeesSnapshot = await getDocs(employeesQuery);
        const employeesData = employeesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Employee[];
        setEmployees(employeesData);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        setIsControlPressed(true);
      }
    };

    const handleKeyUp = (event) => {
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
  let eventIdCounter = 0;
  const generateNewId = () => {
    eventIdCounter += 1;
    return eventIdCounter;
  };
  const moveEvent = ({ event, start, end, isAllDay: droppedOnAllDaySlot }) => {
    const updatedEvent = { ...event, start, end };

    if (isControlPressed) {
      // Clone the event. Assign a new ID for the clone, and adjust the start and end times as necessary
      const clone = { ...updatedEvent, id: generateNewId() };
      setEvents((prevEvents) => [...prevEvents, clone]);
    } else {
      // Move the event as usual
      setEvents((prevEvents) =>
        prevEvents.map((existingEvent) =>
          existingEvent.id === event.id ? updatedEvent : existingEvent
        )
      );
    }
  };
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== selectedEvent.id)
      );
      setSelectedEvent(null); // Hide the form after deletion
    }
  };
  const handleSelectEvent = (event) => {
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

    // Rest of the code...
  }) => {
    const event = {
      title: window.draggedEmployeeName,
      start,
      end: new Date(start.getTime() + 3 * 60 * 60 * 1000), // 3 hours laterend,
      allDay: allDay,
    };
    setEvents((prev) => [...prev, event]);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (selectedEmployee) {
      const newEvent = {
        title: selectedEmployee.name,
        start: slotInfo.start,
        end: slotInfo.end,
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
      setSelectedEmployee(null); // Clear selection after adding
    }
  };
  // Function to handle form submission for event updates
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const updatedEvents = events.map((event) =>
      event.id === selectedEvent.id
        ? {
            ...event,
            title: selectedEvent.title,
            start: selectedEvent.start,
            end: selectedEvent.end,
          }
        : event
    );
    setEvents(updatedEvents);
    setSelectedEvent(null); // Hide the form after submission
  };
  const handleDragStart = (employee: Employee) => {
    setSelectedEmployee(employee);
  };
  const CustomEvent = ({ event }) => {
    let durationMs = event.end - event.start;
    let durationMin = Math.floor(durationMs / 60000);
    let hours = Math.floor(durationMin / 60);
    let minutes = durationMin % 60;
    return (
      <span>
        <div className="p-2"></div>
        <strong>{event.title}</strong>
        <div className="p-1"></div>
        {hours} h {minutes} m
      </span>
    );
  };
  return (
    <DashboardLayout userType="manager">
      <div className="flex">
        <div style={{ height: "500pt", flex: 1 }}>
          <DnDCalendar
            localizer={localizer}
            events={events}
            onEventDrop={moveEvent}
            resizable
            onEventResize={moveEvent}
            onDropFromOutside={onDropFromOutside}
            selectable
            defaultView="week"
            onSelectEvent={handleSelectEvent}
            views={["week", "day"]}
            step={30}
            showMultiDayTimes
            draggableAccessor={() => true} // allows all events to be draggable
            components={{
              event: CustomEvent, // Use the custom event component
            }}
          />
        </div>
        <aside className="w-64">
          <h3 className="text-xl font-semibold mb-4">Employees</h3>
          <ul className="list-none p-0 m-0">
            {employees.map((employee) => (
              <li
                key={employee.id}
                draggable={true}
                onDragStart={(e) => {
                  window.draggedEmployeeName = employee.name; // You will need to set up this global variable to make it available for the calendar's drag and drop functionality
                }}
                className="mb-3 p-2 bg-gray-100 rounded cursor-pointer"
              >
                {employee.name}
              </li>
            ))}
          </ul>
        </aside>
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
                <input
                  type="text"
                  id="eventTitle"
                  value={selectedEvent.title}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      title: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
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
                  value={selectedEvent.start.toISOString().slice(0, 16)}
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
                  value={selectedEvent.end.toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      end: new Date(e.target.value),
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
