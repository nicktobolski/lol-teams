import { UseQueryResult } from "@tanstack/react-query";
import { LineData, LineType } from "../components/LineChart";
import { StatsRecord } from "../components/StatsGlance";
import { ALL_PING_KEYS, COOL_COLORS } from "../consts";
import { GameStub, ParticipantRecord, PlayerMetaData } from "../hooks/lolHooks";

export function intersectionOfArrays(...arrays: string[][]): string[] {
  // Check if there are no arrays or any one of the arrays is empty
  if (arrays.length === 0 || arrays.some((arr) => arr.length === 0)) {
    return [];
  }

  // Take the first array as the base for comparison
  const firstArray = arrays[0];

  // Filter the first array to include only those elements
  // that are present in every other array
  return firstArray.filter((item) => arrays.every((arr) => arr.includes(item)));
}

export function getRandomColor() {
  function rand(min: number, max: number) {
    return min + Math.random() * (max - min);
  }
  var h = rand(1, 360);
  var s = rand(0, 100);
  var l = rand(0, 100);
  return "hsl(" + h + "," + s + "%," + l + "%)";
}

export const propertyFunctionMap = {
  kda: ({ kills, assists, deaths }: ParticipantRecord) => {
    return calcKda(kills, assists, deaths);
  },
  totalPings: (record: ParticipantRecord) => {
    const number = ALL_PING_KEYS.reduce((acc, key) => {
      // @ts-ignore
      return (acc += Number(record[key] ?? 0));
    }, 0);
    return number;
  },
  pingDiversity: (record: ParticipantRecord) => {
    const pingValues = ALL_PING_KEYS.map(
      (key) => getParticipantsDataForCompareKey(record, key) ?? 0
    );
    const uniquePings: number = pingValues.filter((val) => val > 0).length;
    // console.log({ pingValues, uniquePings });

    return uniquePings;
  },
  killParticipation: (record: ParticipantRecord) => {
    return record.kills + record.assists;
  },
  totalSpellCasts: (record: ParticipantRecord) => {
    return (
      record.spell1Casts +
      record.spell2Casts +
      record.spell3Casts +
      record.spell4Casts
    );
  },
};

export const getParticipantsDataForCompareKey = (
  record: ParticipantRecord,
  compareKey: string
) => {
  // @ts-ignore
  return propertyFunctionMap[compareKey]
    ? // @ts-ignore
      propertyFunctionMap[compareKey](record)
    : // @ts-ignore
      record?.[compareKey] ?? "";
};

export function calcKda(kills: number, assists: number, deaths: number) {
  return roundTo2DecimalPlaces((kills + assists) / (deaths === 0 ? 1 : deaths));
}

export function formattedKda(kills: number, assists: number, deaths: number) {
  return formatAndRound((kills + assists) / (deaths === 0 ? 1 : deaths));
}

export function getParticipantDataFromGame(
  puuid: string
): (
  value: GameStub | undefined,
  index: number,
  array: (GameStub | undefined)[]
) => ParticipantRecord {
  return (game) => {
    const participantData = game?.info.participants.find(
      (part) => part.puuid === puuid
    );
    return participantData ?? ({} as ParticipantRecord);
  };
}

// export const roundTo2DecimalPlaces = (num: number) =>
//   (Math.round(num + Number.EPSILON) * 100) / 100;

export const formatNumber = new Intl.NumberFormat("en-US", {}).format;

export function roundTo2DecimalPlaces(num: number): number {
  // Check if the number has any decimal places
  if (!Number.isInteger(num)) {
    // Round to two decimal places
    return Math.round(num * 100) / 100;
  }
  return num;
}

export const formatAndRound = (number: number) =>
  formatNumber(roundTo2DecimalPlaces(number));

export function averageXValues(lineDataArrays: LineData[][]): LineData[] {
  const sumMap = new Map<string, number>();

  // Summing and x values for each y
  lineDataArrays.forEach((array) => {
    array.forEach(({ x, y }) => {
      sumMap.set(x, (sumMap.get(x) || 0) + y);
    });
  });

  // Averaging x values
  const result: LineData[] = [];
  sumMap.forEach((y, x) => {
    const avgY = y / lineDataArrays.length;
    result.push({ x, y: avgY });
  });
  return result;
}

export const teamScore = (scores: StatsRecord[]) => {
  return formatAndRound(
    scores.reduce((acc, statScore) => {
      return (acc += statScore.score);
    }, 0) / scores.length
  );
};

