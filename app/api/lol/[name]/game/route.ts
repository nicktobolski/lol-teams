import { errorHandler } from "@/app/utils/utils";
import ky from "ky";

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");
    const reqUrl = new URL(
      `https://americas.api.riotgames.com/lol/match/v5/matches/${params.name}${
        mode === "timeline" ? "/timeline" : ""
      }`
    );
    reqUrl.searchParams.set("api_key", process.env.RIOT_API_KEY ?? "");
    reqUrl.searchParams.set("count", String(50));
    const data = await ky.get(reqUrl).json();
    return Response.json(data);
  } catch (error) {
    return errorHandler({ error, request });
  }
}
