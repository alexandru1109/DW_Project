import axios from 'axios';

class AlphaVantageService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || '';
  }

  async getStockData(symbol: string) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.apiKey}`;
    const response = await axios.get(url);
    return response.data;
  }

  async getStockIndicators(symbol: string) {
    const url = `https://www.alphavantage.co/query?function=TECHNICAL_INDICATOR&symbol=${symbol}&apikey=${this.apiKey}`;
    const response = await axios.get(url);
    return response.data;
  }
}

export default new AlphaVantageService();
