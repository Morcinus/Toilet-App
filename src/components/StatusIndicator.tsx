import React from "react";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

interface StatusIndicatorProps {
  status: "configured" | "not-configured" | "loading" | "error";
  lastUpdate?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  lastUpdate,
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case "configured":
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          text: "GitHub Connected",
          color: "text-green-800",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "not-configured":
        return {
          icon: <AlertCircle className="w-4 h-4 text-yellow-600" />,
          text: "GitHub Not Configured",
          color: "text-yellow-800",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      case "loading":
        return {
          icon: <Clock className="w-4 h-4 text-blue-600 animate-spin" />,
          text: "Connecting...",
          color: "text-blue-800",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      case "error":
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-600" />,
          text: "Connection Error",
          color: "text-red-800",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${statusInfo.bgColor} ${statusInfo.borderColor}`}
    >
      {statusInfo.icon}
      <span className={`text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
      {lastUpdate && status === "configured" && (
        <span className="text-xs text-green-600">
          Last update: {new Date(lastUpdate).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};
