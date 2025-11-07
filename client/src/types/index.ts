export interface IEvent {
  _id: string;

  title: string;
  startTime: string;
  endTime: string;
  status: "BUSY" | "SWAPPABLE" | "SWAP_PENDING";
  // Owner can be a simple string (ID) or a populated object
  owner: string | { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface ISwapRequest {
  _id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";

  // These will be populated objects
  requester: { _id: string; name: string; email: string };
  recipient: { _id: string; name: string; email: string };
  requesterSlot: IEvent;
  recipientSlot: IEvent;

  createdAt: string;
  updatedAt: string;
}
