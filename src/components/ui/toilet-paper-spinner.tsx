import React from "react";

interface ToiletPaperSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ToiletPaperSpinner: React.FC<ToiletPaperSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="relative w-full h-full">
        {/* Toilet paper roll */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-white rounded-full border-2 border-pink-200 animate-spin">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              {/* Inner circle for the roll */}
              <div className="w-1/2 h-1/2 bg-white rounded-full border border-pink-200"></div>
            </div>
          </div>
        </div>

        {/* Paper strip */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1/3 bg-pink-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};
