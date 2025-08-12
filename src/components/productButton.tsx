"use client";

import React, { useState } from "react";

interface AddProductButtonProps {
  onAdd: (userProduct: {
    id: string;
    productId: string;
    status: string;
    product: { name: string };
  }) => void;
  status: string;
}

const AddProductButton: React.FC<AddProductButtonProps> = ({ onAdd, status }) => {
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!productName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: productName.trim(), status }),
      });

      if (!res.ok) {
        const errorText = await res.text(); // read raw text to debug
        try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.error || "Failed to add product");
        } catch {
            throw new Error(errorText || "Failed to add product");
        }
      }

      const userProduct = await res.json();
      onAdd(userProduct);

      setProductName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Product name"
          className="p-2 border rounded flex-grow h-10"
          disabled={loading}
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="border p-2 rounded transition disabled:opacity-50 text-[12px] h-10"
          type="button"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
};

export {AddProductButton};
