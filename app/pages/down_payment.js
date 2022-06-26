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

import { NavigationBar } from "../containers/navigation";
import { ActionButton } from "../components/ActionButton";
import {
  CollateralContextProviderWrapper,
  useCollateralContext,
} from "../context/collateral";
import { ethers } from "ethers";

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

  React.useEffect(() => {
    getCurrentBalance().then((val) => {
      setCurrentEthBalance(val.toFixed(4));
    });
    getTotalBalance().then((val) => {
      setTotalBalance(val);
    });
    getAddressBorrowAmountPerNft(DownPaymentNFTID).then((val) => {
      console.log(val);
      if (val > 0) {
        setIsPurchased(true);
      }
    });
  }, [collateral.loading]);

  function SliderThumbWithTooltip() {
    const [sliderValue, setSliderValue] = React.useState(0);

    return (
      <>
        <Slider
          id="slider"
          defaultValue={0}
          min={0}
          max={Math.min(maxiumLoan, totalBalance)}
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
          text={`Purchase and borrow ${sliderValue} eth`}
          onClick={() =>
            downPayment(
              ethers.BigNumber.from(`${NFTListingPrice * 10 ** 18}`),
              ethers.BigNumber.from(`${sliderValue * 10 ** 18}`),
              ethers.BigNumber.from(
                `${(NFTListingPrice - sliderValue) * 10 ** 18}`
              ),
              DownPaymentNFTID
            )
          }
        />
      </>
    );
  }

  const ListingCard = () => {
    return (
      <Box
        maxW={"400px"}
        w={"full"}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"2xl"}
        rounded={"md"}
        overflow={"hidden"}
      >
        <Flex justify={"center"} flexDir="column">
          <Box p={6} />
          <Image
            src={
              "https://images.pexels.com/photos/11789773/pexels-photo-11789773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            }
            width={["90%", null, "auto"]}
            margin="auto"
            mb={[2, null, 5]}
            borderRadius="2xl"
            height={32}
          />
        </Flex>

        <Box p={6}>
          <Stack spacing={0} align={"center"} mb={5}>
            <Heading fontSize={"2xl"} fontWeight={500} fontFamily={"body"}>
              Price: {NFTListingPrice} Eth
            </Heading>
          </Stack>

          <Stack drection="column" alignItems="center">
            <Stack
              direction={"row"}
              justify={"center"}
              spacing={6}
              width={"100%"}
            >
              <Stack direction="column" align="center">
                <Stack spacing={0} align={"center"}>
                  <Text fontWeight={600}>Current Eth Balance</Text>
                  <Text fontSize={"sm"} color={"gray.500"}>
                    {currentEthBalance} Eth
                  </Text>
                </Stack>
                <Stack spacing={0} align={"center"}>
                  <Text fontWeight={600}>Total Balance in Pool</Text>
                  <Text fontSize={"sm"} color={"gray.500"}>
                    {totalBalance} Eth
                  </Text>
                </Stack>
              </Stack>

              <Stack direction="column" align="center">
                <Stack spacing={0} align={"center"}>
                  <Text fontWeight={600}>Maximum Loan </Text>
                  <Text fontSize={"sm"} color={"gray.500"}>
                    {maxiumLoan} Eth
                  </Text>
                </Stack>

                <Stack spacing={0} align={"center"}>
                  <Text fontWeight={600}>Borrow Limit </Text>
                  <Text fontSize={"sm"} color={"gray.500"}>
                    {Math.min(maxiumLoan, totalBalance)} eth
                  </Text>
                </Stack>
              </Stack>
            </Stack>
            <Box p={4}></Box>
          </Stack>
          <SliderThumbWithTooltip />
        </Box>
      </Box>
    );
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
        {collateral.loading ? (
          <Spinner />
        ) : isPurchased ? (
          <Text>Purchased</Text>
        ) : (
          <ListingCard />
        )}
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
