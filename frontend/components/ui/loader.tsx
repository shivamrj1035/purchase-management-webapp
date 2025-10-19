"use client";

import React from "react";

interface CenteredLoaderProps {
  message?: string;
  size?: number;
}

export function CenteredLoader({ message, size = 12 }: CenteredLoaderProps) {
  const sizeClass = `h-${size} w-${size}`; // tailwind will not pick dynamic; keep defaults below
  return (
    <div className="flex items-center justify-center py-12 w-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        {message && <p className="text-slate-400">{message}</p>}
      </div>
    </div>
  );
}


