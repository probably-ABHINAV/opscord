"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Activity, AlertTriangle, Clock, Zap, Server, Eye } from "lucide-react"

export default function AdminPanel() {
  const [systemStatus, setSystemStatus] = useState<"healthy" | "degraded" | "offline">("healthy")
  const [webhookLatency, setWebhookLatency] = useState<number[]>([])
  const [jobQueue, setJobQueue] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [metrics, setMetrics] = useState({
    webhooksProcessed: 0,
    eventsTotal: 0,
    avgLatency: 0,
    errorRate: 0,
    queueLength: 0,
  })

  useEffect(() => {
    // Simulate real-time monitoring data
    const interval = setInterval(() => {
      const newLatency = Math.random() * 500 + 100
      setWebhookLatency((prev) => [...prev.slice(-19), newLatency])
      setMetrics((prev) => ({
        ...prev,
        avgLatency: Math.round(newLatency),
        queueLength: Math.floor(Math.random() * 50),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    if (status === "healthy") return "bg-green-500"
    if (status === "degraded") return "bg-yellow-500"
    return "bg-red-500"
  }

  const chartData = webhookLatency.map((latency, i) => ({
    time: i,
    latency: Math.round(latency),
  }))

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with system status */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">System Monitor</h1>
            <p className="text-muted-foreground">Real-time observability dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(systemStatus)} animate-pulse`}></div>
              <span className="text-sm font-medium capitalize">{systemStatus}</span>
            </div>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Webhooks Processed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.webhooksProcessed}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="glass border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Avg Latency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgLatency}ms</div>
              <p className="text-xs text-muted-foreground">Response time</p>
            </CardContent>
          </Card>

          <Card className="glass border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Queue Length
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.queueLength}</div>
              <p className="text-xs text-muted-foreground">Pending jobs</p>
            </CardContent>
          </Card>

          <Card className="glass border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Error Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.errorRate}%</div>
              <p className="text-xs text-muted-foreground">Failed requests</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latency Chart */}
          <Card className="glass border-primary/20 lg:col-span-2">
            <CardHeader>
              <CardTitle>Webhook Latency</CardTitle>
              <CardDescription>Response time over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="latency"
                    stroke="var(--color-primary)"
                    fillOpacity={1}
                    fill="url(#colorLatency)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Job Queue Status */}
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle>Job Queue</CardTitle>
              <CardDescription>Processing status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <Badge variant="outline" className="bg-yellow-500/10">
                    {metrics.queueLength}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <Badge variant="outline" className="bg-blue-500/10">
                    12
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <Badge variant="outline" className="bg-green-500/10">
                    1,234
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Failed</span>
                  <Badge variant="outline" className="bg-red-500/10">
                    3
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Last 10 webhook events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/5 transition-colors border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm font-medium">Pull Request Opened</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(Date.now() - i * 60000).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600">
                    Success
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Connected Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Discord Bot</span>
                <Badge className="bg-green-500">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">GitHub API</span>
                <Badge className="bg-green-500">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">OpenAI API</span>
                <Badge className="bg-green-500">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge className="bg-green-500">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Redis Queue</span>
                <Badge className="bg-yellow-500">Degraded</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Uptime Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Overall Uptime</span>
                <span className="text-sm font-bold">99.95%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last 24h</span>
                <span className="text-sm font-bold text-green-600">100%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last 7 days</span>
                <span className="text-sm font-bold text-green-600">99.98%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last 30 days</span>
                <span className="text-sm font-bold">99.92%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
