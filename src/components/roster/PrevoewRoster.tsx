import React from "react";
import { Event, Employee } from "./types";
import moment from "moment";

interface PreviewRosterProps {
  events: Event[];
  employees: Employee[];
  currentViewStart: Date;
  currentViewEnd: Date;
}

const PreviewRoster: React.FC<PreviewRosterProps> = ({
  events,
  employees,
  currentViewStart,
  currentViewEnd,
}) => {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const getEmployeeShifts = (employeeName: string) => {
    return events.filter((event) => event.title === employeeName);
  };

  const formatShiftTime = (date: Date) => {
    return moment(date).format("HH:mm");
  };

  const getTotalHours = (employeeName: string) => {
    const employeeShifts = getEmployeeShifts(employeeName);
    const totalMinutes = employeeShifts.reduce((total, shift) => {
      return total + moment(shift.end).diff(moment(shift.start), "minutes");
    }, 0);
    return (totalMinutes / 60).toFixed(2);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employee
            </th>
            {daysOfWeek.map((day) => (
              <th
                key={day}
                className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {day}
              </th>
            ))}
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Hours
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {employee.name}
              </td>
              {daysOfWeek.map((day) => {
                const dayDate = moment(currentViewStart).day(
                  daysOfWeek.indexOf(day) + 1
                );
                const shiftsForDay = getEmployeeShifts(employee.name).filter(
                  (shift) => moment(shift.start).isSame(dayDate, "day")
                );
                return (
                  <td
                    key={day}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {shiftsForDay.map((shift, index) => (
                      <div key={index}>
                        {formatShiftTime(shift.start)} -{" "}
                        {formatShiftTime(shift.end)}
                      </div>
                    ))}
                  </td>
                );
              })}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getTotalHours(employee.name)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PreviewRoster;
