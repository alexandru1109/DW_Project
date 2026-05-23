import axios from 'axios';

const MODEL_URL = 'http://127.0.0.1:5000';

export const getPrediction = async (symbol: string) => {
    const response = await axios.post(`${MODEL_URL}/predict`, { symbol }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const { prediction, historical_data } = response.data;
    return { prediction, historicalData: historical_data };
};

export const shouldBuyStock = async (symbol: string) => {
    const response = await axios.post(`${MODEL_URL}/should_buy`, { symbol }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const { prediction, last_close, decision } = response.data;
    return { prediction, lastClose: last_close, decision };
};
