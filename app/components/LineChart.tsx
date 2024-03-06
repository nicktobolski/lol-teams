import { PointTooltipProps, ResponsiveLine } from "@nivo/line";
import { nivoTheme } from "../utils/nivoTheme";
import { BasicTooltip } from "@nivo/tooltip";
import { format, formatDistance, formatRelative, subDays } from "date-fns";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
export interface LineGroupData {
  id: string;
  data: LineData[];
}

export interface LineData {
  x: string | number;
  y: number | string;
}

type Props = {
  data: LineGroupData[];
};

const Tooltip: React.FunctionComponent<PointTooltipProps> = (props) => {
  console.log({ props });
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

const msToTickerDate = (ms: string | number) => {
  return format(ms, "M/d hh:mm:aa");
};
export const LineChart = ({ data }: Props) => (
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
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 45,
        legendOffset: 36,
        legendPosition: "middle",
        truncateTickAt: 0,
        format: msToTickerDate,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legendOffset: -40,
        legendPosition: "middle",
        truncateTickAt: 0,
      }}
      pointSize={24}
      colors={{ datum: "color" }}
      pointColor={{ from: nivoTheme }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      tooltip={Tooltip}
    />
  </>
);
