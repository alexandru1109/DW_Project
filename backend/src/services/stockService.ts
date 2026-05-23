import Market from '../models/stockModel';
import alphaVantageService from '../alphaVantageService';

class StockService {
  async getStockData(symbol: string) {
    let stock = await Market.findOne({ symbol });
    if (!stock) {
      const apiData = await alphaVantageService.getStockData(symbol);
      const indicators = await alphaVantageService.getStockIndicators(symbol);
      
      const newStockData = {
        symbol: symbol,
        history: apiData['Time Series (Daily)'], 
        indicators: indicators,
      };

      stock = new Market(newStockData);
      await stock.save();
    }
    return stock;
  }

  async updateStockData(symbol: string, data: any) {
    const stock = await Market.findOneAndUpdate({ symbol }, data, { new: true });
    if (!stock) {
      throw new Error('Stock not found');
    }
    return stock;
  }

  async createStockData(data: any) {
    const stock = new Market(data);
    await stock.save();
    return stock;
  }
}

export default new StockService();
