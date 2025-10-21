'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

interface DashboardMetrics {
  totalTickets: number;
  completedTickets: number;
  averageResolutionTime: number;
  ticketsByCategory: any[];
  performanceByTechnician: any[];
  materialUsage: any[];
}

export default function DashboardAnalytics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('week'); // 'week', 'month', 'year'

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${dateRange}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!metrics) return <div>No data available</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header dengan Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Analytics</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Total Tickets</h3>
          <p className="text-2xl font-bold">{metrics.totalTickets}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Completed Tickets</h3>
          <p className="text-2xl font-bold">{metrics.completedTickets}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Avg. Resolution Time</h3>
          <p className="text-2xl font-bold">{metrics.averageResolutionTime}h</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Category */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Tickets by Category</h3>
          <BarChart width={500} height={300} data={metrics.ticketsByCategory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </div>

        {/* Technician Performance */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Technician Performance</h3>
          <LineChart width={500} height={300} data={metrics.performanceByTechnician}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="completionRate" stroke="#82ca9d" />
            <Line type="monotone" dataKey="satisfactionRate" stroke="#8884d8" />
          </LineChart>
        </div>

        {/* Material Usage */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Material Usage</h3>
          <BarChart width={500} height={300} data={metrics.materialUsage}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="material" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#82ca9d" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}