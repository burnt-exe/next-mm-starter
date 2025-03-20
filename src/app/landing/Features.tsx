"use client";
import { Box, SimpleGrid, Text, Heading, Icon } from "@chakra-ui/react";
import { FaChartLine, FaShieldAlt, FaMobileAlt } from "react-icons/fa";

const features = [
  { icon: FaChartLine, title: "Real-time Prices", description: "Live updates for 100+ cryptocurrencies." },
  { icon: FaShieldAlt, title: "Secure & Private", description: "Bank-level security & encryption." },
  { icon: FaMobileAlt, title: "Mobile Friendly", description: "Track crypto on the go." },
];

export default function Features() {
  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading size="xl" mb={6}>Why Choose Us?</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
        {features.map((feature, index) => (
          <Box key={index} p={6} borderWidth={1} borderRadius="lg">
            <Icon as={feature.icon} boxSize={12} color="blue.400" mb={4} />
            <Heading size="md">{feature.title}</Heading>
            <Text color="gray.600">{feature.description}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
