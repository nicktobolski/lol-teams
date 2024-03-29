"use client";
import React from "react";
import Image from "next/image";
import { GameStub, PlayerDatum } from "../hooks/lolHooks";
import {
  formatAndRound,
  getParticipantDataFromGame,
  getParticipantsDataForCompareKey,
  teamScore,
} from "../utils/utils";

export type StatsRecord = {
  player: PlayerDatum;
  score: number;
};

const sortStatScoresAsc = (a: StatsRecord, b: StatsRecord): number =>
  b.score - a.score;

const sortStatScoresDsc = (a: StatsRecord, b: StatsRecord): number =>
  a.score - b.score;

export const FancyPlayerName = ({ player }: { player: PlayerDatum }) => {
  return (
    <div className="fancyPlayer" style={{ color: player.color }}>
      <div style={{ borderColor: player.color }} className="playerAvatar">
        <Image
          src={`http://ddragon.leagueoflegends.com/cdn/14.5.1/img/profileicon/${player.metaData?.profileIconId}.png`}
          width={18}
          height={18}
          alt={`${player.name}'s League Avatar`}
        />
      </div>

      {player.name}
    </div>
  );
};

export function StatsGlance({
  games,
  compareProperty,
  players,
  teamWinRate,
}: {
  games: (GameStub | undefined)[];
  compareProperty: string;
  players: PlayerDatum[];
  teamWinRate: number | string;
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

  return (
    <div className="flex justify-between ">
      <div className="flex flex-row gap-16">
        <StatsAtom scores={average} name="Mean" />
        <StatsAtom scores={best} name="Highest in Game" />
        <StatsAtom
          scores={worst}
          name="Lowest in Game"
          sortFn={sortStatScoresDsc}
        />
      </div>
      <StatsAtom bigNumber={teamWinRate} name="Team Win Rate" />
    </div>
  );
}

function StatsAtom({
  bigNumber,
  scores,
  name,
  sortFn = sortStatScoresAsc,
}: {
  bigNumber?: string | number;
  scores?: StatsRecord[];
  name: string;
  sortFn?: (a: StatsRecord, b: StatsRecord) => number;
}) {
  return (
    <div className="">
      <div className="pb-2 font-s">{name}</div>
      <div className="flex items-center gap-5">
        <div className="font-black text-3xl team-color">
          {bigNumber ?? teamScore(scores ?? [])}
        </div>
        <ol className="list-decimal text-sm">
          {scores?.sort(sortFn).map(({ player, score }) => (
            <li
              key={player.name}
              className="flex items-center whitespace-nowrap"
            >
              <FancyPlayerName player={player} />: {formatAndRound(score)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
