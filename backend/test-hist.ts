import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

async function run() {
  const queryOptions = { period1: '2024-01-01', interval: '1d' };
  const result = await yahooFinance.chart('AAPL', queryOptions);
  console.log("Chart result keys:", Object.keys(result));
  if (result.quotes) {
    console.log("First quote:", result.quotes[0]);
    console.log("Last quote:", result.quotes[result.quotes.length - 1]);
  }
}
run();
