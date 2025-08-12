"use client";

import React, { useState, useEffect, useRef } from "react";
import { AddProductButton } from "@/components/productButton";
import { createSwapy } from "swapy";

type ProductStatus = "CURRENT" | "TRIED" | "WANT_TO_TRY";

interface UserProduct {
  id: string;
  name: string;
  status: ProductStatus;
}

const statusLabels: Record<ProductStatus, string> = {
  CURRENT: "Current Routine",
  TRIED: "Tried But Didn't Work",
  WANT_TO_TRY: "Want To Try",
};

const statusToBackendMap: Record<ProductStatus, string> = {
  CURRENT: "currentRoutine",
  TRIED: "tried",
  WANT_TO_TRY: "wantToTry",
};

const statusFromBackendMap: Record<string, ProductStatus> = {
  currentRoutine: "CURRENT",
  tried: "TRIED",
  wantToTry: "WANT_TO_TRY",
};

// Replace with your actual API calls
async function fetchUserProducts(): Promise<UserProduct[]> {
  const res = await fetch("/api/user-products");
  if (!res.ok) throw new Error("Failed to fetch user products");
  const data = await res.json();
  return data.map((item: any) => ({
    id: item.id,
    name: item.product.name,
    status: statusFromBackendMap[item.status] || "WANT_TO_TRY",
  }));
}

async function updateProductStatus(id: string, status: ProductStatus) {
  const res = await fetch("/api/user-products", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status: statusToBackendMap[status] }),
  });
  if (!res.ok) throw new Error("Failed to update product status");
}

export default function ProductRoutineManager() {
  const [productsByStatus, setProductsByStatus] = useState<Record<ProductStatus, UserProduct[]>>({
    CURRENT: [],
    TRIED: [],
    WANT_TO_TRY: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const swapyRef = useRef<any>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const products = await fetchUserProducts();
        const grouped: Record<ProductStatus, UserProduct[]> = {
          CURRENT: [],
          TRIED: [],
          WANT_TO_TRY: [],
        };
        products.forEach((p) => grouped[p.status].push(p));
        setProductsByStatus(grouped);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxSlots = Math.max(...Object.values(productsByStatus).map((arr) => arr.length)) + 1;

  useEffect(() => {
    if (!containerRef.current) return;

    swapyRef.current = createSwapy(containerRef.current, { animation: "dynamic" });

    swapyRef.current.onDrop(async (event: any) => {
      const { item, from, to } = event;

      const itemId = item.getAttribute("data-swapy-item");
      if (!itemId) return;

      // itemId: `${productId}-slot-${status}-${index}` OR `empty-slot-${status}-${index}`
      const [productId, , status, indexStr] = itemId.split("-");
      const toSlot = to.getAttribute("data-swapy-slot");
      const fromSlot = from.getAttribute("data-swapy-slot");
      if (!toSlot || !fromSlot) return;

      const toParts = toSlot.split("-");
      const fromParts = fromSlot.split("-");

      if (toParts.length < 3 || fromParts.length < 3) return;

      const toStatus = toParts[1].toUpperCase() as ProductStatus;
      const toIndex = parseInt(toParts[2], 10);
      const fromStatus = fromParts[1].toUpperCase() as ProductStatus;
      const fromIndex = parseInt(fromParts[2], 10);

      if (productId.startsWith("empty")) {
        // placeholder dragged — ignore
        return;
      }

      setProductsByStatus((prev) => {
        const newState = { ...prev };

        // Remove product from old list
        const movedProduct = newState[fromStatus].find((p) => p.id === productId);
        if (!movedProduct) return prev;

        const newFromList = [...newState[fromStatus]];
        newFromList.splice(fromIndex, 1);

        const newToList = [...newState[toStatus]];
        newToList.splice(toIndex, 0, { ...movedProduct, status: toStatus });

        newState[fromStatus] = newFromList;
        newState[toStatus] = newToList;

        return newState;
      });

      try {
        await updateProductStatus(productId, toStatus);
      } catch (error) {
        console.error("Failed to update product status:", error);
        // Optional: revert UI changes or show message
      }
    });

    return () => {
      if (swapyRef.current) swapyRef.current.destroy();
    };
  }, []);

  function handleAddProduct(userProduct: {
    id: string;
    productId: string;
    status: string;
    product: { name: string };
  }) {
    const frontendStatus = statusFromBackendMap[userProduct.status] || "WANT_TO_TRY";
    const newProduct: UserProduct = {
      id: userProduct.id,
      name: userProduct.product.name,
      status: frontendStatus,
    };

    setProductsByStatus((prev) => ({
      ...prev,
      [frontendStatus]: [...prev[frontendStatus], newProduct],
    }));
  }

  if (loading) return <div className="flex justify-center items-center min-h-[400px]"><div>Loading your products...</div></div>;
  if (error) return <div className="flex justify-center items-center min-h-[400px] text-red-600">Error: {error}</div>;

  return (
    <div ref={containerRef} className="flex gap-6 p-6 overflow-x-auto min-h-[400px]">
      {(["CURRENT", "TRIED", "WANT_TO_TRY"] as ProductStatus[]).map((status) => (
        <div key={status} className="flex flex-col flex-shrink-0 w-72">
          <h2 className="text-lg font-semibold mb-4">{statusLabels[status]}</h2>

          <div className="flex flex-col gap-2 border border-gray-200 rounded-md p-2 shadow-md max-h-[300px] overflow-auto min-h-[200px]">
            {Array.from({ length: maxSlots }).map((_, index) => {
              const product = productsByStatus[status][index];
              return (
                <div
                  key={`${status}-slot-${index}`}
                  data-swapy-slot={`slot-${status.toLowerCase()}-${index}`}
                  className="min-h-[42px]"
                >
                  {product ? (
                    <div
                      data-swapy-item={`${product.id}-slot-${status.toLowerCase()}-${index}`}
                      className="border rounded-md p-3 cursor-move select-none transition-colors"
                    >
                      {product.name}
                    </div>
                  ) : (
                    <div
                      className="rounded-md p-3"
                      style={{ opacity: 0.3, minHeight: "42px" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <AddProductButton onAdd={handleAddProduct} status={statusToBackendMap[status]} />
          </div>
        </div>
      ))}
    </div>
  );
}
