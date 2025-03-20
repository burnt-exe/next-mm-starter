import axios from "axios";

/**
 * Defines the structure for cryptocurrency data
 */
interface Coin {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  market_cap_rank: number;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  market_cap: number;
  total_volume: number;
  circulating_supply?: number;
  max_supply?: number;
  ath?: number;
  ath_change_percentage?: number;
  last_updated?: string;
}

/**
 * Fetches cryptocurrency price data from multiple fallback APIs
 * with proper error handling and rate limiting management.
 * @returns {Promise<Coin[] | { error: string }>}
 */
export const fetchCryptoPrices = async (): Promise<Coin[] | { error: string }> => {
  const apiEndpoints = [
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h,7d",
    "https://api.coincap.io/v2/assets?limit=50",
  ];

  const apiRequestOptions = {
    timeout: 10000, // 10-second timeout
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  };

  for (const api of apiEndpoints) {
    try {
      const response = await axios.get(api, apiRequestOptions);

      if (response.status === 200) {
        // Normalize API responses
        if (api.includes('coingecko')) {
          return response.data.map((coin: any): Coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            image: coin.image,
            market_cap_rank: coin.market_cap_rank,
            current_price: coin.current_price,
            price_change_percentage_24h: coin.price_change_percentage_24h,
            price_change_percentage_7d: coin.price_change_percentage_7d_in_currency,
            market_cap: coin.market_cap,
            total_volume: coin.total_volume,
            circulating_supply: coin.circulating_supply,
            max_supply: coin.max_supply,
            ath: coin.ath,
            ath_change_percentage: coin.ath_change_percentage,
            last_updated: coin.last_updated
          }));
        } else if (api.includes('coincap')) {
          return response.data.data.map((coin: any): Coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            image: `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`,
            market_cap_rank: parseInt(coin.rank),
            current_price: parseFloat(coin.priceUsd),
            price_change_percentage_24h: parseFloat(coin.changePercent24Hr),
            market_cap: parseFloat(coin.marketCapUsd),
            total_volume: parseFloat(coin.volumeUsd24Hr),
            circulating_supply: parseFloat(coin.supply),
            max_supply: parseFloat(coin.maxSupply),
            last_updated: new Date().toISOString()
          }));
        }
      }
    } catch (error: any) {
      console.warn(`API failed: ${api}, trying next... | Error: ${error.message}`);
    }
  }

  return { error: "All API sources failed to load data." };
};

/**
 * Fetches detailed information for a specific cryptocurrency
 * @param {string} coinId - The ID of the cryptocurrency to fetch
 * @returns {Promise<Object>} Detailed cryptocurrency data or error object
 */
export const fetchCryptoDetails = async (coinId: string): Promise<Coin | { error: string }> => {
  if (!coinId) return { error: "Coin ID is required" };

  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
      { timeout: 10000 }
    );

    if (response.status === 200) {
      const coin = response.data;
      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image?.large,
        market_cap_rank: coin.market_cap_rank,
        current_price: coin.market_data?.current_price?.usd,
        price_change_percentage_24h: coin.market_data?.price_change_percentage_24h,
        price_change_percentage_7d: coin.market_data?.price_change_percentage_7d,
        market_cap: coin.market_data?.market_cap?.usd,
        total_volume: coin.market_data?.total_volume?.usd,
        circulating_supply: coin.market_data?.circulating_supply,
        max_supply: coin.market_data?.max_supply,
        ath: coin.market_data?.ath?.usd,
        ath_change_percentage: coin.market_data?.ath_change_percentage?.usd,
        last_updated: coin.last_updated
      };
    }

    return { error: "Failed to fetch detailed cryptocurrency data" };
  } catch (error: any) {
    console.error(`Error fetching crypto details: ${error.message}`);
    return { error: error.message };
  }
};

/**
 * Fetches cryptocurrency price history for charts
 * @param {string} coinId - The ID of the cryptocurrency to fetch
 * @param {number} days - Number of days of history to fetch
 * @returns {Promise<Object>} Price history data or error object
 */
export const fetchCryptoPriceHistory = async (coinId: string, days: number = 7): Promise<Object | { error: string }> => {
  if (!coinId) return { error: "Coin ID is required" };

  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      { timeout: 10000 }
    );

    if (response.status === 200) {
      return {
        prices: response.data.prices.map((point: [number, number]) => ({
          timestamp: point[0],
          date: new Date(point[0]).toLocaleDateString(),
          price: point[1]
        })),
        market_caps: response.data.market_caps.map((point: [number, number]) => ({
          timestamp: point[0],
          date: new Date(point[0]).toLocaleDateString(),
          value: point[1]
        })),
        total_volumes: response.data.total_volumes.map((point: [number, number]) => ({
          timestamp: point[0],
          date: new Date(point[0]).toLocaleDateString(),
          value: point[1]
        }))
      };
    }

    return { error: "Failed to fetch cryptocurrency price history" };
  } catch (error: any) {
    console.error(`Error fetching price history: ${error.message}`);
    return { error: "Failed to fetch cryptocurrency price history" };
  }
};
