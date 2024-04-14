"use client";
export const fetchCache = "force-no-store";
import { DATA_COMPARE_KEYS, LAYOUT_CLASSES } from "../consts";
import { useSearchParams } from "next/navigation";

import {
  GameStub,
  fetchGameById,
  fetchGamesByPuuid,
  fetchUserByName,
} from "../hooks/lolHooks";
import { useQueries } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import {
  ParticipantRecordWithAugments,
  averageXValues,
  formatAndRound,
  formatCompareKey,
  getParticipantDataFromGame,
  getParticipantsDataForCompareKey,
  getPlayersDataFromQueryResults,
  intersectionOfArrays,
  teamScore,
} from "../utils/utils";
import { LineChart, LineGroupData, LineType } from "../components/LineChart";
import { Select, SelectItem, Switch } from "@nextui-org/react";
import { StatsGlance, StatsRecord } from "../components/StatsGlance";
import { ChartLoading } from "../components/ChartLoading";
import { motion } from "framer-motion";

const PageContent = () => {
  const searchParams = useSearchParams();
  const teamMemberNames = searchParams.get("members")?.split(",");
  const gameCountRequested = parseInt(searchParams.get("count") ?? "0");

  const [compareProperty, setCompareProperty] = useState("kda");
  const [linesToInclude, setLinesToInclude] = useState("team");

  const getUserDataByUserNameQueries = (teamMemberNames || []).map((name) => {
    return {
      queryKey: ["user", name],
      queryFn: () => fetchUserByName(name),
      staleTime: Infinity,
    };
  });
  const userResults = useQueries({
    queries: getUserDataByUserNameQueries,
  });
  const [puuids, players] = getPlayersDataFromQueryResults(
    userResults,
    teamMemberNames
  );

  const gameIdsQueries = useMemo(() => {
    return players.map(({ puuid }) => {
      return {
        queryKey: ["matches", puuid],
        queryFn: () => fetchGamesByPuuid(puuid),
        staleTime: 0,
        enabled: puuids.length === userResults.length,
      };
    });
  }, [players, puuids.length, userResults.length]);
  const gameIdsResults = useQueries({
    queries: gameIdsQueries,
  });
  const relevantGameIds: string[] = useMemo(() => {
    const allGames = (gameIdsResults ?? []).map((result) => result?.data ?? []);
    return intersectionOfArrays(...allGames);
  }, [gameIdsResults]);

  const gamesCount2get =
    gameCountRequested && gameCountRequested < 501 ? gameCountRequested : 500;
  const gameQueries = (relevantGameIds.slice(0, gamesCount2get) || []).map(
    (id) => {
      return {
        queryKey: ["game", id],
        queryFn: () => fetchGameById(id),
        staleTime: Infinity,
        enabled: relevantGameIds.length > 0,
        retryDelay: (attemptIndex: number) =>
          Math.min(300 * 2 ** attemptIndex, 60000),
      };
    }
  );

  const gameResults = useQueries({
    queries: gameQueries,
  });

  const justGames = useMemo(
    () => gameResults.map((result) => result.data),
    [gameResults]
  );
  const isSomeQueryLoading =
    userResults.length === 0 ||
    gameIdsResults.length === 0 ||
    gameResults.length === 0 ||
    [...gameResults, ...gameIdsResults, ...userResults]
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
  ).map((point) => {
    const relevantGame =
      justGames.find(
        (game) => game?.info.gameCreation.toString() === point.x
      ) ?? ({} as GameStub);
    return { ...point, data: relevantGame };
  });

  const teamChartData = useMemo(
    () => ({
      id: "Team",
      color: "white",
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

  chartMarkers.push({
    axis: "y",
    color: "var(--team-color)",
    value: teamAverage.replace(",", ""),
  });

  const chartLineData = useMemo(() => {
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

  const maxY = useMemo(() => getMaxY(playerChartData), [playerChartData]);

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

    // somehow always false... maybe riot doesn't have this data?
    if (anyTeamMembersRecords?.teamEarlySurrendered) {
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
    <div className="flex w-full flex-wrap md:flex-nowrap gap-4 md:flex-col overflow-y-hidden">
      {isSomeQueryLoading && (
        <div className="fade-in">
          <ChartLoading loadingText={"Loading team game data..."} />
        </div>
      )}
      {!isSomeQueryLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-12 items-center pt-8 gap-8">
            <div className="col-start-1 col-end-4 pl-24 pr-5 flex flex-col gap-4 pt-10">
              <Select
                label="Compare"
                className="max-w-xs"
                onChange={(event) => setCompareProperty(event.target.value)}
                defaultSelectedKeys={[compareProperty]}
                size="lg"
              >
                {DATA_COMPARE_KEYS.map((key) => (
                  <SelectItem key={key} value={key} className="text-white">
                    {formatCompareKey(key)}
                  </SelectItem>
                ))}
              </Select>

              <Switch
                color="secondary"
                isSelected={linesToInclude === "players"}
                onValueChange={(e) => setLinesToInclude(e ? "players" : "team")}
              >
                {linesToInclude === "team" ? "Team" : "Players"}
              </Switch>
            </div>

            <div className="col-start-4 col-end-12">
              <StatsGlance
                games={justGames}
                compareProperty={compareProperty}
                players={players ?? []}
                teamWinRate={`${formatAndRound(
                  (totalWins / (justGames?.length ?? 1)) * 100
                )}%`}
              />
            </div>
          </div>

          <div
            className={`h-128 w-full chartContainer px-12 pt-8 min-w-[600px]`}
          >
            <LineChart
              data={chartLineData}
              markers={chartMarkers}
              teamPuuids={puuids}
              compareKey={
                compareProperty as keyof ParticipantRecordWithAugments
              }
              shouldShowBigToolTip={true}
              maxY={maxY}
            />
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

// used to set the y axis height
function getMaxY(chartLineData: LineGroupData[]): number {
  let maxY = -Infinity;

  chartLineData.forEach((lineGroup) => {
    lineGroup.data.forEach((dataPoint) => {
      if (dataPoint.y > maxY) {
        maxY = dataPoint.y;
      }
    });
  });

  return maxY;
}
