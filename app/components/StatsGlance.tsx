"use client";
import React from "react";
import { GameStub } from "../hooks/lolHooks";
import {
  formatNumber,
  getParticipantDataFromGame,
  getParticipantsDataForCompareKey,
} from "../utils/utils";

export type StatsRecord = {
  playerName: string;
  score: number;
};
const sortStatScoresAsc = (a: StatsRecord, b: StatsRecord): number =>
  b.score - a.score;
const sortStatScoresDsc = (a: StatsRecord, b: StatsRecord): number =>
  a.score - b.score;
export function StatsGlance({
  games,
  puuids,
  teamMemberNames,
  compareProperty,
}: {
  games: (GameStub | undefined)[];
  puuids: string[];
  teamMemberNames: string[];
  compareProperty: string;
}) {
  const { average, best, worst } = puuids.reduce<{
    average: StatsRecord[];
    best: StatsRecord[];
    worst: StatsRecord[];
  }>(
    (acc, puuid, index) => {
      const playerName = teamMemberNames?.[index];
      const scores = games
        .map(getParticipantDataFromGame(puuid))
        .map((participantData) =>
          getParticipantsDataForCompareKey(participantData, compareProperty)
        );
      const avgScore =
        scores.reduce((acc, score) => {
          acc += score;
          return acc;
        }, 0) / games.length;

      acc.average.push({ playerName, score: avgScore });
      acc.best.push({
        playerName,
        score: Math.max(...scores),
      });
      acc.worst.push({
        playerName,
        score: Math.min(...scores),
      });
      return acc;
    },
    {
      average: [] as any,
      best: [] as any,
      worst: [] as any,
    }
  );
  const listClasses = "list-decimal pl-5 text-sm";
  return (
    <div className="flex justify-between">
      <div>
        Mean
        <ol className={listClasses}>
          {average.sort(sortStatScoresAsc).map(({ playerName, score }) => (
            <li key={playerName}>
              {playerName}: {formatNumber(score)}
            </li>
          ))}
        </ol>
      </div>
      <div>
        Highest
        <ol className={listClasses}>
          {best.sort(sortStatScoresAsc).map(({ playerName, score }) => (
            <li key={playerName}>
              {playerName}: {formatNumber(score)}
            </li>
          ))}
        </ol>
      </div>
      <div>
        Lowest
        <ol className={listClasses}>
          {worst.sort(sortStatScoresDsc).map(({ playerName, score }) => (
            <li key={playerName}>
              {playerName}: {formatNumber(score)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
