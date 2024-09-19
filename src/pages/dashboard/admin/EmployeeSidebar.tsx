import React, { useState } from "react";
import { Employee, Event, Store } from "@/components/roster/types";

interface EmployeeSidebarProps {
  employees: Employee[];
  events: { [key: string]: Event };
  stores: Store[];
  currentViewStart: Date;
  currentViewEnd: Date;
}

const EmployeeSidebar: React.FC<EmployeeSidebarProps> = ({
  employees,
  events,
  stores,
  currentViewStart,
  currentViewEnd,
}) => {
  const [staffStore, setStaffStore] = useState<Store | null>(null);

  const getTotalHours = (employeeName: string): number => {
    const employeeEvents = Object.values(events).filter(
      (event) =>
        event.title === employeeName &&
        new Date(event.start) >= currentViewStart &&
        new Date(event.end) <= currentViewEnd
    );

    return employeeEvents.reduce((total, event) => {
      const start = new Date(event.start);
      const end = new Date(event.end);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + duration;
    }, 0);
  };

  const filteredEmployees = staffStore
    ? employees.filter((employee) => employee.storeId === staffStore.id)
    : employees;

  return (
    <aside className="w-64 ml-4">
      <h3 className="text-lg font-semibold mb-2 bg-offWhite rounded-md px-4 py-2 text-center">
        Employees & Hours
      </h3>
      <select
        id="staffStoreSelector"
        value={staffStore?.id || ""}
        onChange={(e) => {
          const store = stores.find((s) => s.id === e.target.value) || null;
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
            {filteredEmployees.map((employee) => {
              const totalHours = getTotalHours(employee.name).toFixed(2);
              return (
                <tr key={employee.id}>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-block px-4 py-2 bg-boldhighlight text-select w-full rounded-md tracking-wider font-semibold">
                      {employee.name}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">{totalHours} h</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </aside>
  );
};

export default EmployeeSidebar;