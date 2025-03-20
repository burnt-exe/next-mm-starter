"use client";
import { Box, Text, Heading, Button, VStack } from "@chakra-ui/react";

export default function CTA() {
  return (
    <Box textAlign="center" py={10} px={6} bg="blue.500" color="white">
      <VStack spacing={6}>
        <Heading size="lg">Join 10,000+ Crypto Enthusiasts</Heading>
        <Text fontSize="lg">Start tracking your portfolio today.</Text>
        <Button colorScheme="blackAlpha" size="lg">Get Started</Button>
      </VStack>
    </Box>
  );
}
