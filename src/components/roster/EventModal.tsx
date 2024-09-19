import React, { useState } from "react";
import { Event, Employee } from "./types";

interface EventModalProps {
  event: Event;
  employees: Employee[];
  onSave: (updatedEvent: Event) => void;
  onDelete: (eventId: string) => void;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  employees,
  onSave,
  onDelete,
  onClose,
}) => {
  const [editedEvent, setEditedEvent] = useState<Event>(event);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedEvent);
  };

  const handleDelete = () => {
    onDelete(event.id);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-10">
      <div className="bg-white p-5 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Edit Shift</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Employee
            </label>
            <select
              id="title"
              name="title"
              value={editedEvent.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
              htmlFor="start"
              className="block text-sm font-medium text-gray-700"
            >
              Start Time
            </label>
            <input
              type="datetime-local"
              id="start"
              name="start"
              value={editedEvent.start.toISOString().slice(0, 16)}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label
              htmlFor="end"
              className="block text-sm font-medium text-gray-700"
            >
              End Time
            </label>
            <input
              type="datetime-local"
              id="end"
              name="end"
              value={editedEvent.end.toISOString().slice(0, 16)}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label
              htmlFor="bgColor"
              className="block text-sm font-medium text-gray-700"
            >
              Color
            </label>
            <select
              id="bgColor"
              name="bgColor"
              value={editedEvent.bgColor}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="#FF8F8F">Red</option>
              <option value="#EEF296">Yellow</option>
              <option value="#9ADE7B">Green</option>
              <option value="#62CDFF">Blue</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Delete
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
