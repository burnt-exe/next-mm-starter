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
      console.warn(`API failed: ${api}, trying next...`);  // ✅ Fixed string interpolation
    }
  }

  return { error: "All API sources failed to load data." };
};
