import React from "react";
import { Button, useColorModeValue } from "@chakra-ui/react";

export const ActionButton = ({ text, onClick, disabled }) => {
  return (
    <Button
      w={"full"}
      mt={3}
      bg={useColorModeValue("#151f21", "gray.900")}
      color={"white"}
      rounded={"md"}
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "lg",
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </Button>
  );
};
