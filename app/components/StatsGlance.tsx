"use client";
import React from "react";
import Image from "next/image";
import { GameStub, PlayerDatum } from "../hooks/lolHooks";
import {
  formatNumber,
  getParticipantDataFromGame,
  getParticipantsDataForCompareKey,
} from "../utils/utils";

export type StatsRecord = {
  player: PlayerDatum;
  score: number;
};
export const FancyPlayerName = ({ player }: { player: PlayerDatum }) => {
  return (
    <div className="fancyPlayer" style={{ color: player.color }}>
      {/*<div style={{ borderColor: player.color }} className="playerAvatar">
         <Image
          src={`http://ddragon.leagueoflegends.com/cdn/10.18.1/img/profileicon/${player.metaData?.profileIconId}.png`}
          width={36}
          height={36}
          alt={`${player.name}'s League Avatar`}
        />
      </div>*/}
      {/* <div
        style={{ backgroundColor: player.color }}
        className="playerDot"
      ></div> */}
      {player.name}
    </div>
  );
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
  players,
}: {
  games: (GameStub | undefined)[];
  puuids: string[];
  teamMemberNames: string[];
  compareProperty: string;
  players: PlayerDatum[];
}) {
  const { average, best, worst } = players.reduce<{
    average: StatsRecord[];
    best: StatsRecord[];
    worst: StatsRecord[];
  }>(
    (acc, player) => {
      const scores = games
        .map(getParticipantDataFromGame(player.puuid))
        .map((participantData) =>
          getParticipantsDataForCompareKey(participantData, compareProperty)
        );
      const avgScore =
        scores.reduce((acc, score) => {
          acc += score;
          return acc;
        }, 0) / games.length;

      acc.average.push({ player, score: avgScore });
      acc.best.push({
        player,
        score: Math.max(...scores),
      });
      acc.worst.push({
        player,
        score: Math.min(...scores),
      });
      return acc;
    },
    {
      average: [],
      best: [],
      worst: [],
    }
  );
  const listClasses = "list-decimal pl-5 text-sm";
  return (
    <div className="flex justify-between">
      <div>
        Mean
        <ol className={listClasses}>
          {average.sort(sortStatScoresAsc).map(({ player, score }) => (
            <li key={player.name}>
              <FancyPlayerName player={player} />: {formatNumber(score)}
            </li>
          ))}
        </ol>
      </div>
      <div>
        Highest
        <ol className={listClasses}>
          {best.sort(sortStatScoresAsc).map(({ player, score }) => (
            <li key={player.name}>
              <FancyPlayerName player={player} />: {formatNumber(score)}
            </li>
          ))}
        </ol>
      </div>
      <div>
        Lowest
        <ol className={listClasses}>
          {worst.sort(sortStatScoresDsc).map(({ player, score }) => (
            <li key={player.name}>
              <FancyPlayerName player={player} />: {formatNumber(score)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
