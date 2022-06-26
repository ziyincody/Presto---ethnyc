import React from "react";
import {
  Flex,
  Image,
  Text,
  Alert,
  AlertIcon,
  Center,
  Box,
  useColorModeValue,
  Stack,
  Heading,
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
import { DownPaymentNFTID } from "./down_payment";

function Collateral() {
  const {
    collateralState: collateral,
    collectionState: collection,
    toApprove,
    toCollateral,
    toBorrow,
    getEstimatedValue,
    checkIsApproved,
    checkIsCollaterized,
    toWithDraw,
    toMint,
    getAddressBorrowLimitPerNft,
    getAddressBorrowAmountPerNft,
    getCurrentBalance,
    getTotalBalance,
    toRepay,
  } = useCollateralContext();

  const [mintedFloor, setMintedFloor] = React.useState(true);
  const [mintedRare, setMintedRare] = React.useState(true);
  const [showDownPayment, setShowDownPayment] = React.useState(false);
  const [mintedNFT, setMintedNFT] = React.useState([]);
  const [totalBalance, setTotalBalance] = React.useState(0);

  const [floorNftState, setFloorNftState] = React.useState({
    minted: true,
    nftId: -1,
    estimatedValue: 100,
    isApproved: false,
    isCollateralized: false,
    nftImageUrl:
      "https://ipfs.io/ipfs/Qma3Ff4HjbuFLQqCJvrqM44a9n9Uhhf33wbEk7JdtQ5zcE",
    borrowLimit: -1,
    borrowAmount: -1,
  });

  const [rareNftState, setRareNftState] = React.useState({
    minted: true,
    nftId: -1,
    estimatedValue: 100,
    isApproved: false,
    isCollateralized: false,
    nftImageUrl:
      "https://ipfs.io/ipfs/QmNo68FKR9tyGPgR1w8KfqmieUZaHdpyPYU8gzNYra6ZTm",
    borrowLimit: -1,
    borrowAmount: -1,
  });

  const [dpNftState, setDpNftState] = React.useState({
    minted: true,
    nftId: -1,
    estimatedValue: 10,
    isApproved: true,
    isCollateralized: true,
    nftImageUrl:
      "https://images.pexels.com/photos/11789773/pexels-photo-11789773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    borrowLimit: -1,
    borrowAmount: -1,
  });

  const updateState = (setStateFunc, key_vals) => {
    setStateFunc((prev) => ({
      ...prev,
      ...key_vals,
    }));
  };

  React.useEffect(() => {
    // if (collection.mintedNFTIds.length >= 2) {
    //   setMintedNFT(collection.mintedNFTIds)
    //   setMintedFloor(true)
    //   setMintedRare(true)
    //   setnftId(mintedNFT[0])
    // }
    const nftIds = [2, 4, DownPaymentNFTID];
    const stateFuncs = [setFloorNftState, setRareNftState, setDpNftState];

    if (mintedFloor && mintedRare && rareNftState.nftId != -1) {
      for (var i = 0; i < nftIds.length; i++) {
        const nftId = nftIds[i];
        let setStateFunc = stateFuncs[i];

        getAddressBorrowLimitPerNft(nftId).then((val) => {
          updateState(setStateFunc, { borrowLimit: val });
        });
        getAddressBorrowAmountPerNft(nftId).then((val) => {
          updateState(setStateFunc, { borrowAmount: val });
        });
        getEstimatedValue(nftId).then((val) => {
          updateState(setStateFunc, { estimatedValue: val });
        });
        checkIsApproved(nftId).then((val) => {
          updateState(setStateFunc, { isApproved: val });
        });
        checkIsCollaterized(nftId).then((val) => {
          updateState(setStateFunc, { isCollateralized: val });
        });
      }
      getTotalBalance().then((val) => {
        console.log(val);
        setTotalBalance(val);
      });
    }
    if (rareNftState.nftId == -1) {
      updateState(setFloorNftState, { nftId: nftIds[0] });
      updateState(setRareNftState, { nftId: nftIds[1] });
      updateState(setDpNftState, { nftId: nftIds[2] });
      getCurrentBalance();
    }
  }, [rareNftState.minted, rareNftState.nftId, collateral.loading]);

  const CollateralCardBase = ({
    nftId,
    nftImageUrl,
    nftEstimatedValue,
    isApproved,
    isCollateralized,
    borrowAmount,
    borrowLimit,
  }) => {
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
            src={nftImageUrl}
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
              Estimated Value: {nftEstimatedValue} Eth
            </Heading>
            <Text color={"gray.500"}>Updated ~2 mins ago</Text>
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
                  <Text fontWeight={600}>Collateral Ratio</Text>
                  <Text fontSize={"sm"} color={"gray.500"}>
                    30%
                  </Text>
                </Stack>
                <Stack spacing={0} align={"center"}>
                  <Text fontWeight={600}>Borrowed Amount</Text>
                  <Text fontSize={"sm"} color={"gray.500"}>
                    {borrowAmount} eth
                  </Text>
                </Stack>
              </Stack>

              <Stack direction="column" align="center">
                <Stack spacing={0} align={"center"}>
                  <Text fontWeight={600}>Total Balance in Pool</Text>
                  <Text fontSize={"sm"} color={"gray.500"}>
                    {totalBalance.toFixed(4)} Eth
                  </Text>
                </Stack>
                <Stack spacing={0} align={"center"}>
                  <Text fontWeight={600}>Borrow Limit </Text>
                  <Text fontSize={"sm"} color={"gray.500"}>
                    {nftEstimatedValue * 0.3} eth
                  </Text>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          {!isCollateralized && (
            <ActionButton
              text={isApproved ? "Approved" : "Approve"}
              onClick={() => toApprove(nftId)}
              disabled={isApproved}
            />
          )}
          {!isCollateralized && (
            <ActionButton
              text={isApproved ? "Collatalize" : "Please Approve First"}
              onClick={() => toCollateral(nftId)}
              disabled={!isApproved}
            />
          )}
          {isCollateralized && (
            <ActionButton
              text={borrowAmount > 0 ? "Please repay the loan first to withdraw": "Withdraw NFT"}
              onClick={() => toWithDraw(nftId)}
              disabled={borrowAmount > 0}
            />
          )}
          <Box p={1} />
          {isCollateralized && (
            <BorrowComponent
              borrowLimit={borrowLimit}
              totalBalance={totalBalance}
              tokenId={nftId}
            />
          )}
          <Box p={1} />
          {isCollateralized && (
            <RepayComponent borrowBalance={borrowAmount} tokenId={nftId} />
          )}
          {collateral.transaction && (
            <Alert status="success" variant="subtle">
              <AlertIcon />
              Successfully {collateral.transaction.event}
            </Alert>
          )}
        </Box>
      </Box>
    );
  };

  const BorrowComponent = ({ borrowLimit, totalBalance, tokenId }) => {
    const [sliderValue, setSliderValue] = React.useState(0);
    return (
      <>
        <Slider
          id="slider"
          defaultValue={0}
          min={0}
          max={Math.min(borrowLimit, totalBalance)}
          step={0.0001}
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
          text={totalBalance < 0.00001 ? 'No ETH available in the pool' : `Borrow ${sliderValue} ETH`}
          onClick={() => {
            toBorrow(sliderValue, tokenId);
          }}
          disabled={totalBalance < 0.00001}
        />
      </>
    );
  };

  const RepayComponent = ({ borrowBalance, tokenId }) => {
    const [sliderValue, setSliderValue] = React.useState(0);
    return (
      <>
        <Slider
          id="slider"
          defaultValue={0}
          min={0}
          max={borrowBalance}
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
          text={`Repay ${sliderValue} ETH`}
          onClick={() => {
            toRepay(sliderValue, tokenId);
          }}
          disabled={borrowBalance == 0}
        />
      </>
    );
  };

  const CollateralCardRare = () => {
    return (
      <CollateralCardBase
        nftId={rareNftState.nftId}
        nftImageUrl={rareNftState.nftImageUrl}
        nftEstimatedValue={rareNftState.estimatedValue}
        isApproved={rareNftState.isApproved}
        isCollateralized={rareNftState.isCollateralized}
        borrowAmount={rareNftState.borrowAmount}
        borrowLimit={rareNftState.borrowLimit}
      />
    );
  };

  const CollateralCard = () => {
    return (
      <CollateralCardBase
        nftId={floorNftState.nftId}
        nftImageUrl={floorNftState.nftImageUrl}
        nftEstimatedValue={floorNftState.estimatedValue}
        isApproved={floorNftState.isApproved}
        isCollateralized={floorNftState.isCollateralized}
        borrowAmount={floorNftState.borrowAmount}
        borrowLimit={floorNftState.borrowLimit}
      />
    );
  };

  const CollateralCardDownPayment = () => {
    return (
      <CollateralCardBase
        nftId={dpNftState.nftId}
        nftImageUrl={dpNftState.nftImageUrl}
        nftEstimatedValue={dpNftState.estimatedValue}
        isApproved={dpNftState.isApproved}
        isCollateralized={dpNftState.isCollateralized}
        borrowAmount={dpNftState.borrowAmount}
        borrowLimit={dpNftState.borrowLimit}
      />
    );
  };

  const MintCard = () => {
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
          <ActionButton
            text={floorNftState.minted ? "Minted" : "Mint Floor BAYC"}
            onClick={() => {
              toMint(nftId);
              updateState(setFloorNftState, { minted: true });
            }}
            disabled={floorNftState.minted}
          />
          <ActionButton
            text={rareNftState.minted ? "Minted" : "Mint Rare BAYC"}
            onClick={() => {
              toMint(nftId);
              updateState(setRareNftState, { minted: true });
            }}
            disabled={rareNftState.minted}
          />
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
      <Center py={6}>
        {collateral.loading ? (
          <Spinner />
        ) : floorNftState.minted && rareNftState.minted ? (
          <Flex flexDir={"row"}>
            <CollateralCard />
            <Box p={6}></Box>
            <CollateralCardRare />
          </Flex>
        ) : (
          <MintCard />
        )}
      </Center>
      {dpNftState.borrowAmount > 0 && <CollateralCardDownPayment />}
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
