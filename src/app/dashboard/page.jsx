import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

const page = () => {
  return (
    <ProtectedRoute>
      <div>Hello, User...</div>
    </ProtectedRoute>
  );
};

export default page;
