"use client";
import { Flex, Spacer, Button, Heading } from "@chakra-ui/react";

export default function Navbar() {
  return (
    <Flex as="nav" p={4} boxShadow="md">
      <Heading size="md">CryptoEdge</Heading>
      <Spacer />
      <Button colorScheme="blue">Sign Up</Button>
    </Flex>
  );
}
