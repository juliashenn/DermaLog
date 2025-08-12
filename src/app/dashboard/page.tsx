"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CalendarHeatmap } from "@/components/calendar-heatmap";

function currentMonthFirstDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function currentMonthLastDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

type TimeOfDay = "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";

interface UsageDetail {
  area: string | null;
  timeOfDay: TimeOfDay;
}

interface UsageDate {
  date: string;
  entryId: string;
  details: UsageDetail[];
}

interface Product {
  id: string;
  name: string;
}

interface HabitTracker {
  product: Product;
  usageDates: UsageDate[];
  totalUsages: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [habitTrackers, setHabitTrackers] = useState<HabitTracker[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!session?.user?.email) return;
    const user = session.user;
    
    async function loadHabitTrackers() {
      try {
        setLoading(true);
        const res = await fetch(`/api/entry-products?email=${user.email}`);
        if (!res.ok) {
          throw new Error(`Error fetching data: ${res.statusText}`);
        }
        const data: HabitTracker[] = await res.json();
        setHabitTrackers(data);

        if (data.length > 0) {
          setSelectedProduct(data[0].product.id);
        } else {
          setSelectedProduct("");
        }
      } catch (err) {
        console.error("Error loading habit trackers", err);
      } finally {
        setLoading(false);
      }
    }

    loadHabitTrackers();
  }, [session?.user?.email]);

  if (loading) return <div>Loading...</div>;

  const selectedTracker = habitTrackers.find(tracker => tracker.product.id === selectedProduct);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Product Usage Habit Tracker</h1>

      {/* Product Selector */}
      <div className="mb-6">
        <label htmlFor="product-select" className="block text-sm font-medium mb-2">
          Select Product to Track:
        </label>
        <select
          id="product-select"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 min-w-48"
        >
          <option value="">-- Select a product --</option>
          {habitTrackers.map((tracker) => (
            <option key={tracker.product.id} value={tracker.product.id}>
              {tracker.product.name} ({tracker.totalUsages} uses this month)
            </option>
          ))}
        </select>
      </div>

      {/* Calendar */}
      {selectedTracker ? (
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Days you used: {selectedTracker.product.name}
          </h2>

          <CalendarHeatmap
            month={currentMonthFirstDate()}
            weightedDates={selectedTracker.usageDates.map((usage) => ({
              date: new Date(usage.date),
              weight: usage.details.length,
            }))}
            variantClassnames={["text-white hover:text-white bg-blue-300 hover:bg-blue-300",
              "dark:bg-blue-600 dark:hover:bg-blue-600"]}
          />

          <p className="text-sm text-gray-600 mt-2">
            Blue intensity shows frequency of use — darker means more uses that day
          </p>

          {/* Usage Details */}
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Usage Details:</h3>
            <div className="text-sm text-gray-600">
              <p>Total uses this month: {selectedTracker.totalUsages}</p>
              <p>Days used: {selectedTracker.usageDates.length}</p>

              {selectedTracker.usageDates.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Recent usage:</p>
                  <ul className="list-disc list-inside">
                    {selectedTracker.usageDates
                      .slice(-5) // last 5 usages
                      .map((usage, index) => (
                        <li key={`${usage.entryId}-${index}`}>
                          {new Date(usage.date).toLocaleDateString()}
                          {usage.details.length > 0 && (
                            <span className="text-gray-500">
                              {" "}
                              ({usage.details.map((d) => d.timeOfDay).join(", ")})
                            </span>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p>Please select a product to see its usage details.</p>
      )}

      {/* All Products Overview */}
      {habitTrackers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">All Products Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habitTrackers.map((tracker) => (
              <div
                key={tracker.product.id}
                className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                  tracker.product.id === selectedProduct ? "ring-2 ring-blue-400" : ""
                }`}
                onClick={() => setSelectedProduct(tracker.product.id)}
              >
                <h3 className="font-medium mb-2">{tracker.product.name}</h3>
                <p className="text-sm text-gray-600">
                  {tracker.totalUsages} uses across {tracker.usageDates.length} days
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  {tracker.usageDates.length > 0 ? (
                    <>Last used: {new Date(tracker.usageDates[tracker.usageDates.length - 1].date).toLocaleDateString()}</>
                  ) : (
                    <>No usage this month</>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
