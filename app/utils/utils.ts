import { ALL_PING_KEYS } from "../consts";
import { GameStub, ParticipantRecord } from "../hooks/lolHooks";

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
  kda: ({ kills, assists, deaths }: ParticipantRecord) =>
    roundTo2DecimalPlaces(kills + assists) / (deaths === 0 ? 1 : deaths),
  totalPings: (record: ParticipantRecord) => {
    const number = ALL_PING_KEYS.reduce((acc, key) => {
      // @ts-ignore
      return (acc += Number(record[key]));
    }, 0);
    return number;
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

export const roundTo2DecimalPlaces = (num: number) =>
  (Math.round(num + Number.EPSILON) * 100) / 100;

export const formatNumber = new Intl.NumberFormat("en-US", {
  maximumSignificantDigits: 5,
}).format;
