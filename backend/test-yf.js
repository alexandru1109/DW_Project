const yahooFinance = require('yahoo-finance2').default;

async function run() {
  try {
    const quote = await yahooFinance.quote('AAPL');
    console.log("Quote:", { price: quote.regularMarketPrice });
    
    const search = await yahooFinance.search('Apple');
    console.log("Search:", search.quotes.slice(0, 2));

  } catch (e) {
    console.error(e);
  }
}
run();
