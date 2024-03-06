import ky from "ky";

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    console.log({ params, key: process.env.RIOT_API_KEY });
    const reqUrl = new URL(
      `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${params.name}/ids`
    );
    reqUrl.searchParams.set("api_key", process.env.RIOT_API_KEY ?? "");
    reqUrl.searchParams.set("count", String(100));
    const data = await ky.get(reqUrl).json();
    return Response.json(data);
  } catch (error) {
    console.log("There was an error", { error, request });
    return Response.error();
  }
}
