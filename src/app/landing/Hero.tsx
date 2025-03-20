"use client";
import { Box, Heading, Text, Button, Image, VStack } from "@chakra-ui/react";

export default function Hero() {
  return (
    <Box textAlign="center" py={10} px={6} maxW="container.lg" mx="auto">
      <VStack spacing={6}>
        <Heading size="2xl">Welcome to CryptoEdge 🚀</Heading>
        <Text fontSize="xl" color="gray.600">
          The most powerful way to track and analyze cryptocurrencies.
        </Text>
        <Button colorScheme="blue" size="lg">Get Started</Button>
        <Image src="/assets/crypto-illustration.svg" alt="Crypto Illustration" maxW="400px" />
      </VStack>
    </Box>
  );
}
