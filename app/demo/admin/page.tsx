"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Activity, AlertTriangle, Clock, Zap, Server, Eye, ArrowLeft } from "lucide-react"

export default function AdminDemoPage() {
  const [webhookLatency, setWebhookLatency] = useState<number[]>([])
  const [metrics, setMetrics] = useState({
    webhooksProcessed: 1247,
    eventsTotal: 3891,
    avgLatency: 245,
    errorRate: 0.2,
    queueLength: 23,
  })

  useEffect(() => {
    // Simulate real-time monitoring data
    const interval = setInterval(() => {
      const newLatency = Math.random() * 500 + 100
      setWebhookLatency((prev) => [...prev.slice(-19), newLatency])
      setMetrics((prev) => ({
        ...prev,
        avgLatency: Math.round(newLatency),
        queueLength: Math.max(0, prev.queueLength + Math.floor((Math.random() - 0.6) * 5)),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const chartData = webhookLatency.map((latency, i) => ({
    time: i,
    latency: Math.round(latency),
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/demo" className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-2xl font-bold gradient-text">System Monitor</div>
          </Link>
          <Link href="/auth/login">
            <Button className="glow-button">Sign In</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with system status */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-4">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Demo Mode</span>
            </div>
            <h1 className="text-3xl font-bold gradient-text">System Monitor</h1>
            <p className="text-muted-foreground">Real-time observability dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium">Healthy</span>
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
              <div className="text-2xl font-bold">{metrics.errorRate.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">Failed requests</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latency Chart */}
          <Card className="glass border-primary/20 lg:col-span-2">
            <CardHeader>
              <CardTitle>Webhook Latency</CardTitle>
              <CardDescription>Response time over time (demo data)</CardDescription>
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
                    5,234
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Failed</span>
                  <Badge variant="outline" className="bg-red-500/10">
                    8
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
              {[
                { name: "Discord Bot", status: "Online" },
                { name: "GitHub API", status: "Online" },
                { name: "OpenAI API", status: "Online" },
                { name: "Database", status: "Online" },
                { name: "Redis Queue", status: "Degraded" },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <span className="text-sm">{service.name}</span>
                  <Badge className={service.status === "Online" ? "bg-green-500" : "bg-yellow-500"}>
                    {service.status}
                  </Badge>
                </div>
              ))}
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
