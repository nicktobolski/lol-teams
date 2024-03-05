"use client";
import { LAYOUT_CLASSES } from "../consts";
import { useSearchParams } from "next/navigation";
import { fetchGamesByPuuid, fetchUserByName } from "../hooks/lolHooks";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { intersectionOfArrays } from "../utils/utils";
export default function Page() {
  const searchParams = useSearchParams();
  const teamMemberNames = searchParams.get("members")?.split(",");
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

  const gameQueries = (puuids || []).map((id) => {
    return {
      queryKey: ["matches", id],
      queryFn: () => fetchGamesByPuuid(id),
      staleTime: Infinity,
      enabled: puuids.length === userResults.length,
    };
  });

  const gameResults = useQueries({
    queries: gameQueries,
  });

  const relevantGameIds: string[] = useMemo(() => {
    const allGames = (gameResults ?? []).map((result) => result?.data ?? []);
    console.log({ allGames });
    return intersectionOfArrays(...allGames);
  }, [gameResults]);

  return (
    <main className={LAYOUT_CLASSES}>
      <pre>{JSON.stringify(relevantGameIds, null, 2)}</pre>
    </main>
  );
}
