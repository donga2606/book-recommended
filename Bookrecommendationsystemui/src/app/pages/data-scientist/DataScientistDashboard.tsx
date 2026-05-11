import { Activity, AlertCircle, Brain, CheckCircle2, FileText, RefreshCw, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { popularBooksData, userActivityData } from "../../data/mockData";
import { getModelExperiments, getModelMetrics, getModelOverview, trainSVD } from "../../lib/mlApi";

export function DataScientistDashboard() {
  const queryClient = useQueryClient();
  const [isTrainModalOpen, setIsTrainModalOpen] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainMessage, setTrainMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    maxRatings: "30000",
    testRatio: "0.2",
    randomSeed: "42",
    minUserRatings: "2",
    minBookRatings: "2",
    factors: "80",
    epochs: "10",
    learningRate: "0.01",
    regularization: "0.05",
    enableTuning: true,
    maxTrials: "6",
    tuningFactors: "50,80,120",
    tuningEpochs: "8,10",
    tuningLearningRates: "0.005,0.01",
    tuningRegularizations: "0.02,0.05",
  });

  const parseNumberList = (value: string): number[] =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => Number(item))
      .filter((item) => !Number.isNaN(item));

  const {
    data: modelOverview,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
  } = useQuery({
    queryKey: ["ml-overview"],
    queryFn: getModelOverview,
  });
  const {
    data: experiments = [],
    isLoading: isExperimentsLoading,
    isError: isExperimentsError,
  } = useQuery({
    queryKey: ["ml-experiments"],
    queryFn: getModelExperiments,
  });
  const {
    data: metrics,
    isLoading: isMetricsLoading,
    isError: isMetricsError,
  } = useQuery({
    queryKey: ["ml-metrics"],
    queryFn: getModelMetrics,
  });

  const activeExperiment =
    experiments.find((experiment) => experiment.status.toLowerCase() === "active") ?? experiments[0];
  const bestCandidate =
    experiments
      .filter((experiment) => experiment.id !== activeExperiment?.id)
      .reduce((best, current) => (current.rmse < best.rmse ? current : best), experiments[0] ?? activeExperiment);

  const trainMutation = useMutation({
    mutationFn: trainSVD,
    onSuccess: (data) => {
      setTrainMessage(
        `Training done. Job #${data.job.id} | Test RMSE: ${data.result.test_rmse.toFixed(4)} | Trials: ${data.result.trials_run}`
      );
      queryClient.invalidateQueries({ queryKey: ["ml-overview"] });
      queryClient.invalidateQueries({ queryKey: ["ml-experiments"] });
      queryClient.invalidateQueries({ queryKey: ["ml-metrics"] });
      setIsTrainModalOpen(false);
      setIsTraining(false);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown training error";
      setTrainMessage(`Training failed: ${message}`);
      setIsTraining(false);
    },
  });

  const handleRetrainModel = () => {
    setIsTraining(true);
    setTrainMessage(null);
    trainMutation.mutate({
      max_ratings: Number(form.maxRatings),
      test_ratio: Number(form.testRatio),
      random_seed: Number(form.randomSeed),
      min_user_ratings: Number(form.minUserRatings),
      min_book_ratings: Number(form.minBookRatings),
      enable_tuning: form.enableTuning,
      max_trials: Number(form.maxTrials),
      hyperparameters: {
        factors: Number(form.factors),
        epochs: Number(form.epochs),
        learning_rate: Number(form.learningRate),
        regularization: Number(form.regularization),
      },
      tuning_space: {
        factors: parseNumberList(form.tuningFactors),
        epochs: parseNumberList(form.tuningEpochs),
        learning_rates: parseNumberList(form.tuningLearningRates),
        regularizations: parseNumberList(form.tuningRegularizations),
      },
    });
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
            <p className="text-sm text-slate-600">
              {isOverviewLoading ? "Loading overview..." : modelOverview?.technique ?? "SVD-based collaborative filtering"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Model Type</p>
            <p className="font-semibold text-slate-800">
              {modelOverview?.model_type ?? "SVD (Singular Value Decomposition)"}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Input Features</p>
            <p className="font-semibold text-slate-800">
              {modelOverview?.input_features.join(", ") ?? "User ID, Book ID, Rating"}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Technique</p>
            <p className="font-semibold text-slate-800">{modelOverview?.technique ?? "Matrix Factorization"}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            {modelOverview?.description ??
              "Collaborative filtering model using matrix factorization to predict user ratings based on historical interactions."}
          </p>
          {isOverviewError && <p className="text-xs text-red-600 mt-2">Failed to load model overview from backend.</p>}
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
          <Dialog open={isTrainModalOpen} onOpenChange={setIsTrainModalOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={isTraining}
                className="bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isTraining ? "animate-spin" : ""}`} />
                {isTraining ? "Training..." : "Train SVD"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Train SVD Model</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRetrainModel();
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxRatings">Max Ratings</Label>
                    <Input
                      id="maxRatings"
                      type="number"
                      value={form.maxRatings}
                      onChange={(e) => setForm((prev) => ({ ...prev, maxRatings: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="testRatio">Test Ratio</Label>
                    <Input
                      id="testRatio"
                      type="number"
                      step="0.01"
                      value={form.testRatio}
                      onChange={(e) => setForm((prev) => ({ ...prev, testRatio: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="randomSeed">Random Seed</Label>
                    <Input
                      id="randomSeed"
                      type="number"
                      value={form.randomSeed}
                      onChange={(e) => setForm((prev) => ({ ...prev, randomSeed: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxTrials">Max Trials</Label>
                    <Input
                      id="maxTrials"
                      type="number"
                      value={form.maxTrials}
                      onChange={(e) => setForm((prev) => ({ ...prev, maxTrials: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="factors">Factors</Label>
                    <Input
                      id="factors"
                      type="number"
                      value={form.factors}
                      onChange={(e) => setForm((prev) => ({ ...prev, factors: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="epochs">Epochs</Label>
                    <Input
                      id="epochs"
                      type="number"
                      value={form.epochs}
                      onChange={(e) => setForm((prev) => ({ ...prev, epochs: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="learningRate">Learning Rate</Label>
                    <Input
                      id="learningRate"
                      type="number"
                      step="0.001"
                      value={form.learningRate}
                      onChange={(e) => setForm((prev) => ({ ...prev, learningRate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="regularization">Regularization</Label>
                    <Input
                      id="regularization"
                      type="number"
                      step="0.001"
                      value={form.regularization}
                      onChange={(e) => setForm((prev) => ({ ...prev, regularization: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minUserRatings">Min User Ratings</Label>
                    <Input
                      id="minUserRatings"
                      type="number"
                      value={form.minUserRatings}
                      onChange={(e) => setForm((prev) => ({ ...prev, minUserRatings: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minBookRatings">Min Book Ratings</Label>
                    <Input
                      id="minBookRatings"
                      type="number"
                      value={form.minBookRatings}
                      onChange={(e) => setForm((prev) => ({ ...prev, minBookRatings: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.enableTuning}
                      onChange={(e) => setForm((prev) => ({ ...prev, enableTuning: e.target.checked }))}
                    />
                    Enable hyperparameter tuning
                  </Label>
                  {form.enableTuning && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="tuningFactors">Tuning Factors (comma-separated)</Label>
                        <Input
                          id="tuningFactors"
                          value={form.tuningFactors}
                          onChange={(e) => setForm((prev) => ({ ...prev, tuningFactors: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tuningEpochs">Tuning Epochs (comma-separated)</Label>
                        <Input
                          id="tuningEpochs"
                          value={form.tuningEpochs}
                          onChange={(e) => setForm((prev) => ({ ...prev, tuningEpochs: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tuningLearningRates">Tuning Learning Rates (comma-separated)</Label>
                        <Input
                          id="tuningLearningRates"
                          value={form.tuningLearningRates}
                          onChange={(e) => setForm((prev) => ({ ...prev, tuningLearningRates: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tuningRegularizations">Tuning Regularizations (comma-separated)</Label>
                        <Input
                          id="tuningRegularizations"
                          value={form.tuningRegularizations}
                          onChange={(e) => setForm((prev) => ({ ...prev, tuningRegularizations: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsTrainModalOpen(false)}
                    disabled={isTraining}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isTraining} className="bg-purple-600 hover:bg-purple-700">
                    {isTraining ? "Training..." : "Start Training"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {trainMessage && (
          <div className="mt-4 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700">
            {trainMessage}
          </div>
        )}
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
              {isExperimentsLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500">
                    Loading experiments...
                  </TableCell>
                </TableRow>
              )}
              {isExperimentsError && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-red-600">
                    Failed to load experiments from backend.
                  </TableCell>
                </TableRow>
              )}
              {!isExperimentsLoading && !isExperimentsError && experiments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500">
                    No experiments yet.
                  </TableCell>
                </TableRow>
              )}
              {experiments.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="font-medium">{exp.version}</TableCell>
                  <TableCell>{exp.factors}</TableCell>
                  <TableCell>
                    <span className={exp.rmse < 0.83 ? "text-green-600 font-medium" : ""}>
                      {exp.rmse.toFixed(3)}
                    </span>
                  </TableCell>
                  <TableCell>{exp.date}</TableCell>
                  <TableCell>
                    {exp.status.toLowerCase() === "active" ? (
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        Active
                      </span>
                    ) : exp.status.toLowerCase() === "testing" ? (
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                        Testing
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">{exp.status}</span>
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
              <p className="text-3xl font-semibold text-blue-700">
                {isMetricsLoading ? "..." : (metrics?.train_rmse ?? 0).toFixed(3)}
              </p>
              <p className="text-xs text-blue-600 mt-1">Lower is better</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <p className="text-sm text-purple-600 mb-1">Test RMSE</p>
              <p className="text-3xl font-semibold text-purple-700">
                {isMetricsLoading ? "..." : (metrics?.test_rmse ?? 0).toFixed(3)}
              </p>
              <p className="text-xs text-purple-600 mt-1">Generalization performance</p>
            </div>
            {isMetricsError && <p className="text-xs text-red-600">Failed to load metrics from backend.</p>}
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
              <p className="font-semibold text-slate-800 mb-2">
                {activeExperiment?.version ?? "No active model yet"}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-slate-500">Parameters</p>
                  <p className="text-slate-800 font-medium">
                    {activeExperiment ? `${activeExperiment.factors} factors` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">RMSE</p>
                  <p className="text-slate-800 font-medium">
                    {activeExperiment ? activeExperiment.rmse.toFixed(3) : "-"}
                  </p>
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
              <p className="font-semibold text-slate-800 mb-2">
                {bestCandidate?.version ?? "No candidate yet"}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-slate-500">Parameters</p>
                  <p className="text-slate-800 font-medium">
                    {bestCandidate ? `${bestCandidate.factors} factors` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">RMSE</p>
                  <p className="text-green-600 font-medium">
                    {bestCandidate ? `${bestCandidate.rmse.toFixed(3)} ↓` : "-"}
                  </p>
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
