"use client";
import { Box, Text, VStack, Icon, Spinner, useColorMode, Flex } from "@chakra-ui/react";
import { FaHeartbeat } from "react-icons/fa";
import { useEffect, useState } from "react";

/**
 * Styled Status Page (Horizon UI)
 * - Fetches API health status from `/api/health`
 */
const StatusPage = () => {
  const { colorMode } = useColorMode();
  const [status, setStatus] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        setStatus(data.status);
        setTimestamp(new Date(data.timestamp).toLocaleString());
      } catch (error) {
        setStatus("❌ Server is down");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      maxW="container.md"
      mx="auto"
      mt={10}
      p={6}
      borderRadius="lg"
      boxShadow="lg"
      bg={colorMode === "dark" ? "gray.700" : "white"}
      textAlign="center"
    >
      <VStack spacing={4}>
        <Icon as={FaHeartbeat} boxSize={12} color={status?.includes("✅") ? "green.400" : "red.400"} />
        <Text fontSize="2xl" fontWeight="bold">
          {loading ? "Checking Server..." : status}
        </Text>
        <Flex align="center" justify="center">
          <Text fontSize="lg" color="gray.500" mr={2}>
            Last Checked: {timestamp}
          </Text>
          {loading && <Spinner size="sm" />}
        </Flex>
      </VStack>
    </Box>
  );
};

export default StatusPage;
