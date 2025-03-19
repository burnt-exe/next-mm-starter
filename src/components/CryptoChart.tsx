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
