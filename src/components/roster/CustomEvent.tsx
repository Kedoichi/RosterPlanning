import React from "react";
import { Event } from "./types";
import moment from "moment";

interface CustomEventProps {
  event: Event;
}

const CustomEvent: React.FC<CustomEventProps> = ({ event }) => {
  const start = moment(event.start);
  const end = moment(event.end);
  const durationMs = end.diff(start);
  const duration = moment.duration(durationMs);
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();

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
      <div className="flex justify-between items-start">
        <strong className="font-bold text-md truncate">{event.title}</strong>
        <span className="text-base font-semibold">{start.format("HH:mm")}</span>
      </div>
      <div className="text-base">
        {hours}h {minutes}m
      </div>
      <div className="flex justify-end items-end text-base">
        <span>{end.format("HH:mm")}</span>
      </div>
    </div>
  );
};

export default CustomEvent;
