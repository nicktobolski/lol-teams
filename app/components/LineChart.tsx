import { PointTooltipProps, ResponsiveLine } from "@nivo/line";
import { nivoTheme } from "../utils/nivoTheme";
import { BasicTooltip } from "@nivo/tooltip";
import { format } from "date-fns";
import { GameStub, ParticipantRecord } from "../hooks/lolHooks";
import { getParticipantDataFromGame } from "../utils/utils";
import Image from "next/image";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
export interface LineGroupData {
  id: string;
  data: LineData[];
  color: string;
  lineType?: LineType;
}

export type LineType = "dashed" | "solid" | "thickDashed" | "thickSolid";
export interface LineData {
  x: string;
  y: number;
  data?: GameStub;
  participantData?: ParticipantRecord;
}

type Props = {
  data: LineGroupData[];
  markers?: {
    color: string;
    axis: "y" | "x";
    value: any;
    lineType?: LineType;
    icon?: string;
  }[];
};

const TooltipThing: React.FunctionComponent<PointTooltipProps> = (props) => {
  const pointData = props.point.data as LineData;
  return (
    <div
      style={{ borderColor: props.point.color ?? "transparent" }}
      className="chartTooltip px-3 py-1"
    >
      <div>
        <span className="font-black">
          {props.point.serieId} {props.point.color}:{" "}
        </span>
        {`${new Intl.NumberFormat("en-US").format(
          props.point.data.y as number
        )}`}
      </div>
      {pointData.participantData && (
        <div className="flex gap-2">
          <Image
            src={`http://ddragon.leagueoflegends.com/cdn/14.5.1/img/champion/${pointData.participantData?.championName}.png`}
            width={32}
            height={32}
            alt={`Player avatar`}
            className="avatar"
          />
          <div className="flex items-center">
            {pointData.participantData?.championName}
          </div>
        </div>
      )}
    </div>
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
  return format(ms ?? 0, "M/d ")
    .toLowerCase()
    .slice(0, -1);
};

const styleByType = {
  dashed: {
    strokeDasharray: "5, 5",
    strokeWidth: 2,
  },
  thickDashed: {
    strokeDasharray: "10, 1",
    strokeWidth: 10,
  },
  solid: {
    strokeWidth: 2,
  },
  thickSolid: {
    strokeWidth: 8,
  },
};

// const DashedLine: any = ({
//   series,
//   lineGenerator,
//   xScale,
//   yScale,
// }: {
//   series: LineGroupData[];
//   lineGenerator: any;
//   xScale: any;
//   yScale: any;
// }) => {
//   return series.map(({ id, data, color, lineType }) => {
//     return (
//       <path
//         key={id}
//         d={lineGenerator(
//           data.map((d: any) => ({
//             x: xScale(d.data.x),
//             y: yScale(d.data.y),
//           }))
//         )}
//         fill="none"
//         stroke={color}
//         style={styleByType[lineType ?? "solid"]}
//       />
//     );
//   });
// };
export const LineChart = ({ data, markers }: Props) => (
  <>
    <ResponsiveLine
      data={data}
      theme={nivoTheme}
      animate={true}
      margin={{ top: 50, right: 90, bottom: 150, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: 0,
        max: "auto",
      }}
      markers={(markers ?? []).map((marker) => ({
        axis: marker.axis,
        legend: marker?.icon ?? "",
        legendPosition: "top",
        lineStyle: {
          ...styleByType[(marker.lineType as LineType) ?? "dashed"],
          stroke: marker.color ?? "transparent",
        },
        value: marker.value,
      }))}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 45,
        truncateTickAt: 0,
        format: (ms) => msToTickerDate(Number(ms)) || "???",
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legendOffset: -40,
        legendPosition: "middle",
        truncateTickAt: 0,
      }}
      pointSize={7}
      colors={{ datum: "color" }}
      pointColor={{ from: nivoTheme }}
      // pointSymbol={Pointer}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      layers={[
        // "grid",
        "markers",
        "areas",
        "lines",
        // DashedLine,
        // "slices",
        "crosshair",
        "axes",
        "legends",
        "points",
        "mesh",
      ]}
      tooltip={TooltipThing}
    />
  </>
);
