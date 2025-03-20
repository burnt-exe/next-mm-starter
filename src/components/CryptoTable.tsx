"use client";

import { 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Spinner, 
  Text, 
  Flex, 
  Box, 
  Icon,
  Badge,
  Image,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Skeleton,
  HStack,
  Tooltip
} from "@chakra-ui/react";
import { 
  FaArrowUp, 
  FaArrowDown, 
  FaSearch, 
  FaStar, 
  FaSort, 
  FaSortUp, 
  FaSortDown, 
  FaExclamationTriangle, 
  FaSync 
} from "react-icons/fa";
import { useEffect, useState, useCallback } from "react";
import { fetchCryptoPrices } from "../utils/fetchCrypto";

const CryptoTable = () => {
  const [coins, setCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "market_cap_rank", direction: "ascending" });
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem("cryptoFavorites");
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    }
    return [];
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const toast = useToast();

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: value > 1 ? 2 : 6
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return "N/A";
    return new Intl.NumberFormat('en-US').format(value);
  };

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const response = await fetchCryptoPrices();
      if (response.error) {
        setError(response.error);
        toast({
          title: "Error fetching data",
          description: response.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        setCoins(response);
        setLastUpdated(new Date());
        setError(null);
        if (showRefreshing) {
          toast({
            title: "Data refreshed",
            description: "Cryptocurrency data has been updated",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } catch (err) {
      setError(err.message || "Failed to fetch cryptocurrency data");
      toast({
        title: "Error",
        description: err.message || "Failed to fetch cryptocurrency data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const filtered = coins.filter(coin => 
      coin.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      coin.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    let sortedCoins = [...filtered];
    if (sortConfig.key) {
      sortedCoins.sort((a, b) => {
        // Handle null values
        if (a[sortConfig.key] === null) return 1;
        if (b[sortConfig.key] === null) return -1;
        
        if (typeof a[sortConfig.key] === 'string') {
          return sortConfig.direction === 'ascending' 
            ? a[sortConfig.key].localeCompare(b[sortConfig.key])
            : b[sortConfig.key].localeCompare(a[sortConfig.key]);
        } else {
          return sortConfig.direction === 'ascending' 
            ? a[sortConfig.key] - b[sortConfig.key]
            : b[sortConfig.key] - a[sortConfig.key];
        }
      });
    }
    
    setFilteredCoins(sortedCoins);
  }, [coins, searchQuery, sortConfig]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("cryptoFavorites", JSON.stringify(favorites));
    }
  }, [favorites]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const toggleFavorite = (coinId) => {
    setFavorites(prev => {
      if (prev.includes(coinId)) {
        return prev.filter(id => id !== coinId);
      } else {
        return [...prev, coinId];
      }
    });
  };

  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return <Icon as={FaSort} />;
    return sortConfig.direction === 'ascending' ? <Icon as={FaSortUp} /> : <Icon as={FaSortDown} />;
  };

  const handleManualRefresh = () => {
    fetchData(true);
  };

  const getChangeColor = (value) => {
    if (!value && value !== 0) return "gray.500";
    return value < 0 ? "red.500" : "green.500";
  };

  const priceTrend = (current, prev) => {
    if (!prev || current === prev) return null;
    return current > prev ? "up" : "down";
  };

  return (
    <Box p={5} bg="white" boxShadow="lg" borderRadius="lg" maxW="1200px" mx="auto">
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Live Cryptocurrency Prices
        </Text>
        <HStack>
          {lastUpdated && (
            <Tooltip label={`Last updated: ${lastUpdated.toLocaleTimeString()}`}>
              <Text fontSize="sm" color="gray.500" mr={2}>
                Updated {Math.floor((new Date() - lastUpdated) / 1000)}s ago
              </Text>
            </Tooltip>
          )}
          <Button 
            leftIcon={<Icon as={FaSync} />} 
            size="sm" 
            colorScheme="blue" 
            isLoading={isRefreshing}
            onClick={handleManualRefresh}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      <Flex mb={4} direction={{ base: "column", md: "row" }} gap={2}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search by name or symbol" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </Flex>

      {error && (
        <Flex justify="center" align="center" mb={4} p={3} bg="red.50" borderRadius="md">
          <Icon as={FaExclamationTriangle} color="red.500" mr={2} />
          <Text color="red.500">{error}</Text>
        </Flex>
      )}

      {loading ? (
        <Box>
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} height="50px" mb={2} />
          ))}
        </Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" colorScheme="gray" size="md">
            <Thead bg="gray.50">
              <Tr>
                <Th width="50px"></Th>
                <Th width="60px" cursor="pointer" onClick={() => handleSort('market_cap_rank')}>
                  <Flex align="center">
                    # {getSortIcon('market_cap_rank')}
                  </Flex>
                </Th>
                <Th cursor="pointer" onClick={() => handleSort('name')}>
                  <Flex align="center">
                    Name {getSortIcon('name')}
                  </Flex>
                </Th>
                <Th cursor="pointer" onClick={() => handleSort('current_price')}>
                  <Flex align="center">
                    Price {getSortIcon('current_price')}
                  </Flex>
                </Th>
                <Th cursor="pointer" onClick={() => handleSort('price_change_percentage_24h')}>
                  <Flex align="center">
                    24h Change {getSortIcon('price_change_percentage_24h')}
                  </Flex>
                </Th>
                <Th cursor="pointer" onClick={() => handleSort('market_cap')}>
                  <Flex align="center">
                    Market Cap {getSortIcon('market_cap')}
                  </Flex>
                </Th>
                <Th cursor="pointer" onClick={() => handleSort('total_volume')}>
                  <Flex align="center">
                    Volume (24h) {getSortIcon('total_volume')}
                  </Flex>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCoins.length > 0 ? (
                filteredCoins.map((coin) => (
                  <Tr key={coin.id} _hover={{ bg: "gray.50" }}>
                    <Td>
                      <Icon 
                        as={FaStar} 
                        color={favorites.includes(coin.id) ? "yellow.400" : "gray.200"} 
                        cursor="pointer"
                        onClick={() => toggleFavorite(coin.id)}
                      />
                    </Td>
                    <Td>{coin.market_cap_rank || "N/A"}</Td>
                    <Td>
                      <Flex align="center">
                        {coin.image && (
                          <Image src={coin.image} alt={coin.name} boxSize="24px" mr={2} />
                        )}
                        <Text fontWeight="medium">{coin.name}</Text>
                        {coin.symbol && (
                          <Badge ml={2} textTransform="uppercase" colorScheme="gray">
                            {coin.symbol}
                          </Badge>
                        )}
                      </Flex>
                    </Td>
                    <Td fontWeight="medium">
                      {formatCurrency(coin.current_price)}
                    </Td>
                    <Td color={getChangeColor(coin.price_change_percentage_24h)}>
                      <Flex align="center">
                        <Icon 
                          as={coin.price_change_percentage_24h > 0 ? FaArrowUp : FaArrowDown} 
                          mr={2} 
                          fontSize="xs"
                        />
                        {coin.price_change_percentage_24h 
                          ? `${Math.abs(coin.price_change_percentage_24h).toFixed(2)}%` 
                          : "N/A"}
                      </Flex>
                    </Td>
                    <Td>{formatCurrency(coin.market_cap)}</Td>
                    <Td>{formatCurrency(coin.total_volume)}</Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={4}>
                    No cryptocurrencies found matching "{searchQuery}"
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default CryptoTable;