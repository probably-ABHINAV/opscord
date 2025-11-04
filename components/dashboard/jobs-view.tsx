"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react"

interface Job {
  id: string
  job_type: string
  status: string
  created_at: string
  retry_count: number
}

export function JobsView({ userId }: { userId: string }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from("job_queue")
          .select("id, job_type, status, created_at, retry_count")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50)

        if (error) throw error
        setJobs(data || [])
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
    const interval = setInterval(fetchJobs, 5000)
    return () => clearInterval(interval)
  }, [userId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "processing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: "bg-green-500/20 text-green-500",
      failed: "bg-red-500/20 text-red-500",
      processing: "bg-blue-500/20 text-blue-500",
      pending: "bg-yellow-500/20 text-yellow-500",
    }
    return variants[status] || "bg-gray-500/20 text-gray-500"
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading jobs...</div>
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No jobs found. Jobs will appear here when they are queued.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(job.status)}
                <div>
                  <p className="font-semibold capitalize">{job.job_type}</p>
                  <p className="text-sm text-muted-foreground">{new Date(job.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {job.retry_count > 0 && <Badge variant="outline">Retried {job.retry_count}x</Badge>}
                <Badge className={getStatusBadge(job.status)}>{job.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
