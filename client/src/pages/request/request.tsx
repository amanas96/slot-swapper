import { useState, useEffect } from "react";
import api from "../../services/api";
import type { ISwapRequest } from "../../types";

// --- Helper Component for Request Cards ---
const RequestCard = ({
  request,
  type,
  onRespond,
}: {
  request: ISwapRequest;
  type: "incoming" | "outgoing";
  onRespond: (requestId: string, accepted: boolean) => void;
}) => {
  return (
    <div className="glass-card p-6 rounded-2xl transition-all hover:shadow-xl hover:scale-[1.01] duration-300">
      {type === "incoming" && (
        <>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-purple-700">
              {request.requester.name}
            </span>{" "}
            wants to swap:
          </p>

          {/* Their Slot */}
          <div className="my-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="font-medium text-sm text-purple-700">Their Slot</p>
            <p className="text-gray-800">{request.requesterSlot.title}</p>
          </div>

          <p className="text-sm text-gray-500 text-center my-1 font-medium">
            ↕
          </p>

          {/* Your Slot */}
          <div className="mb-5 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="font-medium text-sm text-indigo-700">Your Slot</p>
            <p className="text-gray-800">{request.recipientSlot.title}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => onRespond(request._id, true)}
              className="btn-gradient from-green-500 to-emerald-600 text-white flex-1"
            >
              Accept
            </button>
            <button
              onClick={() => onRespond(request._id, false)}
              className="btn-gradient from-red-500 to-pink-600 text-white flex-1"
            >
              Reject
            </button>
          </div>
        </>
      )}

      {type === "outgoing" && (
        <>
          <p className="text-sm text-gray-700">
            You offered{" "}
            <span className="font-semibold text-indigo-700">
              {request.recipient.name}
            </span>{" "}
            a swap:
          </p>

          {/* Your Slot */}
          <div className="my-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-medium text-sm text-green-700">Your Slot</p>
            <p className="text-gray-800">{request.requesterSlot.title}</p>
          </div>

          <p className="text-sm text-gray-500 text-center my-1 font-medium">
            ↕
          </p>

          {/* Their Slot */}
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-medium text-sm text-red-700">Their Slot</p>
            <p className="text-gray-800">{request.recipientSlot.title}</p>
          </div>

          <button
            disabled
            className="w-full py-2 px-4 bg-gray-200 text-gray-600 font-medium rounded-lg cursor-not-allowed shadow-inner"
          >
            Pending
          </button>
        </>
      )}
    </div>
  );
};

// --- Main Page Component ---
const RequestsPage = () => {
  const [incoming, setIncoming] = useState<ISwapRequest[]>([]);
  const [outgoing, setOutgoing] = useState<ISwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/swap/my-requests");
      setIncoming(response.data.incomingRequests);
      setOutgoing(response.data.outgoingRequests);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRespond = async (requestId: string, accepted: boolean) => {
    try {
      await api.post(`/swap/response/${requestId}`, {
        acceptance: accepted,
      });
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to respond to request.");
    }
  };

  return (
    <div className="page-gradient min-h-screen">
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        {/* --- Header --- */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
            🔁 Swap Requests
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View and manage your swap requests — respond to incoming offers or
            track your outgoing ones.
          </p>
        </header>

        {error && (
          <p className="text-center text-red-500 font-medium mb-4">{error}</p>
        )}

        {loading ? (
          <p className="text-center text-gray-500 animate-pulse">
            Fetching your requests...
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Incoming Requests */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                📥 Incoming
              </h2>
              {incoming.length === 0 ? (
                <p className="text-gray-600">
                  You have no pending incoming requests.
                </p>
              ) : (
                <div className="space-y-5">
                  {incoming.map((req) => (
                    <RequestCard
                      key={req._id}
                      request={req}
                      type="incoming"
                      onRespond={handleRespond}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Outgoing Requests */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                📤 Outgoing
              </h2>
              {outgoing.length === 0 ? (
                <p className="text-gray-600">
                  You have no pending outgoing requests.
                </p>
              ) : (
                <div className="space-y-5">
                  {outgoing.map((req) => (
                    <RequestCard
                      key={req._id}
                      request={req}
                      type="outgoing"
                      onRespond={handleRespond}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        <footer className="text-center text-sm text-gray-500 mt-12 pb-6">
          Built with ❤️ by SlotSwapper
        </footer>
      </div>
    </div>
  );
};

export default RequestsPage;
