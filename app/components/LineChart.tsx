import { PointTooltipProps, ResponsiveLine } from "@nivo/line";
import { nivoTheme } from "../utils/nivoTheme";
import { BasicTooltip } from "@nivo/tooltip";
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
  date: string;
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
export const LineChart = ({ data }: Props) => (
  <>
    <ResponsiveLine
      data={data}
      theme={nivoTheme}
      animate={true}
      margin={{ top: 50, right: 150, bottom: 150, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
      }}
      yFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 45,
        legend: "Games",
        legendOffset: 36,
        legendPosition: "middle",
        truncateTickAt: 0,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "count",
        legendOffset: -40,
        legendPosition: "middle",
        truncateTickAt: 0,
      }}
      pointSize={7}
      colors={{ scheme: "dark2" }}
      pointColor={{ from: nivoTheme }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      tooltip={Tooltip}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 1,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  </>
);
