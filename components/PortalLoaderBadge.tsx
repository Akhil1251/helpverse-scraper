"use client";

import React from "react";

interface Props {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function PortalLoaderBadge({ className = "", size = "md" }: Props) {
  const scaleStyle =
    size === "sm"
      ? { transform: "scale(0.85)" }
      : size === "lg"
      ? { transform: "scale(1.35)" }
      : {};

  return (
    <div
      className={`portal-loader-badge ${className}`}
      style={scaleStyle}
      title="Helpverse Portal"
    >
      <div className="portal-loader-glow" />
      <div className="portal-loader-wrapper">
        <div className="portal-loader-lines">
          <div className="portal-line-loader portal-line-left" />
          <div className="portal-line-loader portal-line-right" />
        </div>
        <div className="portal-flare" />
      </div>
    </div>
  );
}
