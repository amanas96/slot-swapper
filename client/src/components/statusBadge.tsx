// client/src/components/StatusBadge.tsx
import clsx from "clsx";
import type { IEvent } from "../types";

interface StatusBadgeProps {
  status: IEvent["status"];
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const badgeClasses = clsx(
    "badge", // Base class
    {
      // Conditional classes
      "badge-busy": status === "BUSY",
      "badge-swap": status === "SWAPPABLE",
      "badge-pending": status === "SWAP_PENDING",
    }
  );

  return <span className={badgeClasses}>{status}</span>;
};
