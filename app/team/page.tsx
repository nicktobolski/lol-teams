"use client";
import { DATA_COMPARE_KEYS, LAYOUT_CLASSES } from "../consts";
import { useSearchParams } from "next/navigation";

import {
  fetchGameById,
  fetchGamesByPuuid,
  fetchUserByName,
} from "../hooks/lolHooks";
import { useQueries } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import {
  getParticipantsDataForCompareKey,
  intersectionOfArrays,
} from "../utils/utils";
import { LineChart } from "../components/LineChart";
import { Select, SelectItem } from "@nextui-org/react";
import { StatsGlance } from "../components/StatsGlance";
import { ChartLoading } from "../components/ChartLoading";
import { motion } from "framer-motion";

const PageContent = () => {
  const searchParams = useSearchParams();
  const teamMemberNames = searchParams.get("members")?.split(",");
  const [compareProperty, setCompareProperty] = useState("kda");
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

  const gameIdsQueries = (puuids || []).map((id) => {
    return {
      queryKey: ["matches", id],
      queryFn: () => fetchGamesByPuuid(id),
      staleTime: Infinity,
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

  const gameQueries = (relevantGameIds.slice(0, 30) || []).map((id) => {
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

  const chartData = puuids.map((id, index) => {
    return {
      id: teamMemberNames?.[index] ?? "chud",
      data: justGames.map((game) => {
        const participantData = game?.info.participants.find(
          (part) => part.puuid === id
        );
        if (!participantData) {
          return { x: 0, y: 0 };
        }
        return {
          y: getParticipantsDataForCompareKey(participantData, compareProperty),
          x: game?.metadata.matchId ?? "",
        };
      }),
    };
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
          <div className="grid grid-cols-12 items-center">
            <div className="col-start-1 col-end-4 pl-14">
              <Select
                label="Compare"
                className="max-w-xs"
                onChange={(event) => setCompareProperty(event.target.value)}
                defaultSelectedKeys={[compareProperty]}
                size="lg"
              >
                {DATA_COMPARE_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="col-start-5 col-end-10">
              <StatsGlance
                games={justGames}
                puuids={puuids}
                teamMemberNames={teamMemberNames ?? []}
                compareProperty={compareProperty}
              />
            </div>
          </div>

          <div className={`h-128 w-full chartContainer`}>
            <LineChart data={chartData} />
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
