import React, { useState } from "react";
import {
  Flex,
  Image,
  Button,
  Text,
  Box,
  useColorModeValue,
  Stack,
  Heading,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  Spinner,
} from "@chakra-ui/react";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
Chart.register(CategoryScale);
import { format } from "date-fns";

import { NavigationBar } from "../containers/navigation";
import { ActionButton } from "../components/ActionButton";
import {
  CollateralContextProviderWrapper,
  useCollateralContext,
} from "../context/collateral";
import { ethers } from "ethers";
import { Line } from "react-chartjs-2";

export const DownPaymentNFTID = 19;

const DownPayment = () => {
  const NFTListingPrice = 0.005;
  const {
    collateralState: collateral,
    downPayment,
    getCurrentBalance,
    getTotalBalance,
    getAddressBorrowAmountPerNft,
  } = useCollateralContext();

  const [currentEthBalance, setCurrentEthBalance] = React.useState(0.25);
  const [maxiumLoan, setMaximumLoan] = useState(NFTListingPrice * 0.3);
  const [totalBalance, setTotalBalance] = React.useState(0);
  const [isPurchased, setIsPurchased] = React.useState(false);

  const [floorStats, setFloorStats] = React.useState([]);
  const [floorStatsTimestamp, setFloorStatsTimestamp] = React.useState([]);
  const [lrfloorStats, setlrFloorStats] = React.useState([]);
  const [tokenFloor, setTokenFloor] = React.useState([]);

  React.useEffect(() => {
    fetchBoredApeStats();
  }, [collateral.loading]);

  const fetchBoredApeStats = () => {
    const options = {
      method: "GET",
      headers: { Accept: "*/*", "x-api-key": "demo-api-key" },
    };

    fetch(
      "https://api.reservoir.tools/events/collections/floor-ask/v1?collection=0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d&startTimestamp=1624723264&sortDirection=asc&limit=1000",
      options
    )
      .then((response) => response.json())
      .then((response) => parseResponse(response))
      .catch((err) => console.error(err));

    fetch(
      "https://api.reservoir.tools/events/tokens/floor-ask/v2?token=0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d%3A100&sortDirection=desc&limit=1000",
      options
    )
      .then((response) => response.json())
      .then((response) => parseTokenFloor(response))
      .catch((err) => console.error(err));
  };

  const parseTokenFloor = (response) => {
    const tokenFloor = [];

    for (var i = 0; i < response.events.length; i++) {
      let event = response.events[i].event;
      tokenFloor.push(event.previousPrice);
    }

    setTokenFloor(tokenFloor);
  };

  const parseResponse = (response) => {
    let floorStats = [];
    let floorStatsTimestamp = [];
    let lrfloorStats = [];
    let lrfloorStatsTimestamp = [];

    for (var i = 0; i < response.events.length; i++) {
      let event = response.events[i];
      let floorAsk = event.floorAsk;
      let eventStats = event.event;
      if (floorAsk.source === "OpenSea") {
        floorStats.push(floorAsk.price);
        floorStatsTimestamp.push(
          format(new Date(eventStats.createdAt), "yyyy/MM/dd")
        );
      } else if (floorAsk.source === "LooksRare") {
        lrfloorStats.push(floorAsk.price);
        lrfloorStatsTimestamp.push(
          format(new Date(eventStats.createdAt), "yyyy/MM/dd")
        );
      }
    }

    console.log(lrfloorStats);
    console.log(lrfloorStatsTimestamp);

    setFloorStats(floorStats);
    setFloorStatsTimestamp(floorStatsTimestamp);
    setlrFloorStats(lrfloorStats);
    setlrFloorStatsTimestamp(lrfloorStatsTimestamp);
  };

  const data = {
    labels: floorStatsTimestamp,
    datasets: [
      {
        label: "BAYC historical floor (OS)",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: floorStats,
      },
      {
        label: "BAYC historical floor (LR)",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(75,100,192,0.4)",
        borderColor: "rgba(75,100,192,1)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgba(75,100,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,100,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: lrfloorStats,
      },
    ],
  };

  const individualToken = {
    labels: floorStatsTimestamp,
    datasets: [
      {
        label: "BAYC historical floor (token 100)",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(75,100,100,0.4)",
        borderColor: "rgba(75,100,192,1)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgba(75,100,100,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,100,100,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: tokenFloor,
      },
    ],
  };

  return (
    <Flex
      height="100vh"
      flexDir={"column"}
      maxWidth={["100%", null, "640px"]}
      margin="auto"
    >
      <NavigationBar />
      <Flex justifyContent="center" m="auto" flexDir={"column"}>
        <Line data={data} width={600} height={600} />
      </Flex>
      <Flex justifyContent="center" m="auto" flexDir={"column"}>
        <Line data={individualToken} width={600} height={600} />
      </Flex>
    </Flex>
  );
};
export default function MintWrapper() {
  return (
    <CollateralContextProviderWrapper>
      <DownPayment />
    </CollateralContextProviderWrapper>
  );
}
