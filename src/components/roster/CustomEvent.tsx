import React from "react";
import { Event } from "./types";
import moment from "moment";

interface CustomEventProps {
  event: Event;
  view: string;
}

const CustomEvent: React.FC<CustomEventProps> = ({ event, view }) => {
  const start = moment(event.start);
  const end = moment(event.end);
  const durationMs = end.diff(start);
  const duration = moment.duration(durationMs);
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();

  // Conditional background color
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
      className={`flex flex-col justify-between h-full w-full py-2 px-3 rounded-lg shadow ${bgColorClass} text-gray-800 overflow-hidden`}
    >
      <div className="flex h-full gap-2 justify-evenly">
        {/* Event title and duration */}
        <div className="flex flex-col items-center">
          <strong className="font-bold text-md truncate pb-3">
            {event.title}
          </strong>
          <div className="text-sm">
            {hours}h {minutes}m
          </div>
        </div>

        {/* Show times in 'day' view */}
        {view === "day" && (
          <div className="flex flex-col justify-between h-full items-end">
            <span>{start.format("HH:mm")}</span>
            <span>{end.format("HH:mm")}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomEvent;
