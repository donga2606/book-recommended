import { Activity, AlertCircle, Brain, CheckCircle2, FileText, RefreshCw, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { modelExperiments, modelMetrics, popularBooksData, userActivityData } from "../../data/mockData";

export function DataScientistDashboard() {
  const [isTraining, setIsTraining] = useState(false);

  const handleRetrainModel = () => {
    setIsTraining(true);
    setTimeout(() => {
      setIsTraining(false);
      alert("Model retrained successfully!");
    }, 3000);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-800 mb-2">
          Data Scientist Dashboard
        </h1>
        <p className="text-slate-600">
          Model transparency, evaluation metrics, and experimentation
        </p>
      </div>

      {/* Model Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Model Overview</h3>
            <p className="text-sm text-slate-600">SVD-based collaborative filtering</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Model Type</p>
            <p className="font-semibold text-slate-800">SVD (Singular Value Decomposition)</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Input Features</p>
            <p className="font-semibold text-slate-800">User ID, Book ID, Rating</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Technique</p>
            <p className="font-semibold text-slate-800">Matrix Factorization</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Collaborative filtering model using matrix factorization to predict user ratings based on historical interactions.
            The model learns latent factors representing users and books to generate personalized recommendations.
          </p>
        </div>
      </div>

      {/* Model Experimentation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Model Experimentation</h3>
              <p className="text-sm text-slate-600">Comparing different model configurations</p>
            </div>
          </div>
          <Button
            onClick={handleRetrainModel}
            disabled={isTraining}
            className="bg-purple-600 hover:bg-purple-700 rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isTraining ? "animate-spin" : ""}`} />
            {isTraining ? "Training..." : "Retrain Model"}
          </Button>
        </div>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model Version</TableHead>
                <TableHead>Number of Factors</TableHead>
                <TableHead>RMSE</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelExperiments.map((exp, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{exp.version}</TableCell>
                  <TableCell>{exp.factors}</TableCell>
                  <TableCell>
                    <span className={exp.rmse < 0.83 ? "text-green-600 font-medium" : ""}>
                      {exp.rmse.toFixed(3)}
                    </span>
                  </TableCell>
                  <TableCell>{exp.date}</TableCell>
                  <TableCell>
                    {index === 2 ? (
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">Archived</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Evaluation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Evaluation Metrics</h3>
              <p className="text-sm text-slate-600">Model performance on train/test sets</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm text-blue-600 mb-1">Train RMSE</p>
              <p className="text-3xl font-semibold text-blue-700">{modelMetrics.trainRMSE.toFixed(3)}</p>
              <p className="text-xs text-blue-600 mt-1">Lower is better</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <p className="text-sm text-purple-600 mb-1">Test RMSE</p>
              <p className="text-3xl font-semibold text-purple-700">{modelMetrics.testRMSE.toFixed(3)}</p>
              <p className="text-xs text-purple-600 mt-1">Generalization performance</p>
            </div>
          </div>
        </div>

        {/* Model Versioning */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Model Versioning</h3>
              <p className="text-sm text-slate-600">Production model details</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">Current Version</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
              <p className="font-semibold text-slate-800 mb-2">SVD (100 factors)</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-slate-500">Parameters</p>
                  <p className="text-slate-800 font-medium">100 factors</p>
                </div>
                <div>
                  <p className="text-slate-500">RMSE</p>
                  <p className="text-slate-800 font-medium">0.824</p>
                </div>
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">Best Candidate</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  Testing
                </span>
              </div>
              <p className="font-semibold text-slate-800 mb-2">SVD (150 factors)</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-slate-500">Parameters</p>
                  <p className="text-slate-800 font-medium">150 factors</p>
                </div>
                <div>
                  <p className="text-slate-500">RMSE</p>
                  <p className="text-green-600 font-medium">0.817 ↓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">Important Notes</h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>
                  <strong>Feature importance is not applicable for SVD:</strong> Matrix factorization models learn latent factors rather than using explicit features.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>
                  <strong>Model retraining:</strong> The model can be retrained with new user ratings to improve recommendations. Consider retraining when significant new rating data is available.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>
                  <strong>Cold start problem:</strong> New users or books without ratings may receive less accurate recommendations initially.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Activity Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">User Activity</h3>
              <p className="text-sm text-slate-600">Total vs Active Readers</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px"
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Total Users"
              />
              <Line
                type="monotone"
                dataKey="activeReaders"
                stroke="#ec4899"
                strokeWidth={2}
                name="Active Readers"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Books Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Popular Books</h3>
              <p className="text-sm text-slate-600">Most read this month</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularBooksData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="title"
                stroke="#64748b"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px"
                }}
              />
              <Bar
                dataKey="reads"
                fill="#8b5cf6"
                radius={[8, 8, 0, 0]}
                name="Reads"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">Engagement Rate</h3>
          <p className="text-3xl font-semibold text-slate-800 mb-1">87.3%</p>
          <p className="text-sm text-green-600">↑ 12.5% from last month</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">Avg. Session Time</h3>
          <p className="text-3xl font-semibold text-slate-800 mb-1">24 min</p>
          <p className="text-sm text-green-600">↑ 8.2% from last month</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-pink-600" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">Click-Through Rate</h3>
          <p className="text-3xl font-semibold text-slate-800 mb-1">42.1%</p>
          <p className="text-sm text-green-600">↑ 5.7% from last month</p>
        </div>
      </div>
    </div>
  );
}
