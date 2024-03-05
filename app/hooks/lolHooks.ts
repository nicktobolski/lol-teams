import ky from "ky";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

const fetchUserByName = async (summonerName: string) => {
  return await ky
    .get(`api/lol/${summonerName}/profile`)
    .json<{ puuid: string }>();
};
const fetchGamesByPuuid = async (id: string): Promise<string[]> => {
  return await ky.get(`api/lol/${id}/games`).json();
};

const useSummonerMatches = (summonerName: string) => {
  return useQuery({
    queryKey: ["user", summonerName],
    queryFn: async () => fetchUserByName(summonerName),
  });
};

export { useSummonerMatches, fetchUserByName, fetchGamesByPuuid };
// /lol/match/v5/matches/by-puuid/{puuid}/ids
