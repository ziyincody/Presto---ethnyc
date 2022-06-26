import React from "react";
import {
  Flex,
  Center,
  Box,
  useColorModeValue,
  Spinner,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  Tooltip,
  SliderThumb,
} from "@chakra-ui/react";
import { NavigationBar } from "../containers/navigation";
import {
  CollateralContextProviderWrapper,
  useCollateralContext,
} from "../context/collateral";
import { ActionButton } from "../components/ActionButton";

function Collateral() {
  const {
    collateralState: collateral,
    toLend,
    getCurrentBalance,
    getTotalBalance,
    toWithdrawEth
  } = useCollateralContext();
  const [currentEthBalance, setCurrentEthBalance] = React.useState(0.25);
  const [totalBalance, setTotalBalance] = React.useState(0);

  React.useEffect(() => {
    getCurrentBalance().then((val) => {
      setCurrentEthBalance(val.toFixed(4));
    });

    getTotalBalance().then((val) => {
      setTotalBalance(val)
    })
  }, [collateral.loading]);

  function LendComponent() {
    const [sliderValue, setSliderValue] = React.useState(0);

    return (
      <>
        <Slider
          id="slider"
          defaultValue={0}
          min={0}
          max={currentEthBalance}
          step={0.001}
          colorScheme="teal"
          onChange={(v) => setSliderValue(v)}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <Tooltip
            hasArrow
            bg="teal.500"
            color="white"
            placement="top"
            label={`${sliderValue}`}
          >
            <SliderThumb />
          </Tooltip>
        </Slider>
        <ActionButton
          text={`Lend ${sliderValue} ETH`}
          onClick={() => {
            toLend(sliderValue);
          }}
          disabled={false}
        />
      </>
    );
  }

  function WithDrawComponent() {
    const [sliderValue, setSliderValue] = React.useState(0);

    return (
      <>
        <Slider
          id="slider"
          defaultValue={0}
          min={0}
          max={totalBalance}
          step={0.001}
          colorScheme="teal"
          onChange={(v) => setSliderValue(v)}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <Tooltip
            hasArrow
            bg="teal.500"
            color="white"
            placement="top"
            label={`${sliderValue}`}
          >
            <SliderThumb />
          </Tooltip>
        </Slider>
        <ActionButton
          text={`Withdraw ${sliderValue} ETH`}
          onClick={() => {
            toWithdrawEth(sliderValue);
          }}
          disabled={false}
        />
      </>
    );
  }

  const LendCard = () => {
    return (
      <Box
        maxW={"400px"}
        w={"full"}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"2xl"}
        rounded={"md"}
        overflow={"hidden"}
      >
        <Box p={6}>
          <LendComponent />
          <Box p={6} />
          <WithDrawComponent />
        </Box>
      </Box>
    );
  };

  return (
    <Flex
      height="100%"
      flexDir={"column"}
      maxWidth={["100%", null, "800px"]}
      margin="auto"
    >
      <NavigationBar />
      <Center py={6}>{collateral.loading ? <Spinner /> : <LendCard />}</Center>
    </Flex>
  );
}

export default function AppWrapper() {
  return (
    <CollateralContextProviderWrapper>
      <Collateral />
    </CollateralContextProviderWrapper>
  );
}
