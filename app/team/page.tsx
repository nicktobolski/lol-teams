"use client";
import { COOL_COLORS, DATA_COMPARE_KEYS, LAYOUT_CLASSES } from "../consts";
import { useSearchParams } from "next/navigation";

import {
  fetchGameById,
  fetchGamesByPuuid,
  fetchUserByName,
} from "../hooks/lolHooks";
import { useQueries } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import {
  averageXValues,
  getParticipantDataFromGame,
  getParticipantsDataForCompareKey,
  intersectionOfArrays,
  teamScore,
} from "../utils/utils";
import { LineChart, LineGroupData, LineType } from "../components/LineChart";
import {
  Button,
  Checkbox,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { StatsGlance, StatsRecord } from "../components/StatsGlance";
import { ChartLoading } from "../components/ChartLoading";
import { motion } from "framer-motion";
import { Meteors } from "../components/ui/Meteors";

const PageContent = () => {
  const searchParams = useSearchParams();
  const teamMemberNames = searchParams.get("members")?.split(",");
  const gameCountRequested = parseInt(searchParams.get("count") ?? "0");
  const [compareProperty, setCompareProperty] = useState("kda");
  const [shouldShowTeamLine, setShouldShowTeamLine] = useState(true);
  const [shouldShowPlayerLines, setShouldShowPlayerLines] = useState(false);
  const [linesToInclude, setLinesToInclude] = useState("both");
  const userQueries = (teamMemberNames || []).map((name) => {
    return {
      queryKey: ["user", name],
      queryFn: () => fetchUserByName(name),
      staleTime: Infinity,
    };
  });
  const userResults = useQueries({
    queries: userQueries,
  });

  const puuids = userResults
    .map(({ data }) => data?.puuid ?? "")
    .filter(Boolean);

  const players = useMemo(
    () =>
      teamMemberNames?.map((name, i) => {
        return {
          color: COOL_COLORS[i],
          puuid: userResults?.[i]?.data?.puuid ?? "asdf",
          name,
          metaData: userResults?.[i]?.data,
        };
      }) ?? [],
    [teamMemberNames, userResults]
  );

  const gameIdsQueries = players.map(({ puuid }) => {
    return {
      queryKey: ["matches", puuid],
      queryFn: () => fetchGamesByPuuid(puuid),
      staleTime: 0,
      enabled: puuids.length === userResults.length,
    };
  });

  const gameIdsResults = useQueries({
    queries: gameIdsQueries,
  });

  const relevantGameIds: string[] = useMemo(() => {
    const allGames = (gameIdsResults ?? []).map((result) => result?.data ?? []);
    return intersectionOfArrays(...allGames);
  }, [gameIdsResults]);

  const games2get = gameCountRequested
    ? gameCountRequested < 51
      ? gameCountRequested
      : 50
    : 40;
  const gameQueries = (relevantGameIds.slice(0, games2get) || []).map((id) => {
    return {
      queryKey: ["game", id],
      queryFn: () => fetchGameById(id),
      staleTime: Infinity,
      enabled: relevantGameIds.length > 0,
    };
  });

  const gameResults = useQueries({
    queries: gameQueries,
  });

  const justGames = gameResults.map((result) => result.data);
  const isGameDataLoading =
    relevantGameIds.length === 0 ||
    gameResults
      .map(({ isLoading }) => isLoading)
      .some((isLoading) => isLoading);

  const playerChartData = useMemo(
    () =>
      players?.map(({ name, color, puuid }) => {
        return {
          id: name,
          color,
          lineType: "solid" as LineType,
          data: justGames
            .map((game) => {
              const participantData = game?.info.participants.find(
                (part) => part.puuid === puuid
              );
              if (!participantData) {
                return { x: "0", y: 0 };
              }
              return {
                y: getParticipantsDataForCompareKey(
                  participantData,
                  compareProperty
                ) as number,
                data: game,
                x: game?.info.gameCreation.toString() ?? "0",
                participantData,
              };
            })
            .reverse(),
        };
      }) ?? ([] as LineGroupData[]),
    [justGames, players, compareProperty]
  );

  const teamLineData = averageXValues(
    playerChartData.map((thing) => thing.data)
  );
  const teamChartData = useMemo(
    () => ({
      id: "Team",
      color: "var(--team-color)",
      lineType: "dashed" as LineType,
      data: teamLineData,
    }),
    [teamLineData]
  );

  const { average } = players.reduce<{
    average: StatsRecord[];
  }>(
    (acc, player) => {
      const scores = justGames
        .map(getParticipantDataFromGame(player.puuid))
        .map((participantData) =>
          getParticipantsDataForCompareKey(participantData, compareProperty)
        );
      const avgScore =
        scores.reduce((acc, score) => {
          acc += score;
          return acc;
        }, 0) / justGames.length;

      acc.average.push({ player, score: avgScore });

      return acc;
    },
    {
      average: [],
    }
  );

  const teamAverage = teamScore(average);
  const chartMarkers = [] as any;

  if (shouldShowTeamLine) {
    chartMarkers.push({
      axis: "y",
      color: "var(--team-color)",
      value: teamAverage.replace(",", ""),
    });
  }

  const allChartData = useMemo(() => {
    const newChartData = [];
    if (linesToInclude === "both") {
      newChartData.push(teamChartData);
      newChartData.push(...playerChartData);
    } else if (linesToInclude === "team") {
      newChartData.push(teamChartData);
    } else if (linesToInclude === "players") {
      newChartData.push(...playerChartData);
    }

    return newChartData;
  }, [playerChartData, teamChartData, linesToInclude]);

  let totalWins = 0;
  playerChartData?.[0]?.data.forEach((point) => {
    // if any player in puuids won the game, add a marker on the x axis at the appropriate key
    const anyTeamMembersRecords = point.data?.info.participants.find(
      ({ puuid }) => puuid === puuids[0]
    );
    if (anyTeamMembersRecords?.win) {
      totalWins++;
      chartMarkers.push({
        axis: "x",
        value: point?.data?.info.gameCreation.toString() ?? "0",
        lineType: "thickSolid" as LineType,
        color: "var(--win-highlight-color)",
        icon: "🏆",
      });
    }

    if (anyTeamMembersRecords?.teamEarlySurrendered) {
      console.log("it happen lol");
      chartMarkers.push({
        axis: "x",
        value: point?.data?.info.gameCreation.toString() ?? "0",
        lineType: "solid" as LineType,
        color: "var(--win-highlight-color)",
        icon: "🙈",
      });
    }
  });

  return (
    <div className="flex w-full flex-wrap md:flex-nowrap gap-4 md:flex-col">
      {isGameDataLoading && (
        <div className="fade-in">
          <ChartLoading loadingText={"Loading team game data..."} />
        </div>
      )}
      {!isGameDataLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-12 items-center pt-24 ">
            <div className="col-start-1 col-end-4 pl-24 flex flex-col gap-4 pt-16">
              <Select
                label="Compare"
                className="max-w-xs"
                onChange={(event) => setCompareProperty(event.target.value)}
                defaultSelectedKeys={[compareProperty]}
                size="lg"
              >
                {DATA_COMPARE_KEYS.map((key) => (
                  <SelectItem key={key} value={key} className="text-white">
                    {key}
                  </SelectItem>
                ))}
              </Select>
              <RadioGroup
                aria-label="Lines to include"
                orientation="horizontal"
                onChange={(event) => setLinesToInclude(event.target.value)}
                className="pl-2"
                defaultValue={linesToInclude}
              >
                <div className="flex gap-4">
                  <Radio value="team">Team</Radio>
                  <Radio value="players">Players</Radio>
                  <Radio value="both">Both</Radio>
                </div>
              </RadioGroup>
            </div>

            <div className="col-start-4 col-end-12">
              <StatsGlance
                games={justGames}
                compareProperty={compareProperty}
                players={players ?? []}
                teamWinRate={`${(totalWins / (justGames?.length ?? 1)) * 100}%`}
              />
            </div>
          </div>

          <div className={`h-128 w-full chartContainer px-12 pt-8`}>
            <LineChart data={allChartData} markers={chartMarkers} />
          </div>
        </motion.div>
      )}
    </div>
  );
};
export default function Page() {
  return (
    <main className={LAYOUT_CLASSES}>
      <Suspense>
        <PageContent />
      </Suspense>
    </main>
  );
}