export function errorHandler({
  error,
  request,
}: {
  error: unknown;
  request: Request;
}) {
  // console.log("There was an error", { error, request });
  return Response.error();
}

export function getPlayersDataFromQueryResults(
  userResults: UseQueryResult<PlayerMetaData, Error>[],
  teamMemberNames?: string[]
): [string[], any[]] {
  const puuids =
    teamMemberNames
      ?.map((name, i) => userResults?.[i]?.data?.puuid ?? "")
      .filter(Boolean) ?? [];

  const players =
    teamMemberNames?.map((name, i) => {
      return {
        color: COOL_COLORS[i],
        puuid: userResults?.[i]?.data?.puuid ?? "asdf",
        name,
        metaData: userResults?.[i]?.data,
      };
    }) ?? [];

  return [puuids, players];
}

export function createChartMarkers(
  teamAverage: string,
  playerChartData: {
    id: any;
    color: any;
    lineType: LineType;
    data: (
      | { x: string; y: number; data?: undefined; participantData?: undefined }
      | {
          y: number;
          data: GameStub | undefined;
          x: string;
          participantData: ParticipantRecord;
        }
    )[];
  }[],
  puuids: string[]
) {
  const chartMarkers = [] as any;
  chartMarkers.push({
    axis: "y",
    color: "var(--team-color)",
    value: teamAverage.replace(",", ""),
  });
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
  return { totalWins, chartMarkers };
}

export type ParticipantRecordWithAugments = ParticipantRecord &
  typeof propertyFunctionMap;

