import { ParticipantRecordWithAugments } from "./utils/utils";

export const LAYOUT_CLASSES =
  "flex min-h-screen flex-col items-center justify-start dark text-foreground bg-background";
export const ALL_PING_KEYS: (keyof ParticipantRecordWithAugments)[] = [
  "allInPings",
  "assistMePings",
  "getBackPings",
  "onMyWayPings",
  "basicPings",
  "commandPings",
  "dangerPings",
  "enemyMissingPings",
  "enemyVisionPings",
  "holdPings",
  "needVisionPings",
  "pushPings",
  "visionClearedPings",
];
export const DATA_COMPARE_KEYS: (keyof ParticipantRecordWithAugments)[] = [
  "kills",
  "assists",
  "deaths",
  "kda",
  "goldEarned",
  "totalDamageDealt",
  "totalDamageDealtToChampions",
  "totalMinionsKilled",
  "damageDealtToObjectives",
  "visionScore",
  "visionWardsBoughtInGame",
  "wardsKilled",
  "wardsPlaced",
  "totalPings",
  "pingDiversity",

  "turretTakedowns",
  "turretKills",
  "timeCCingOthers",
  "totalHealsOnTeammates",
  "champExperience",
  "largestMultiKill",
  "doubleKills",
  "tripleKills",
  "quadraKills",
  "pentaKills",
  "inhibitorTakedowns",
  ...ALL_PING_KEYS,
];

export const COOL_COLORS = [
  "var(--rose)",
  "var(--vivid-sky-blue)",
  "var(--light-green)",
  "var(--neon-blue)",
  "hsl(268, 88%, 36%)",
  "hsl(263, 87%, 35%)",
  "hsl(258, 86%, 34%)",
  "hsl(243, 57%, 50%)",
  "hsl(229, 83%, 60%)",
  "hsl(212, 84%, 61%)",
];
