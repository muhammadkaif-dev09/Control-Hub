import React from "react";
import UserSidebar from "./UserSidebar";

const UserLayout = ({ children }) => {
  return (
    <div className="flex bg-gray-100 min-h-screen w-full">
      <UserSidebar />
      <main className="flex-1 px-3 py-5 ml-64 bg-gray-100 min-h-screen">
        <div className="max-w-full mx-auto px-5 transition-all duration-300 ease-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