const COMPARE_KEY_LABELS: Record<keyof ParticipantRecordWithAugments, string> =
  {
    kda: "KDA",
    kills: "Kills",
    assists: "Assists",
    deaths: "Deaths",
    allInPings: "All In Pings",
    assistMePings: "Assist Me Pings",
    baronKills: "Baron Kills",
    basicPings: "Basic Pings",
    bountyLevel: "Bounty Level",
    champExperience: "Champion Experience",
    champLevel: "Champion Level",
    championId: "Champion ID",
    championName: "Champion Name",
    championTransform: "Champion Transform",
    commandPings: "Command Pings",
    consumablesPurchased: "Consumables Purchased",
    damageDealtToBuildings: "Damage Dealt To Buildings",
    damageDealtToObjectives: "Damage Dealt To Objectives",
    damageDealtToTurrets: "Damage Dealt To Turrets",
    damageSelfMitigated: "Damage Self Mitigated",
    dangerPings: "Danger Pings",
    detectorWardsPlaced: "Detector Wards Placed",
    doubleKills: "Double Kills",
    dragonKills: "Dragon Kills",
    eligibleForProgression: "Eligible For Progression",
    enemyMissingPings: "Enemy Missing Pings",
    enemyVisionPings: "Enemy Vision Pings",
    firstBloodAssist: "First Blood Assist",
    firstBloodKill: "First Blood Kill",
    firstTowerAssist: "First Tower Assist",
    firstTowerKill: "First Tower Kill",
    gameEndedInEarlySurrender: "Game Ended In Early Surrender",
    gameEndedInSurrender: "Game Ended In Surrender",
    getBackPings: "Get Back Pings",
    goldEarned: "Gold Earned",
    goldSpent: "Gold Spent",
    holdPings: "Hold Pings",
    individualPosition: "Individual Position",
    inhibitorKills: "Inhibitor Kills",
    inhibitorTakedowns: "Inhibitor Takedowns",
    inhibitorsLost: "Inhibitors Lost",
    item0: "Item 0",
    item1: "Item 1",
    item2: "Item 2",
    item3: "Item 3",
    item4: "Item 4",
    item5: "Item 5",
    item6: "Item 6",
    itemsPurchased: "Items Purchased",
    killingSprees: "Killing Sprees",
    lane: "Lane",
    largestCriticalStrike: "Largest Critical Strike",
    largestKillingSpree: "Largest Killing Spree",
    largestMultiKill: "Largest Multi Kill",
    longestTimeSpentLiving: "Longest Time Spent Living",
    magicDamageDealt: "Magic Damage Dealt",
    magicDamageDealtToChampions: "Magic Damage Dealt To Champions",
    magicDamageTaken: "Magic Damage Taken",
    missions: "Missions",
    needVisionPings: "Need Vision Pings",
    neutralMinionsKilled: "Neutral Minions Killed",
    nexusKills: "Nexus Kills",
    nexusLost: "Nexus Lost",
    nexusTakedowns: "Nexus Takedowns",
    objectivesStolen: "Objectives Stolen",
    objectivesStolenAssists: "Objectives Stolen Assists",
    onMyWayPings: "On My Way Pings",
    participantId: "Participant ID",
    pentaKills: "Penta Kills",
    perks: "Perks",
    physicalDamageDealt: "Physical Damage Dealt",
    physicalDamageDealtToChampions: "Physical Damage Dealt To Champions",
    physicalDamageTaken: "Physical Damage Taken",
    placement: "Placement",
    playerAugment1: "Player Augment 1",
    playerAugment2: "Player Augment 2",
    playerAugment3: "Player Augment 3",
    playerAugment4: "Player Augment 4",
    playerScore0: "Player Score 0",
    playerScore1: "Player Score 1",
    playerScore10: "Player Score 10",
    playerScore11: "Player Score 11",
    playerScore2: "Player Score 2",
    playerScore3: "Player Score 3",
    playerScore4: "Player Score 4",
    playerScore5: "Player Score 5",
    playerScore6: "Player Score 6",
    playerScore7: "Player Score 7",
    playerScore8: "Player Score 8",
    playerScore9: "Player Score 9",
    playerSubteamId: "Player Subteam ID",
    profileIcon: "Profile Icon",
    pushPings: "Push Pings",
    puuid: "Puuid",
    quadraKills: "Quadra Kills",
    riotIdGameName: "Riot ID Game Name",
    riotIdTagline: "Riot ID Tagline",
    role: "Role",
    sightWardsBoughtInGame: "Sight Wards Bought In Game",
    spell1Casts: "Spell 1 Casts",
    spell2Casts: "Spell 2 Casts",
    spell3Casts: "Spell 3 Casts",
    spell4Casts: "Spell 4 Casts",
    subteamPlacement: "Subteam Placement",
    summoner1Casts: "Summoner 1 Casts",
    summoner1Id: "Summoner 1 ID",
    summoner2Casts: "Summoner 2 Casts",
    summoner2Id: "Summoner 2 ID",
    summonerId: "Summoner ID",
    summonerLevel: "Summoner Level",
    summonerName: "Summoner Name",
    teamEarlySurrendered: "Team Early Surrendered",
    teamId: "Team ID",
    teamPosition: "Team Position",
    timeCCingOthers: "Time CCing Others",
    timePlayed: "Time Played",
    totalAllyJungleMinionsKilled: "Total Ally Jungle Minions Killed",
    totalDamageDealt: "Total Damage Dealt",
    totalDamageDealtToChampions: "Total Damage Dealt To Champions",
    totalDamageShieldedOnTeammates: "Total Damage Shielded On Teammates",
    totalDamageTaken: "Total Damage Taken",
    totalEnemyJungleMinionsKilled: "Total Enemy Jungle Minions Killed",
    totalHeal: "Total Heal",
    totalHealsOnTeammates: "Total Heals On Teammates",
    totalMinionsKilled: "Total Minions Killed",
    totalTimeCCDealt: "Total Time CC Dealt",
    totalTimeSpentDead: "Total Time Spent Dead",
    totalUnitsHealed: "Total Units Healed",
    tripleKills: "Triple Kills",
    trueDamageDealt: "True Damage Dealt",
    trueDamageDealtToChampions: "True Damage Dealt To Champions",
    trueDamageTaken: "True Damage Taken",
    turretKills: "Turret Kills",
    turretTakedowns: "Turret Takedowns",
    turretsLost: "Turrets Lost",
    unrealKills: "Unreal Kills",
    visionClearedPings: "Vision Cleared Pings",
    visionScore: "Vision Score",
    visionWardsBoughtInGame: "Vision Wards Bought In Game",
    wardsKilled: "Wards Killed",
    wardsPlaced: "Wards Placed",
    win: "Win",
    totalPings: "Total Pings",
    pingDiversity: "Ping Diversity",
    killParticipation: "Kill Participation",
    totalSpellCasts: "Total Spell Casts",
  };

export const formatCompareKey = (
  compareKey: keyof ParticipantRecordWithAugments
) => COMPARE_KEY_LABELS[compareKey] ?? compareKey;
