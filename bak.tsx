//RosterCalender.tsx
import React, { useCallback, useEffect } from "react";
import PreviewRoster from "@/components/PreviewRoster";
import CustomEvent from "@/components/roster/CustomEvent";
import { Employee, Event } from "@/components/roster/types";
import Toolbar from "react-big-calendar/lib/Toolbar";

interface RosterCalendarProps {
  events: { [key: string]: Event };
  employees: Employee[];
  showPreview: boolean;
  currentViewStart: Date;
  currentViewEnd: Date;
  localizer: any;
  DnDCalendar: any;
  moveEvent?: (args: { event: Event; start: Date; end: Date }) => void;
  onDropFromOutside?: (args: {
    start: Date;
    end: Date;
    allDay: boolean;
  }) => void;
  handleRangeChange?: (range: Date[] | { start: Date; end: Date }) => void;
  handleSelectEvent?: (event: Event) => void;
  onEventChange?: (args: {
    event: Event;
    start: Date;
    end: Date;
    isAllDay: boolean;
  }) => void;
  onRangeChange?: (range: Date[] | { start: Date; end: Date }) => void;
  startOfWeek?: Date;
  endOfWeek?: Date;
  onWeekRangeChange: (start: Date, end: Date) => void;
}

const InitialRangeChangeToolbar = (props) => {
  useEffect(() => {
    props.onView(props.view);
    const currentDate = new Date(props.date); // Assuming props.date is in ISO format
    const startOfWeek = getStartOfWeek(currentDate);
    const endOfWeek = getEndOfWeek(currentDate);
    props.onRangeChange(startOfWeek, endOfWeek);
  }, [props]);

  const getStartOfWeek = (date) => {
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day; // Adjust when day is Sunday
    startDate.setDate(diff);
    return startDate;
  };

  const getEndOfWeek = (date) => {
    const endDate = new Date(date);
    const day = endDate.getDay();
    const diff = endDate.getDate() + (6 - day); // Adjust when day is Sunday
    endDate.setDate(diff);
    return endDate;
  };

  return <Toolbar {...props} />;
};
const RosterCalendarView: React.FC<RosterCalendarProps> = ({
  events,
  employees,
  showPreview,
  localizer,
  DnDCalendar,
  onRangeChange,
  startOfWeek,
  endOfWeek,
  handleSelectEvent,
  moveEvent,
  onDropFromOutside,
  onEventChange,
  onWeekRangeChange,
}) => {
  if (showPreview) {
    return (
      <PreviewRoster
        events={Object.values(events)}
        employees={employees}
        currentViewStart={startOfWeek}
        currentViewEnd={endOfWeek}
      />
    );
  }

  const handleRangeChange = useCallback(
    (range: Date[] | { start: Date; end: Date }) => {
      let start: Date, end: Date;
      if (Array.isArray(range)) {
        start = range[0];
        end = range[range.length - 1];
      } else {
        start = range.start;
        end = range.end;
      }
      onWeekRangeChange(start, end);
    },
    [onWeekRangeChange]
  );

  return (
    <DnDCalendar
      localizer={localizer}
      events={Object.values(events)}
      onEventDrop={moveEvent}
      resizable
      onEventResize={moveEvent}
      onDropFromOutside={onDropFromOutside}
      onRangeChange={handleRangeChange}
      onSelectEvent={handleSelectEvent}
      defaultView="week"
      views={["week", "day"]}
      step={30}
      selectable
      min={new Date(0, 0, 0, 6, 0, 0)}
      max={new Date(0, 0, 0, 21, 0, 0)}
      showMultiDayTimes
      draggableAccessor={() => true}
      components={{
        event: CustomEvent,
        toolbar: (props) => (
          <InitialRangeChangeToolbar
            {...props}
            onRangeChange={handleRangeChange}
          />
        ),
      }}
      formats={{
        timeGutterFormat: (date: Date, culture: string, localizer: any) =>
          localizer.format(date, "HH:mm", culture),
        dayFormat: "ddd D/M",
      }}
      date={startOfWeek}
      onNavigate={(newDate) => {
        const newStartOfWeek = getStartOfWeek(newDate);
        const newEndOfWeek = getEndOfWeek(newDate);
        handleRangeChange({ start: newStartOfWeek, end: newEndOfWeek });
      }}
    />
  );
};

// Helper functions (move these outside the component if they're used elsewhere)
const getStartOfWeek = (date: Date) => {
  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  return startDate;
};

const getEndOfWeek = (date: Date) => {
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  return endDate;
};
const RosterCalendarPlanner: React.FC<RosterCalendarProps> = ({
  events,
  employees,
  showPreview,
  currentViewStart,
  currentViewEnd,
  localizer,
  DnDCalendar,
  moveEvent,
  onDropFromOutside,
  handleRangeChange,
  handleSelectEvent,
  onEventChange,
}) => {
  if (showPreview) {
    return (
      <PreviewRoster
        events={Object.values(events)}
        employees={employees}
        currentViewStart={currentViewStart}
        currentViewEnd={currentViewEnd}
      />
    );
  }

  return (
    <DnDCalendar
      localizer={localizer}
      events={Object.values(events)}
      onEventDrop={moveEvent}
      resizable
      onEventResize={moveEvent}
      onDropFromOutside={onDropFromOutside}
      onRangeChange={handleRangeChange}
      onSelectEvent={handleSelectEvent}
      defaultView="week"
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
        timeGutterFormat: (date: Date, culture: string, localizer: any) =>
          localizer.format(date, "HH:mm", culture),
        dayFormat: "ddd D/M",
      }}
    />
  );
};
export default RosterCalendarView;
