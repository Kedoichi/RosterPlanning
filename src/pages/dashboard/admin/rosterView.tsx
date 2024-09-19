import React, { useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import RosterCalendar from "./RosterCalendar";
import EmployeeSidebar from "./EmployeeSidebar";
import PreviewRoster from "@/components/PreviewRoster";
import { useRosterLogic } from "./useRosterLogic";
import { Store } from "@/components/roster/types";

const Roster: React.FC = () => {
  const {
    events,
    employees,
    stores,
    selectedStore,
    currentViewStart,
    currentViewEnd,
    setSelectedStore,
    setCurrentViewStart,
    setCurrentViewEnd,
    fetchRostersForStore,
  } = useRosterLogic();

  const [showPreview, setShowPreview] = useState(false);

  return (
    <DashboardLayout userType="manager">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between">
          <StoreSelector
            stores={stores}
            selectedStore={selectedStore}
            setSelectedStore={setSelectedStore}
          />
          <PreviewToggle
            showPreview={showPreview}
            setShowPreview={setShowPreview}
          />
        </div>

        <div className="flex">
          <div className="flex-grow">
            {showPreview ? (
              <PreviewRoster
                events={Object.values(events)}
                employees={employees}
                currentViewStart={currentViewStart}
                currentViewEnd={currentViewEnd}
              />
            ) : (
              <RosterCalendar
                events={events}
                currentViewStart={currentViewStart}
                currentViewEnd={currentViewEnd}
                setCurrentViewStart={setCurrentViewStart}
                setCurrentViewEnd={setCurrentViewEnd}
              />
            )}
          </div>

          {!showPreview && (
            <EmployeeSidebar
              employees={employees}
              events={events}
              stores={stores}
              currentViewStart={currentViewStart}
              currentViewEnd={currentViewEnd}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const StoreSelector: React.FC<{
  stores: Store[];
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
}> = ({ stores, selectedStore, setSelectedStore }) => (
  <div className="w-64">
    <label
      htmlFor="storeSelector"
      className="block text-sm font-medium text-gray-700"
    >
      Select Store
    </label>
    <select
      id="storeSelector"
      value={selectedStore?.id || ""}
      onChange={(e) =>
        setSelectedStore(stores.find((s) => s.id === e.target.value) || null)
      }
      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
    >
      <option value="">Select A Store</option>
      {stores.map((store) => (
        <option key={store.id} value={store.id}>
          {store.name}
        </option>
      ))}
    </select>
  </div>
);

const PreviewToggle: React.FC<{
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
}> = ({ showPreview, setShowPreview }) => (
  <button
    onClick={() => setShowPreview(!showPreview)}
    className="px-4 py-2 text-md font-semibold tracking-wider border border-transparent text-sm font-medium rounded-md border-border  bg-boldhighlight text-textPrimary rounded-md   hover:bg-accent hover:text-offWhite rounded-md mr-2"
  >
    {showPreview ? "Show Calendar View" : "Show Preview View"}
  </button>
);

export default Roster;
