import React from "react";
import moment from "moment";

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
  duration: number;
  resourceId?: string;
  bgColor?: string;
};

const PreviewRoster = ({
  events,
  employees,
  currentViewStart,
  currentViewEnd,
}: {
  events: Event[];
  employees: Employee[];
  currentViewStart: Date;
  currentViewEnd: Date;
}) => {
  // Generate array of dates for the current view range
  const dates = [];
  let currentDate = moment(currentViewStart);
  while (currentDate <= moment(currentViewEnd)) {
    dates.push(currentDate.toDate());
    currentDate.add(1, "days");
  }

  // Filter events within the current viewing range
  const filteredEvents = events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return eventStart >= currentViewStart && eventEnd <= currentViewEnd;
  });

  // Organize events by date for easy access
  const eventsByDate = dates.reduce((acc, date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    acc[formattedDate] = filteredEvents.filter((event) => {
      return moment(event.start).isSame(date, "day");
    });
    return acc;
  }, {});

  // Calculate total shifts and hours for each employee
  const getTotalShiftsAndHours = (employeeName: string) => {
    return filteredEvents.reduce(
      (acc, event) => {
        if (event.title === employeeName) {
          const duration = moment(event.end).diff(
            moment(event.start),
            "hours",
            true
          );
          return {
            shifts: acc.shifts + 1,
            hours: acc.hours + duration,
          };
        }
        return acc;
      },
      { shifts: 0, hours: 0 }
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employee
            </th>
            {dates.map((date) => (
              <th
                key={date.toString()}
                className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {moment(date).format("ddd D MMM")}
              </th>
            ))}
            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {employee.name}
              </td>
              {dates.map((date) => {
                const formattedDate = moment(date).format("YYYY-MM-DD");
                const shifts =
                  eventsByDate[formattedDate]
                    ?.filter((e) => e.title === employee.name)
                    .map(
                      (e) =>
                        `${moment(e.start).format("HH:mm")} - ${moment(
                          e.end
                        ).format("HH:mm")}`
                    )
                    .join(", ") || "";
                return (
                  <td
                    key={date.toString()}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {shifts}
                  </td>
                );
              })}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(() => {
                  const { shifts, hours } = getTotalShiftsAndHours(
                    employee.name
                  );
                  return `${shifts} shifts (${hours.toFixed(2)} hours)`;
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PreviewRoster;
