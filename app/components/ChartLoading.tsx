"use client";
import React, { useEffect, useMemo } from "react";
import { WavyBackground } from "./ui/WavyBackground";
import { Progress } from "@nextui-org/react";

const COOL_LOADING_TEXTS = [
  "Loading please wait! 😡",
  "Crunching numbers to aid ape brain digestion...",
  "Calculating...",
  "Thinking...",
  "Analyzing...",
  "Fetching data...",
  "Loading...",
  "Crunching numbers...",
  "Calculating...",
  "Thinking...",
  "Thinking more...",
  "Analyzing...",
  "Fetching data...",
  "🤠..",
];

const getRandomLoadingText = () => {
  return COOL_LOADING_TEXTS[
    Math.floor(Math.random() * COOL_LOADING_TEXTS.length)
  ];
};

export function ChartLoading({ loadingText }: { loadingText: string }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const coolGuyText = useMemo(() => getRandomLoadingText(), [loadingText]);
  const [realCoolGuyText, setCoolGuyText] = React.useState("false");

  useEffect(() => {
    setCoolGuyText(coolGuyText);
    const textChanger = setInterval(() => {
      setCoolGuyText(getRandomLoadingText());
    }, 2000);
    return () => {
      clearInterval(textChanger);
    };
  }, [coolGuyText]);
  return (
    <WavyBackground className="max-w-4xl w-1/4 mx-auto flex flex-col gap-2 absolute">
      <p className="text-white inter-var text-center">{realCoolGuyText}</p>
      <Progress value={50} color="secondary" isIndeterminate />
    </WavyBackground>
  );
}
