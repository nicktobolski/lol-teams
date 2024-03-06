"use client";
import { LAYOUT_CLASSES, TEST_DATA } from "../consts";
import { useSearchParams } from "next/navigation";
// import { format } from "date-fns"
import {
  ParticipantRecord,
  fetchGameById,
  fetchGameTimelineById,
  fetchGamesByPuuid,
  fetchUserByName,
} from "../hooks/lolHooks";
import { useQueries } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import { getRandomColor, intersectionOfArrays } from "../utils/utils";
import { LineChart } from "../components/LineChart";
import { Select, SelectSection, SelectItem } from "@nextui-org/react";
import { format } from "date-fns";

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

  const propertyFunctionMap = {
    kda: ({ kills, assists, deaths }: ParticipantRecord) => {
      return (
        Math.round(
          ((kills + assists) / (deaths === 0 ? 1 : deaths) + Number.EPSILON) *
            100
        ) / 100
      );
    },
  };
  const justGames = gameResults.map((result) => result.data);
  const chartData = puuids.map((id, index) => {
    return {
      id: teamMemberNames?.[index] ?? "asdf",
      data: justGames.map((game) => {
        const participantData = game?.info.participants.find(
          (part) => part.puuid === id
        );
        if (!participantData) {
          return { x: 0, y: 0 };
        }
        return {
          // @ts-ignore
          y: propertyFunctionMap[compareProperty]
            ? // @ts-ignore
              propertyFunctionMap[compareProperty](participantData)
            : // @ts-ignore
              participantData?.[compareProperty] ?? "",
          x: game?.metadata.matchId ?? "",
          // date: format(game?.info.gameCreation ?? "", "MM/dd/yy HH:MM"),
        };
      }),
    };
  });

  const validDataComparisonPoints = [
    "kills",
    "assists",
    "deaths",
    "kda",
    "goldEarned",
  ];
  return (
    <div className="flex w-full flex-wrap md:flex-nowrap gap-4 md:flex-col">
      <Select
        label="Select a property to compare"
        className="max-w-xs absolute metricSelector"
        onChange={(event) => setCompareProperty(event.target.value)}
        defaultSelectedKeys={[compareProperty]}
      >
        {validDataComparisonPoints.map((key) => (
          <SelectItem key={key} value={key}>
            {key}
          </SelectItem>
        ))}
      </Select>

      <div className="h-128 w-full chartContainer">
        <LineChart data={chartData} />
      </div>
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
