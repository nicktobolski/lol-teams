import ky from "ky";

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${
      params?.name ?? "tobogiorgio"
    }?api_key=${process.env.RIOT_API_KEY}`;

    const data = await ky.get(url).json();
    return Response.json(data);
  } catch (error) {
    console.log("There was an error", error);
  }
}
