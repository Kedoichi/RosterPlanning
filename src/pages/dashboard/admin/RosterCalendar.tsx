import React, { useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import moment from "moment";
import CustomEvent from "@/components/roster/CustomEvent";
import { Event } from "@/components/roster/types";

moment.locale("en", { week: { dow: 1 } });
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

interface RosterCalendarProps {
  events: { [key: string]: Event };
  currentViewStart: Date;
  currentViewEnd: Date;
  setCurrentViewStart: (date: Date) => void;
  setCurrentViewEnd: (date: Date) => void;
}

const getStartOfWeek = (date: Date): Date => {
  const startDate = new Date(date);
  const day = startDate.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Adjust if day is Sunday
  startDate.setDate(startDate.getDate() + diff);
  startDate.setHours(0, 0, 0, 0);
  return startDate;
};

const getEndOfWeek = (date: Date): Date => {
  const endDate = new Date(date);
  const day = endDate.getDay();
  const diff = day === 0 ? 0 : 7 - day; // Adjust if day is Sunday
  endDate.setDate(endDate.getDate() + diff);
  endDate.setHours(23, 59, 59, 999);
  return endDate;
};
const RosterCalendar: React.FC<RosterCalendarProps> = ({
  events,
  currentViewStart,
  currentViewEnd,
  setCurrentViewStart,
  setCurrentViewEnd,
}) => {
  useEffect(() => {
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    const endOfWeek = getEndOfWeek(today);
    setCurrentViewStart(startOfWeek);
    setCurrentViewEnd(endOfWeek);
    console.log("Initial week range:", startOfWeek, endOfWeek);
  }, [setCurrentViewStart, setCurrentViewEnd]);
  return (
    <DnDCalendar
      localizer={localizer}
      events={Object.values(events)}
      resizable
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
      onNavigate={(newDate: Date) => {
        const startOfWeek = getStartOfWeek(newDate);
        const endOfWeek = getEndOfWeek(newDate);
        setCurrentViewStart(startOfWeek);
        setCurrentViewEnd(endOfWeek);
        console.log(startOfWeek, endOfWeek);
      }}
    />
  );
};

export default RosterCalendar;
