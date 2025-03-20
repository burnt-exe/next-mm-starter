"use client";
import { Table, Thead, Tbody, Tr, Th, Td, Spinner, Text, Flex, Box, Icon } from "@chakra-ui/react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useEffect, useState } from "react";
import { fetchCryptoPrices } from "../utils/fetchCrypto";

interface Coin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

const CryptoTable = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchCryptoPrices();

      if (!Array.isArray(response)) {
        setError(response.error); // ✅ Handle error properly
      } else {
        setCoins(response);
      }
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <Box p={5} bg="white" boxShadow="lg" borderRadius="lg">
      <Text fontSize="2xl" fontWeight="bold" mb={4} textAlign="center">
        Live Cryptocurrency Prices
      </Text>

      {error && <Text color="red.500">{error}</Text>}

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
              <Th>Symbol</Th>
              <Th>Price (USD)</Th>
              <Th>24h Change</Th>
              <Th>Volume</Th>
            </Tr>
          </Thead>
          <Tbody>
            {coins.map((coin) => (
              <Tr key={coin.id}>
                <Td>{coin.market_cap_rank || "N/A"}</Td>
                <Td>{coin.name}</Td>
                <Td>{coin.symbol.toUpperCase()}</Td>
                <Td>${coin.current_price.toFixed(2)}</Td>
                <Td color={coin.price_change_percentage_24h < 0 ? "red.500" : "green.500"}>
                  <Flex align="center">
                    <Icon as={coin.price_change_percentage_24h > 0 ? FaArrowUp : FaArrowDown} mr={2} />
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </Flex>
                </Td>
                <Td>${coin.total_volume.toLocaleString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default CryptoTable;
