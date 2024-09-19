import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import moment from "moment";
import DashboardLayout from "../../../components/DashboardLayout";
import { useRosterLogic } from "./useRosterLogic";
import { RosterHeaderPlan } from "./RosterHeader";
import { RosterCalendarPlanner } from "./RosterCalendar";
import EmployeeSidebar from "./EmployeeSidebar";
import EventModal from "@/components/roster/EventModal";

moment.locale("en", { week: { dow: 1 } });
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const Roster: React.FC = () => {
  const {
    events,
    employees,
    stores,
    selectedStore,
    selectedEvent,
    showPreview,
    currentViewStart,
    currentViewEnd,
    setSelectedStore,
    setShowPreview,
    saveRoster,
    handleEventUpdate,
    handleEventDelete,
    setSelectedEvent,
    moveEvent,
    onDropFromOutside,
    handleRangeChange,
    handleSelectEvent,
    onEventChange,
  } = useRosterLogic();

  return (
    <DashboardLayout userType="manager">
      <div className="flex flex-col space-y-4">
        <RosterHeaderPlan
          stores={stores}
          selectedStore={selectedStore}
          setSelectedStore={setSelectedStore}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          saveRoster={saveRoster}
        />

        <div className="flex">
          <div className="flex-grow">
            <RosterCalendarPlanner
              events={events}
              employees={employees}
              showPreview={showPreview}
              currentViewStart={currentViewStart}
              currentViewEnd={currentViewEnd}
              localizer={localizer}
              DnDCalendar={DnDCalendar}
              moveEvent={moveEvent}
              onDropFromOutside={onDropFromOutside}
              handleRangeChange={handleRangeChange}
              handleSelectEvent={handleSelectEvent}
              onEventChange={onEventChange}
            />
          </div>

          {!showPreview && (
            <EmployeeSidebar
              employees={employees}
              stores={stores}
              events={events}
              currentViewStart={currentViewStart}
              currentViewEnd={currentViewEnd}
            />
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
