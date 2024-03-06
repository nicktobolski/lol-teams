"use client";
import React from "react";
import { WavyBackground } from "./ui/WavyBackground";

export function ChartLoading({ loadingText }: { loadingText: string }) {
  return (
    <WavyBackground className="max-w-4xl mx-auto absolute">
      <p className="text-white inter-var text-center">{loadingText}</p>
    </WavyBackground>
  );
}
