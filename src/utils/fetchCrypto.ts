import axios from "axios";

/**
 * Fetches cryptocurrency price data from multiple fallback APIs
 * with proper error handling and rate limiting management
 * @returns {Promise<Array|Object>} Array of cryptocurrency data or error object
 */
export const fetchCryptoPrices = async () => {
  // Primary and fallback API endpoints
  const apiEndpoints = [
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h,7d",
    "https://api.coincap.io/v2/assets?limit=50",
    // Add more fallback APIs if needed
  ];
  
  // CoinGecko free tier has strict rate limits
  const apiRequestOptions = {
    timeout: 10000, // 10 second timeout
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  };
  
  // Try each API in sequence until one succeeds
  for (let apiIndex = 0; apiIndex < apiEndpoints.length; apiIndex++) {
    const api = apiEndpoints[apiIndex];
    
    try {
      // Track start time for performance monitoring
      const startTime = Date.now();
      
      // Make the API request
      const response = await axios.get(api, apiRequestOptions);
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      console.log(`API response time: ${responseTime}ms`);
      
      if (response.status === 200) {
        // Different APIs return different data structures, so we need to normalize
        if (api.includes('coingecko')) {
          return response.data.map(coin => ({
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
          // Normalize CoinCap API response to match our expected format
          return response.data.data.map(coin => ({
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
        
        // Add more API response normalizers as needed
      }
    } catch (error) {
      // Extract the meaningful error message
      let errorMessage = "Unknown error occurred";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 429) {
          errorMessage = "Rate limit exceeded. Please try again later.";
          console.warn(`API rate limit exceeded: ${api}`);
        } else {
          errorMessage = `Server error: ${error.response.status}`;
          console.warn(`API failed with status ${error.response.status}: ${api}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server";
        console.warn(`API timeout or no response: ${api}`);
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
        console.warn(`API request setup error: ${api}, ${error.message}`);
      }
      
      // Only return error if this is the last API in our list
      if (apiIndex === apiEndpoints.length - 1) {
        return { 
          error: "All API sources failed to load data.", 
          details: errorMessage 
        };
      }
      
      // Otherwise try the next API
      console.warn(`Trying next API source...`);
    }
  }
  
  // This should never be reached if the loop handles all cases properly
  return { error: "Failed to fetch cryptocurrency data from all sources." };
};

/**
 * Fetches detailed information for a specific cryptocurrency
 * @param {string} coinId - The ID of the cryptocurrency to fetch
 * @returns {Promise<Object>} Detailed cryptocurrency data or error object
 */
export const fetchCryptoDetails = async (coinId) => {
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
        description: coin.description?.en,
        homepage: coin.links?.homepage?.[0],
        github: coin.links?.repos_url?.github?.[0],
        reddit: coin.links?.subreddit_url,
        twitter: coin.links?.twitter_screen_name,
        market_cap_rank: coin.market_cap_rank,
        current_price: coin.market_data?.current_price?.usd,
        price_change_percentage_24h: coin.market_data?.price_change_percentage_24h,
        price_change_percentage_7d: coin.market_data?.price_change_percentage_7d,
        price_change_percentage_30d: coin.market_data?.price_change_percentage_30d,
        market_cap: coin.market_data?.market_cap?.usd,
        total_volume: coin.market_data?.total_volume?.usd,
        circulating_supply: coin.market_data?.circulating_supply,
        max_supply: coin.market_data?.max_supply,
        ath: coin.market_data?.ath?.usd,
        ath_date: coin.market_data?.ath_date?.usd,
        atl: coin.market_data?.atl?.usd,
        atl_date: coin.market_data?.atl_date?.usd,
        last_updated: coin.last_updated
      };
    }
    
    return { error: "Failed to fetch detailed cryptocurrency data" };
  } catch (error) {
    let errorMessage = "Unknown error occurred";
    
    if (error.response?.status === 429) {
      errorMessage = "Rate limit exceeded. Please try again later.";
    } else if (error.response) {
      errorMessage = `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = "No response from server";
    } else {
      errorMessage = error.message;
    }
    
    console.error(`Error fetching crypto details: ${errorMessage}`);
    return { error: errorMessage };
  }
};

/**
 * Fetches cryptocurrency price history for charts
 * @param {string} coinId - The ID of the cryptocurrency to fetch
 * @param {number} days - Number of days of history to fetch
 * @returns {Promise<Object>} Price history data or error object
 */
export const fetchCryptoPriceHistory = async (coinId, days = 7) => {
  if (!coinId) return { error: "Coin ID is required" };
  
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      { timeout: 10000 }
    );
    
    if (response.status === 200) {
      // Convert to a more usable format for charts
      return {
        prices: response.data.prices.map(point => ({
          timestamp: point[0],
          date: new Date(point[0]).toLocaleDateString(),
          price: point[1]
        })),
        market_caps: response.data.market_caps.map(point => ({
          timestamp: point[0],
          date: new Date(point[0]).toLocaleDateString(),
          value: point[1]
        })),
        total_volumes: response.data.total_volumes.map(point => ({
          timestamp: point[0],
          date: new Date(point[0]).toLocaleDateString(),
          value: point[1]
        }))
      };
    }
    
    return { error: "Failed to fetch cryptocurrency price history" };
  } catch (error) {
    console.error(`Error fetching price history: ${error.message}`);
    return { error: "Failed to fetch cryptocurrency price history" };
  }
};