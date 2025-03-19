"use client";
import { Table, Thead, Tbody, Tr, Th, Td, Spinner, Text, Flex, Box, Icon } from "@chakra-ui/react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useEffect, useState } from "react";
import { fetchCryptoPrices } from "../utils/fetchCrypto";

const CryptoTable = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchCryptoPrices();
      if (response.error) {
        setError(response.error);
      } else {
        setCoins(response);
      }
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box p={5} bg="white" boxShadow="lg" borderRadius="lg">
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
                <Td>{coin.name || coin.symbol}</Td>
                <Td></Td>
                <Td color={coin.price_change_percentage_24h < 0 ? "red.500" : "green.500"}>
                  <Flex align="center">
                    <Icon as={coin.price_change_percentage_24h > 0 ? FaArrowUp : FaArrowDown} mr={2} />
                    {coin.price_change_percentage_24h ? `${coin.price_change_percentage_24h.toFixed(2)}%` : "N/A"}
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

export default CryptoTable;
