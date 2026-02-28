import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
  FlagIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';
import axios from 'axios';
import useRefreshData from '../hooks/useRefreshData';

interface Anomaly {
  id: number;
  category: string;
  amount: number;
  created_at: string;
  reason: string;
}

interface AnomalyData {
  totalTransactionsChecked: number;
  anomalies: Anomaly[];
}

const Anomalies: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [selectedAnomaly, setSelectedAnomaly] = useState<number | null>(null);
  const [anomalyData, setAnomalyData] = useState<AnomalyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { registerRefreshCallbacks } = useRefreshData();

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/anomalies/test', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success && response.data.data) {
          setAnomalyData(response.data.data);
        }
      } catch (err: any) {
        console.error('Error fetching anomalies:', err);
        setError('Failed to load anomaly detection results');
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
  }, []);

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (amount: number) => {
    if (amount > 2000) return 'bg-red-100 text-red-800 border-red-200';
    if (amount > 1000) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Analyzing transactions...</div>
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

  if (!anomalyData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">No anomaly data available</div>
      </div>
    );
  }

  const { totalTransactionsChecked, anomalies } = anomalyData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Anomaly Detection</h1>
          <p className="text-gray-600">AI-powered detection of unusual spending patterns</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
            <ArrowPathIcon className="h-5 w-5 mr-2 text-gray-600" />
            Refresh Detection
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center">
            <FlagIcon className="h-5 w-5 mr-2" />
            Report False Positive
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Transactions Analyzed</p>
              <p className="text-2xl font-bold mt-2">{totalTransactionsChecked}</p>
              <div className="flex items-center mt-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm text-blue-600">Total checked</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Anomalies Found</p>
              <p className="text-2xl font-bold mt-2">{anomalies.length}</p>
              <div className="flex items-center mt-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">Detected</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Detection Rate</p>
              <p className="text-2xl font-bold mt-2">
                {totalTransactionsChecked > 0 
                  ? ((anomalies.length / totalTransactionsChecked) * 100).toFixed(1)
                  : '0'
                }%
              </p>
              <div className="flex items-center mt-2">
                <ArrowPathIcon className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-sm text-purple-600">Of total transactions</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <ArrowPathIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-2xl font-bold mt-2">
                {anomalies.length === 0 ? 'Clear' : 'Alert'}
              </p>
              <div className="flex items-center mt-2">
                {anomalies.length === 0 ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">No issues</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600">Review needed</span>
                  </>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-full ${anomalies.length === 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              {anomalies.length === 0 ? (
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              ) : (
                <XCircleIcon className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Detected Anomalies</h2>
        
        {anomalies.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No unusual transactions detected</h3>
            <p className="text-gray-600">All your transactions appear to be within normal spending patterns.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {anomalies.map((anomaly) => (
              <div 
                key={anomaly.id}
                className={`border rounded-lg p-4 ${getSeverityColor(anomaly.amount)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                      <h3 className="font-semibold text-gray-800">
                        {anomaly.category} Anomaly
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        anomaly.amount > 2000 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {anomaly.amount > 2000 ? 'High' : 'Medium'} Risk
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-semibold text-gray-800">{formatCurrency(anomaly.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-semibold text-gray-800">{formatDate(anomaly.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-semibold text-gray-800">{anomaly.category}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white bg-opacity-50 rounded p-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {anomaly.reason}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors">
                      <EyeIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors">
                      <FlagIcon className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          Refresh Anomaly Detection
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Anomaly detection updates automatically when you refresh the page
        </p>
      </div>
    </div>
  );
};

export default Anomalies;