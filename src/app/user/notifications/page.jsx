"use client";

import UserLayout from "@/components/UserLayout";
import { AuthProvider } from "@/context/AuthContext";
import React, { useState } from "react";

export default function NotificationsPage() {
  const [selected, setSelected] = useState(null);

  return (
    <AuthProvider>
      <UserLayout>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Notifications
        </h1>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Document Notifications</h2>
          <div className="divide-y">
            {notificationsData.map((notif) => (
              <div
                key={notif.id}
                className="py-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelected(notif)}
              >
                <div>
                  <span className="font-medium">{notif.title}</span>
                  <span className="ml-2 text-gray-500 text-sm">
                    {notif.date}
                  </span>
                  <div className="text-gray-700">{notif.message}</div>
                </div>
                <button
                  className={`px-3 py-1 rounded text-white ${
                    notif.type === "success"
                      ? "bg-green-600"
                      : notif.type === "error"
                      ? "bg-red-600"
                      : "bg-yellow-500"
                  }`}
                >
                  {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modal for single notification */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
              <h3 className="text-xl font-semibold mb-2">{selected.title}</h3>
              <p className="mb-2 text-gray-700">{selected.message}</p>
              <p className="mb-2 text-gray-500">Date: {selected.date}</p>
              <p className="mb-2 text-gray-500">
                Document: {selected.document}
              </p>
              {selected.rejectionNote && (
                <div className="mt-2 p-3 bg-red-100 text-red-700 rounded">
                  <strong>Rejection Note:</strong> {selected.rejectionNote}
                </div>
              )}
            </div>
          </div>
        )}
      </UserLayout>
    </AuthProvider>
  );
}
