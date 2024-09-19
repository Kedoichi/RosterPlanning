import React from "react";
import { Store } from "@/components/roster/types";

interface RosterHeaderProps {
  stores: Store[];
  selectedStore: Store | null;
  setSelectedStore?: (store: Store | null) => void;
  showPreview?: boolean;
  setShowPreview?: (show: boolean) => void;
  saveRoster?: () => void;
}

const RosterHeaderView: React.FC<RosterHeaderProps> = ({
  stores,
  selectedStore,
  setSelectedStore,
}) => {
  return (
    <div className="flex justify-between items-center">
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
            setSelectedStore(
              stores.find((s) => s.id === e.target.value) || null
            )
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
    </div>
  );
};

const RosterHeaderPlan: React.FC<RosterHeaderProps> = ({
  stores,
  selectedStore,
  setSelectedStore,
  showPreview,
  setShowPreview,
  saveRoster,
}) => {
  return (
    <div className="flex justify-between items-center">
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
            setSelectedStore(
              stores.find((s) => s.id === e.target.value) || null
            )
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
      <div className="space-x-4">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 text-md font-semibold tracking-wider border border-transparent text-sm font-medium rounded-md border-border  bg-boldhighlight text-textPrimary rounded-md   hover:bg-accent hover:text-offWhite rounded-md mr-2"
        >
          {showPreview ? "Show Calendar View" : "Show Preview View"}
        </button>
        <button
          onClick={saveRoster}
          className="px-4 py-2 text-md font-semibold tracking-wider border border-transparent text-sm font-medium rounded-md border-border  bg-boldhighlight text-textPrimary rounded-md   hover:bg-accent hover:text-offWhite rounded-md mr-2"
        >
          Save Roster
        </button>
      </div>
    </div>
  );
};

export { RosterHeaderView, RosterHeaderPlan };
