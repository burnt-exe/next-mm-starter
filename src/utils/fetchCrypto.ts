import axios from "axios";

/**
 * Type definition for API response handling
 */
type APIResponse = {
  success: boolean;
  data?: any; // ✅ `data` is optional
  error?: string;
};

/**
 * Fetches cryptocurrency prices from multiple sources.
 * - Queries all APIs in parallel.
 * - Returns the first successful response.
 * - Uses a 5-second timeout per request.
 */
export const fetchCryptoPrices = async () => {
  const apiEndpoints = [
    {
      url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1",
      headers: {},
    },
    {
      url: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
      headers: { "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY || "" }, // Uses env variable for security
    },
    {
      url: "https://api.binance.com/api/v3/ticker/price",
      headers: {},
    },
  ];

  // ✅ Fetch all API responses in parallel
  const fetchPromises: Promise<APIResponse>[] = apiEndpoints.map(api =>
    axios
      .get(api.url, { headers: api.headers, timeout: 5000 }) // ⏳ 5s timeout
      .then(response => ({ success: true, data: response.data }))
      .catch(error => ({ success: false, error: (error as Error).message })) // ✅ Type-safe error handling
  );

  // ✅ Wait for all requests to complete
  const results = await Promise.allSettled(fetchPromises);

  // ✅ Return the first successful response
  for (const result of results) {
    if (result.status === "fulfilled" && result.value.success && result.value.data) {
      return result.value.data;
    }
  }

  return { error: "❌ All API sources failed to load data." };
};
