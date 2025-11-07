import { Outlet } from "react-router-dom";
import { Navbar } from "./navBar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main>
        {/* The Outlet renders the active child route (Dashboard, Marketplace, etc.) */}
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
