import React from "react";
import Sidebar from "./Sidebar";


const Layout = ({ children }) => {
  return (
    <div className="flex bg-gray-100 min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 px-3 py-5 ml-64 bg-gray-100 min-h-screen">
        <div className="max-w-full mx-auto px-5 transition-all duration-300 ease-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
