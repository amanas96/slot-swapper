import { useState, useEffect } from "react";
import api from "../../services/api";
import type { IEvent } from "../../types";
import SwapRequestModal from "./swapRequestModal";

const Marketplace = () => {
  const [availableSlots, setAvailableSlots] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<IEvent | null>(null);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get("/swap/swappable-slots");
      setAvailableSlots(response.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const handleOpenModal = (slot: IEvent) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  const handleSwapSuccess = () => {
    handleCloseModal();
    fetchAvailableSlots();
  };

  return (
    <div className="page-gradient">
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        {/* --- HEADER --- */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-3">
            🕒 Slot Marketplace
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Browse available{" "}
            <span className="font-semibold text-purple-600">
              swappable slots
            </span>
            from other users and request a swap seamlessly.
          </p>
        </header>

        {/* --- STATUS MESSAGES --- */}
        {loading && (
          <p className="text-center text-gray-500 animate-pulse">
            Loading available slots...
          </p>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && availableSlots.length === 0 && (
          <p className="text-center text-gray-600">
            No swappable slots available right now. 🌙
          </p>
        )}

        {/* --- AVAILABLE SLOTS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {availableSlots.map((slot) => (
            <div
              key={slot._id}
              className="glass-card p-6 flex flex-col justify-between group hover:scale-[1.02] transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition">
                    {slot.title}
                  </h4>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {typeof slot.owner === "object"
                      ? slot.owner.name.split(" ")[0]
                      : "Unknown"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-2">
                  <strong>From:</strong>{" "}
                  <span className="text-gray-800">
                    {new Date(slot.startTime).toLocaleString()}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  <strong>To:</strong>{" "}
                  <span className="text-gray-800">
                    {new Date(slot.endTime).toLocaleString()}
                  </span>
                </p>
              </div>

              {/* --- BUTTON --- */}
              <div className="mt-6 pt-4 border-tborder-gray-200">
                <button
                  onClick={() => handleOpenModal(slot)}
                  className="btn-gradient from-purple-500 to-indigo-600 btn-red  text-gray-800 font-bold w-full"
                >
                  Request Swap
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* --- MODAL --- */}
        {isModalOpen && selectedSlot && (
          <SwapRequestModal
            theirSlot={selectedSlot}
            onClose={handleCloseModal}
            onSwapSuccess={handleSwapSuccess}
          />
        )}

        <footer className="text-center text-sm text-gray-500 mt-12 pb-6">
          Built with 💜 SlotSwapper
        </footer>
      </div>
    </div>
  );
};

export default Marketplace;
