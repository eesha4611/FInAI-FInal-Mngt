import React, { useState, useEffect } from 'react';
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import useRefreshData from '../hooks/useRefreshData';

interface PredictionType {
  predictedExpense: number;
  slope: number;
  confidence: string;
  monthsAnalyzed: number;
}

const Predictions: React.FC = () => {
  const [predictionData, setPredictionData] = useState<PredictionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { registerRefreshCallbacks } = useRefreshData();

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/predictions/test', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success && response.data.data) {
          setPredictionData(response.data.data);
        }
      } catch (err: any) {
        console.error('Error fetching predictions:', err);
        setError('Failed to load AI predictions');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  useEffect(() => {
    // Register refresh callback for predictions data
    registerRefreshCallbacks({
      refreshPredictions: async () => {
        try {
          setLoading(true);
          setError(null);
          
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:5001/api/predictions/test', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.data.success && response.data.data) {
            setPredictionData(response.data.data);
          }
        } catch (err: any) {
          console.error('Error fetching predictions:', err);
          setError('Failed to load AI predictions');
        } finally {
          setLoading(false);
        }
      }
    });
  }, [registerRefreshCallbacks]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getTrendIcon = (slope: number) => {
    if (slope > 0) {
      return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
    } else if (slope < 0) {
      return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
    } else {
      return <MinusIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendText = (slope: number) => {
    if (slope > 0) {
      return 'Increasing';
    } else if (slope < 0) {
      return 'Decreasing';
    } else {
      return 'Stable';
    }
  };

  const getTrendColor = (slope: number) => {
    if (slope > 0) {
      return 'text-green-600';
    } else if (slope < 0) {
      return 'text-red-600';
    } else {
      return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading predictions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!predictionData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">No prediction data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expense Predictions</h1>
          <p className="text-gray-600">AI-powered insights into your future spending</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2 text-gray-600" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Predicted Expense</p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(predictionData?.predictedExpense || 0)}
              </p>
              <div className="flex items-center mt-2">
                {getTrendIcon(predictionData?.slope || 0)}
                <span className={`text-sm ml-1 ${getTrendColor(predictionData?.slope || 0)}`}>
                  {getTrendText(predictionData?.slope || 0)}
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Confidence</p>
              <p className="text-2xl font-bold mt-2">
                {predictionData?.confidence || 'N/A'}
              </p>
              <div className="flex items-center mt-2">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: '75%' }}
                  />
                </div>
                <span className="text-sm text-gray-600">AI accuracy</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Months Analyzed</p>
              <p className="text-2xl font-bold mt-2">
                {predictionData?.monthsAnalyzed || 0}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-purple-600">Historical data</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <MinusIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Trend</p>
              <p className={`text-2xl font-bold mt-2 ${getTrendColor(predictionData?.slope || 0)}`}>
                {getTrendText(predictionData?.slope || 0)}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">
                  Slope: {predictionData?.slope?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              {getTrendIcon(predictionData?.slope || 0)}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Prediction Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-4">Analysis Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Next Month's Prediction</span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(predictionData?.predictedExpense || 0)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Confidence Level</span>
                <span className="font-medium text-gray-800">
                  {predictionData?.confidence || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Data Points Analyzed</span>
                <span className="font-medium text-gray-800">
                  {predictionData?.monthsAnalyzed || 0} months
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Trend Direction</span>
                <div className="flex items-center">
                  {getTrendIcon(predictionData?.slope || 0)}
                  <span className={`font-medium ml-1 ${getTrendColor(predictionData?.slope || 0)}`}>
                    {getTrendText(predictionData?.slope || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-4">AI Insights</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Spending Pattern Analysis</h4>
                  <p className="text-sm text-blue-700">
                    Based on {predictionData?.monthsAnalyzed || 0} months of historical data, 
                    our AI model predicts your expenses will be{' '}
                    <span className={`font-medium ${getTrendColor(predictionData?.slope || 0)}`}>
                      {getTrendText(predictionData?.slope || 0).toLowerCase()}
                    </span>{' '}
                    next month with{' '}
                    <span className="font-medium">{predictionData?.confidence || 'N/A'}</span> confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Predictions;
