"use client";
import React from "react";

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  Icon,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import axios from "axios";

// Function to fetch crypto prices with API fallback
const fetchCryptoPrices = async () => {
  const apiEndpoints = [
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1",
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
    "https://api.binance.com/api/v3/ticker/price",
  ];

  for (let api of apiEndpoints) {
    try {
      let response = await axios.get(api, {
        headers:
          api.includes("coinmarketcap") ? { "X-CMC_PRO_API_KEY": process.env.NEXT_PUBLIC_CMC_API_KEY } : {},
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.warn(`API failed: ${api}, trying next...`);
      console.error(`Error fetching data from ${api}:`, error);
    }
  }

  return { error: `All API sources failed to load data.` };
};
const CryptoTable = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchCryptoPrices();
      if (data.error) {
        setError(data.error);
      } else {
        setCoins(data);
      }
      setLoading(false);
    };

    fetchData();
    const refreshInterval = process.env.NEXT_PUBLIC_REFRESH_INTERVAL ? parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL) : 60000; // Default to 60 sec if not set
    const interval = setInterval(fetchData, refreshInterval); // Auto-refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <Box p={5} bg={useColorModeValue("white", "gray.800")} boxShadow="lg" borderRadius="lg">
      <Text fontSize="2xl" fontWeight="bold" mb={4} textAlign="center">
        Live Cryptocurrency Prices
      </Text>

      {error ? <Text color="red.500">{error}</Text> : null}

      {loading ? (
        <Flex justify="center" align="center">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Table variant="striped" colorScheme="blue">
          <Thead>
            <Tr>
              <Th>Rank</Th>
              <Th>Name</Th>
              <Th>Price (USD)</Th>
              <Th>24h Change</Th>
            </Tr>
          </Thead>
          <Tbody>
            {coins.map((coin, index) => (
              <Tr key={coin.id || index}>
                <Td>{coin.market_cap_rank || "N/A"}</Td>
                <Td>${coin.current_price?.toFixed(2) || Number(coin.price).toFixed(2)}</Td>
                <Td>${coin.current_price?.toFixed(2) || parseFloat(coin.price).toFixed(2)}</Td>
                <Td color={coin.price_change_percentage_24h < 0 ? "red.500" : "green.500"}>
                  <Flex align="center">
                    {coin.price_change_percentage_24h ? (
                      <>
                        <Icon
                          as={coin.price_change_percentage_24h > 0 ? FaArrowUp : FaArrowDown}
                          color={coin.price_change_percentage_24h > 0 ? "green.500" : "red.500"}
                          mr={2}
                        />
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </>
                    ) : (
                      "N/A"
                    )}
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};
export default function CoinsPageComponent() {
  return (
    <Box maxW="container.lg" mx="auto" p={5}>
      <CryptoTable />
    </Box>
  );
}

