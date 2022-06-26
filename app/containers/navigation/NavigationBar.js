import React from "react";
import { ethers } from "ethers";

import { Flex, Button, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { useWalletContext } from "../../context/wallet";

const NavigationLink = ({ active, disabled, children, onClick, id }) => {
  return (
    <Button
      disabled={disabled}
      variant={"link"}
      onClick={() => onClick(id)}
      color={active ? "blue.500" : "gray.500"}
    >
      {children}
    </Button>
  );
};
/**
 * The Top Navigation Bar Menu
 */
export const NavigationBar = () => {
  const { currentAddress } = useWalletContext();
  const router = useRouter();
  const { pathname } = router;

  React.useEffect(() => {}, [currentAddress]);

  const onClick = (id) => {
    router.push(`/${id}`);
  };
  return (
    <Flex justifyContent="space-around" padding={4}>
      <NavigationLink active={pathname === "/"} id="" onClick={onClick}>
        Connect
      </NavigationLink>
      <NavigationLink
        active={pathname === "/collateral"}
        disabled={false}
        id="collateral"
        onClick={onClick}
      >
        Collateral
      </NavigationLink>
      <NavigationLink
        active={pathname === "/lend_eth"}
        disabled={false}
        id="lend_eth"
        onClick={onClick}
      >
        Lend Eth
      </NavigationLink>
      <NavigationLink
        active={pathname === "/down_payment"}
        disabled={false}
        id="down_payment"
        onClick={onClick}
      >
        Down Payment
      </NavigationLink>
    </Flex>
  );
};
