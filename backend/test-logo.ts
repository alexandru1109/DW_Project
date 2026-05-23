import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

async function run() {
  const quote = await yahooFinance.quote('AAPL');
  console.log(Object.keys(quote));
  const search = await yahooFinance.search('AAPL');
  console.log("Search keys:", search.quotes.length > 0 ? Object.keys(search.quotes[0]) : []);
}
run();
