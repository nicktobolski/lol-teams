import { PointTooltipProps, ResponsiveLine } from "@nivo/line";
import { nivoTheme } from "../utils/nivoTheme";
import { BasicTooltip, TooltipWrapper } from "@nivo/tooltip";
import { format, formatDistance, formatRelative, subDays } from "date-fns";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
export interface LineGroupData {
  id: string;
  data: LineData[];
  color: string;
}

export interface LineData {
  x: string;
  y: number;
}

type Props = {
  data: LineGroupData[];
};

const TooltipThing: React.FunctionComponent<PointTooltipProps> = (props) => {
  const gameData = JSON.parse(props.point.data.x as any);
  // const getParticipantDataFromGame()
  return (
    <BasicTooltip
      id={props.point.serieId}
      value={`${new Intl.NumberFormat("en-US").format(
        props.point.data.y as number
      )}`}
      enableChip
    />
  );
};
const Pointer = (props: {}) => {
  // console.log({ props });
  //   <Image
  //   src={`http://ddragon.leagueoflegends.com/cdn/10.18.1/img/profileicon/${player.metaData?.profileIconId}.png`}
  //   width={36}
  //   height={36}
  //   alt={`${player.name}'s League Avatar`}
  // />
  return <div></div>;
};

const msToTickerDate = (ms: string | number) => {
  return format(ms ?? 0, "M/d hh:mm:aa");
};

// const DashedSolidLine = ({ series }: { series: any[] }) => {
//   return series.map(({ id, data, color }, index) => (
//     <path
//       key={id}
//       style={
//         index === 4
//           ? {
//               // simulate line will dash stroke when index is even
//               strokeDasharray: "3, 6",
//               strokeWidth: 3,
//             }
//           : {
//               // simulate line with solid stroke
//               strokeWidth: 1,
//             }
//       }
//     />
//   ));
// };
export const LineChart = ({ data }: Props) => (
  <>
    <ResponsiveLine
      data={data}
      theme={nivoTheme}
      // layers={[DashedSolidLine]}
      animate={true}
      margin={{ top: 50, right: 90, bottom: 150, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: 0,
        max: "auto",
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 45,
        legendOffset: 36,
        legendPosition: "middle",
        truncateTickAt: 0,
        format: (game) =>
          msToTickerDate(JSON.parse(game)?.info?.gameCreation) || "???",
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legendOffset: -40,
        legendPosition: "middle",
        truncateTickAt: 0,
      }}
      pointSize={10}
      colors={{ datum: "color" }}
      pointColor={{ from: nivoTheme }}
      // pointSymbol={Pointer}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      tooltip={TooltipThing}
    />
  </>
);
