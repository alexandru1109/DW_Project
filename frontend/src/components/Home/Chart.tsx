import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './Chart.css';

interface ProcessedData {
    symbol: string;
    labels: string[];
    totalInvested: number[];
    averagePrice: number[];
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const Chart = () => {
    const [processedData, setProcessedData] = useState<ProcessedData[]>([]);
    const [mode, setMode] = useState<string>('week');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchGraphData = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Authorization token is missing.');
                setIsLoading(false);
                return;
            }

            const response = await axios.get(`http://localhost:5869/api/portfolio/portfolio-graph`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { mode },
            });

            console.log('Graph Data Response:', response.data);

            // Transform API response to match the data structure for the charts
            const transformedData: ProcessedData[] = response.data.map((item: any) => ({
                symbol: item.symbol,
                labels: item.data.totalInvested.map((_: number, index: number) => `Day ${index + 1}`),
                totalInvested: item.data.totalInvested,
                averagePrice: item.data.avgPrice,
            }));

            setProcessedData(transformedData);
            setError(null);
        } catch (error: any) {
            console.error('Error fetching graph data:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'Failed to fetch graph data.');
        } finally {
            setIsLoading(false);
        }
    }, [mode]);

    useEffect(() => {
        fetchGraphData();
    }, [fetchGraphData]);

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h1>Portfolio Graphs</h1>
                <div className="chart-buttons">
                    <button
                        className={mode === 'week' ? 'active' : ''}
                        onClick={() => setMode('week')}
                    >
                        Week
                    </button>
                    <button
                        className={mode === 'month' ? 'active' : ''}
                        onClick={() => setMode('month')}
                    >
                        Month
                    </button>
                    <button
                        className={mode === 'year' ? 'active' : ''}
                        onClick={() => setMode('year')}
                    >
                        Year
                    </button>
                </div>

                <div className="chart-legend">
                    <span className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#358ef3' }}></span>
                        Total Invested
                    </span>
                    <span className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#90abcb' }}></span>
                        Average Price
                    </span>
                </div>
            </div>

            {error && <div className="error">{error}</div>}

            {isLoading ? (
                <div>Loading graphs...</div>
            ) : processedData && processedData.length > 0 ? (
                <div className="chart-content">
                    {processedData.map((data, index) => (
                        <div key={index} className="chart-item">
                            <h3>{data.symbol}</h3>
                            <Line
                                data={{
                                    labels: data.labels,
                                    datasets: [
                                        {
                                            label: 'Total Invested',
                                            data: data.totalInvested,
                                            borderColor: '#358ef3',
                                            backgroundColor: 'rgba(53, 142, 243, 0.2)',
                                            borderWidth: 2,
                                            pointRadius: 0,
                                            tension: 0.4,
                                        },
                                        {
                                            label: 'Average Price',
                                            data: data.averagePrice,
                                            borderColor: '#90abcb',
                                            backgroundColor: 'rgba(144, 171, 203, 0.2)',
                                            borderWidth: 2,
                                            pointRadius: 0,
                                            tension: 0.4,
                                        },
                                    ],
                                }}
                                options={{
                                    maintainAspectRatio: false,
                                    responsive: true,
                                    plugins: {
                                        tooltip: {
                                            enabled: true,
                                            backgroundColor: '#223449',
                                            titleColor: '#ffffff',
                                            bodyColor: '#ffffff',
                                        },
                                        legend: {
                                            display: true,
                                            labels: {
                                                color: '#e5e7e6',
                                            },
                                        },
                                    },
                                    scales: {
                                        x: {
                                            display: true,
                                            grid: {
                                                display: false,
                                            },
                                            ticks: {
                                                color: '#e5e7e6',
                                            },
                                        },
                                        y: {
                                            display: true,
                                            grid: {
                                                display: true,
                                                color: '#314b68',
                                            },
                                            ticks: {
                                                color: '#e5e7e6',
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div>No data available.</div>
            )}
        </div>
    );
};

export default Chart;
