# Define the base directory (src/)
$baseDir = Get-Location

# Define directories to create
$dirs = @(
    "app/coins",
    "components",
    "hooks",
    "pages/api",
    "styles",
    "utils"
)

# Create directories if they don't exist
foreach ($dir in $dirs) {
    $fullPath = Join-Path $baseDir $dir
    if (!(Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath | Out-Null
    }
}

# Define file content for each component
$files = @(
    @{ Path = "app/coins/page.tsx"; Content = @"
"use client";
import { Box } from "@chakra-ui/react";
import CryptoTable from "../../components/CryptoTable";
import CryptoChart from "../../components/CryptoChart";

export default function CoinsPage() {
  return (
    <Box maxW="container.lg" mx="auto" p={5}>
      <CryptoTable />
      <CryptoChart />
    </Box>
  );
}
"@ },

    @{ Path = "components/CryptoTable.tsx"; Content = @"
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
                <Td>${coin.current_price?.toFixed(2) || parseFloat(coin.price).toFixed(2)}</Td>
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
"@ },

    @{ Path = "components/CryptoChart.tsx"; Content = @"
"use client";
import dynamic from "next/dynamic";
import { Box, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CryptoChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd")
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <Box>
      <Heading size="md">Market Trends</Heading>
      <Chart
        options={{ chart: { type: "line" }, xaxis: { categories: data.map(coin => coin.name) } }}
        series={[{ name: "Price", data: data.map(coin => coin.current_price) }]}
        type="line"
        width="100%"
      />
    </Box>
  );
};

export default CryptoChart;
"@ },

    @{ Path = "utils/fetchCrypto.ts"; Content = @"
import axios from "axios";

export const fetchCryptoPrices = async () => {
  const apiEndpoints = [
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1",
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
    "https://api.binance.com/api/v3/ticker/price",
  ];

  for (let api of apiEndpoints) {
    try {
      let response = await axios.get(api, {
        headers: api.includes("coinmarketcap") ? { "X-CMC_PRO_API_KEY": "your_api_key" } : {},
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.warn(`API failed: ${api}, trying next...`);
    }
  }

  return { error: "All API sources failed to load data." };
};
"@ }
)

# Create files and write content
foreach ($file in $files) {
    $filePath = Join-Path $baseDir $file.Path
    if (!(Test-Path $filePath)) {
        $fileContent = $file.Content
        Set-Content -Path $filePath -Value $fileContent -Force
    }
}

Write-Host "✅ Crypto Dashboard Setup Complete! Run 'yarn dev' to start the project." -ForegroundColor Green
