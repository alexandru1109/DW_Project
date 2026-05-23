import { Request, Response } from 'express';
import axios from 'axios';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';
const NEWS_API_KEY = process.env.NEWS_API_KEY;

interface NewsAPIArticle {
    title: string;
    description: string;
    url: string;
    urlToImage?: string; 
    source: {
      name: string;
    };
    publishedAt: string;
}

const topSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NFLX', 'NVDA', 'BABA', 'DIS'];

const getTopStocks = async (count: number): Promise<string[]> => {
    return topSymbols.slice(0, count);
};

const fetchStockData = async (symbols: string[]): Promise<any[]> => {
    const stockPromises = symbols.map(async (symbol) => {
        try {
            const data = await yahooFinance.quote(symbol);
            return {
                symbol: symbol,
                currentPrice: data.regularMarketPrice || 0,
                highPrice: data.regularMarketDayHigh || 0,
                lowPrice: data.regularMarketDayLow || 0,
                openPrice: data.regularMarketOpen || 0,
                previousClosePrice: data.regularMarketPreviousClose || 0
            };
        } catch (error) {
            console.error(`Error fetching data for symbol ${symbol}:`, error);
            return null;
        }
    });

    const stockResponses = await Promise.all(stockPromises);
    return stockResponses.filter(stock => stock !== null);
};

export const getMarketSummary = async (req: Request, res: Response) => {
    try {
        const stockSymbols = await getTopStocks(3); 
        const stocks = await fetchStockData(stockSymbols);
        res.status(200).json({ stocks });
    } catch (error) {
        console.error('Error fetching market summary:', error);
        res.status(500).json({ message: 'Error fetching market summary', error: String(error) });
    }
};

export const getMarketSummary10 = async (req: Request, res: Response) => {
    try {
        const stockSymbols = await getTopStocks(10); 
        const stocks = await fetchStockData(stockSymbols);
        res.status(200).json({ stocks });
    } catch (error) {
        console.error('Error fetching market summary:', error);
        res.status(500).json({ message: 'Error fetching market summary', error: String(error) });
    }
};

export const getMarketNews = async (req: Request, res: Response) => {
    if (!NEWS_API_KEY) {
        return res.status(500).json({ message: 'News API key is not set' });
    }

    try {
        const newsResponse = await axios.get(`${NEWS_API_URL}?category=business&language=en&apiKey=${NEWS_API_KEY}`);
        const articles: NewsAPIArticle[] = newsResponse.data.articles;

        const news = articles.map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            urlToImage: article.urlToImage || "https://via.placeholder.com/300x150",
            source: article.source,
            publishedAt: article.publishedAt,
        }));

        res.status(200).json({ news });
    } catch (error) {
        console.error('Error fetching market news:', error);
        res.status(500).json({ message: 'Error fetching market news', error });
    }
};

export const getStockLogo = async (req: Request, res: Response) => {
    const { symbol } = req.params;

    if (!symbol) {
        return res.status(400).json({ message: 'Stock symbol is required' });
    }

    try {
        // Fallback logo generation as yahoo finance doesn't easily provide logos
        const logoUrl = `https://companiesmarketcap.com/img/company-logos/64/${symbol.toUpperCase()}.webp`;
        // To verify it exists we could do a HEAD request or just return it. 
        // For simplicity and speed, we will just return the constructed URL.
        // It might not work for all, so frontend should handle img error.
        res.status(200).json({ logo: logoUrl });
    } catch (error) {
        console.error(`Error fetching logo for symbol ${symbol}:`, error);
        res.status(500).json({ message: 'Error fetching stock logo', error: String(error) });
    }
};

export const getCurrentStockPrice = async (req: Request, res: Response) => {
    const { symbol } = req.params;

    if (!symbol) {
        return res.status(400).json({ message: 'Stock symbol is required' });
    }

    try {
        const data = await yahooFinance.quote(symbol);

        if (!data || typeof data.regularMarketPrice !== 'number') {
            return res.status(404).json({ message: `Current price not found for symbol: ${symbol}` });
        }

        res.status(200).json({ 
            symbol, 
            currentPrice: data.regularMarketPrice,
            marketState: data.marketState, // e.g., REGULAR, CLOSED, PRE, POST
            fullExchangeName: data.fullExchangeName,
            exchangeTimezoneName: data.exchangeTimezoneName
        });
    } catch (error) {
        console.error(`Error fetching current price for symbol ${symbol}:`, error);
        res.status(500).json({ message: 'Error fetching current stock price', error: String(error) });
    }
};

export const searchSymbols = async (req: Request, res: Response) => {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'Search query is required' });
    }

    try {
        const searchResults = await yahooFinance.search(query);
        const validQuotes = searchResults.quotes.filter(q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF');
        
        const formattedResults = validQuotes.slice(0, 10).map(q => ({
            symbol: q.symbol,
            shortname: q.shortname,
            longname: q.longname,
            exchange: q.exchange,
            type: q.quoteType
        }));

        res.status(200).json({ results: formattedResults });
    } catch (error) {
        console.error(`Error searching for query ${query}:`, error);
        res.status(500).json({ message: 'Error searching symbols', error: String(error) });
    }
};

export const getStockHistory = async (req: Request, res: Response) => {
    const { symbol } = req.params;
    const { range } = req.query; // e.g., 1d, 5d, 1mo, 6mo, 1y, 5y, max

    if (!symbol) {
        return res.status(400).json({ message: 'Stock symbol is required' });
    }

    try {
        let interval: "1m" | "5m" | "15m" | "1h" | "1d" | "1wk" | "1mo" = '1d';
        let period1: string | Date = new Date();

        switch (range) {
            case '1d':
                interval = '5m';
                period1 = new Date(Date.now() - 24 * 60 * 60 * 1000);
                break;
            case '5d':
                interval = '15m';
                period1 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
                break;
            case '1mo':
                interval = '1h';
                period1 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '6mo':
                interval = '1d';
                period1 = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                interval = '1d';
                period1 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                interval = '1d';
                period1 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        }

        const result = await yahooFinance.chart(symbol, {
            period1,
            interval,
        });

        const history = result.quotes.map(q => ({
            date: q.date,
            price: q.close || q.adjclose || 0
        })).filter(q => q.price !== 0);

        res.status(200).json({ symbol, history });
    } catch (error) {
        console.error(`Error fetching history for symbol ${symbol}:`, error);
        res.status(500).json({ message: 'Error fetching stock history', error: String(error) });
    }
};

