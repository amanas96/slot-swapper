import { useState, useEffect } from "react";
import api from "../../services/api";
import type { IEvent } from "../../types";

interface SwapRequestModalProps {
  theirSlot: IEvent;
  onClose: () => void;
  onSwapSuccess: () => void;
}

const SwapRequestModal = ({
  theirSlot,
  onClose,
  onSwapSuccess,
}: SwapRequestModalProps) => {
  const [mySwappableSlots, setMySwappableSlots] = useState<IEvent[]>([]);
  const [selectedMySlotId, setSelectedMySlotId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all of the *current user's* swappable slots
  useEffect(() => {
    const fetchMySlots = async () => {
      try {
        setLoading(true);
        // We can reuse the /events endpoint and filter on the frontend
        const response = await api.get("/events");
        setMySwappableSlots(
          response.data.filter((slot: IEvent) => slot.status === "SWAPPABLE")
        );
        setError("");
      } catch (err) {
        setError("Failed to fetch your swappable slots.");
      } finally {
        setLoading(false);
      }
    };
    fetchMySlots();
  }, []);

  const handleSubmitSwap = async () => {
    if (!selectedMySlotId) {
      setError("You must select one of your slots to offer.");
      return;
    }
    setError("");

    try {
      // This is the core API call from the challenge!
      await api.post("/swap/request", {
        mySlotId: selectedMySlotId,
        theirSlotId: theirSlot._id,
      });
      alert("Swap request sent successfully!");
      onSwapSuccess(); // Tell parent to close modal and refresh
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send swap request.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg z-50">
      <h2 className="text-xl font-bold mb-4">Request a Swap</h2>

      {/* Their Slot Info */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p className="font-semibold">You are requesting:</p>
        <p>{theirSlot.title}</p>
        <p className="text-sm text-gray-600">
          {new Date(theirSlot.startTime).toLocaleString()} -{" "}
          {new Date(theirSlot.endTime).toLocaleString()}
        </p>
      </div>

      <hr className="my-4" />

      {/* My Slots Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Offer one of your swappable slots in exchange:
        </label>
        {loading && <p>Loading your slots...</p>}

        {!loading && mySwappableSlots.length === 0 && (
          <p className="text-sm text-gray-500">
            You have no swappable slots to offer. Go to your Dashboard to make a
            slot swappable.
          </p>
        )}

        {mySwappableSlots.map((slot) => (
          <div
            key={slot._id}
            onClick={() => setSelectedMySlotId(slot._id)}
            className={`p-3 border rounded-md cursor-pointer mb-2 
                ${selectedMySlotId === slot._id ? "bg-blue-100 border-blue-400" : "border-gray-300 hover:bg-gray-50"}`}
          >
            <p className="font-semibold">{slot.title}</p>
            <p className="text-sm text-gray-600">
              {new Date(slot.startTime).toLocaleString()} -{" "}
              {new Date(slot.endTime).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-md shadow-sm hover:bg-gray-300 transition duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmitSwap}
          disabled={!selectedMySlotId || mySwappableSlots.length === 0}
          className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send Request
        </button>
      </div>
    </div>
  );
};

export default SwapRequestModal;
