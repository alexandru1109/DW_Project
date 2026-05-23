import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

async function run() {
  try {
    const quote = await yahooFinance.quote('AAPL');
    console.log("Quote price:", quote.regularMarketPrice);
    
    const search = await yahooFinance.search('Apple');
    console.log("Search results:", search.quotes.length);
  } catch (e) {
    console.error(e);
  }
}
run();
