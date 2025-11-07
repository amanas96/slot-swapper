import { useState, useEffect } from "react";
import api from "../../services/api";
import type { IEvent } from "../../types";
import { useAuth } from "../../context/authContext";
import EventForm from "./eventForm";

// --- STATUS BADGE COMPONENT ---
const StatusBadge = ({ status }: { status: IEvent["status"] }) => {
  const color =
    status === "BUSY"
      ? "badge badge-busy"
      : status === "SWAPPABLE"
        ? "badge badge-swap"
        : "badge badge-pending";

  return <span className={color}>{status}</span>;
};

// --- DASHBOARD MAIN COMPONENT ---
const Dashboard = () => {
  //  const { user, logout } = useAuth();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/events");
      setEvents(response.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleStatusChange = async (
    eventId: string,
    newStatus: IEvent["status"]
  ) => {
    try {
      await api.put(`/events/${eventId}`, { status: newStatus });
      fetchEvents();
    } catch {
      setError("Failed to update event status.");
    }
  };

  return (
    <div className="page-gradient">
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        {/* --- HEADER --- */}
        {/* <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-white/40">
          <h1 className="header-title">Welcome, {user?.name} </h1>
          <button onClick={logout} className="btn-gradient btn-red w-auto">
            Logout
          </button>
        </header> */}

        {/* --- CREATE NEW SLOT SECTION --- */}
        <div className="mb-10">
          <div className="purple-gradient rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all">
            <div className="mb-6">
              <h2 className="gradient-header"> Create a New Slot</h2>
              <p className="gradient-subtext">
                Plan your time easily — create and manage your busy or swappable
                slots.
              </p>
            </div>

            <div className="bg-white/90  text-gray-500 backdrop-blur-lg rounded-xl p-6 shadow-inner">
              <EventForm onEventCreated={fetchEvents} />
            </div>
          </div>
        </div>

        {/* --- MY SLOTS SECTION --- */}
        <h2 className="section-header">My Slots</h2>

        {loading && (
          <p className="text-gray-500 text-center animate-pulse">
            Loading events...
          </p>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && events.length === 0 && (
          <p className="text-gray-600 text-center">
            You have no events yet. Create one above 🌱
          </p>
        )}

        {/* --- EVENT CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="glass-card p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {event.title}
                  </h4>
                  <StatusBadge status={event.status} />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>From:</strong>{" "}
                  {new Date(event.startTime).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>To:</strong>{" "}
                  {new Date(event.endTime).toLocaleString()}
                </p>
              </div>

              {/* --- ACTION BUTTONS --- */}
              <div className="mt-5 pt-4 border-t border-gray-200">
                {event.status === "BUSY" && (
                  <button
                    onClick={() => handleStatusChange(event._id, "SWAPPABLE")}
                    className="btn-gradient btn-green"
                  >
                    Make Swappable
                  </button>
                )}
                {event.status === "SWAPPABLE" && (
                  <button
                    onClick={() => handleStatusChange(event._id, "BUSY")}
                    className="btn-gradient btn-gray"
                  >
                    Make Busy
                  </button>
                )}
                {event.status === "SWAP_PENDING" && (
                  <button
                    disabled
                    className="w-full py-2 px-4 bg-yellow-100 text-yellow-700 font-medium rounded-lg cursor-not-allowed shadow-sm"
                  >
                    Pending Swap
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
