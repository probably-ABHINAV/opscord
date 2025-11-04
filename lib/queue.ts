import { createClient } from "@/lib/supabase/server"

interface JobData {
  repo_id?: string
  pr_number?: number
  repo_full_name?: string
  [key: string]: any
}

export async function enqueueJob(userId: string, jobType: string, jobData: JobData, priority = 0, maxRetries = 3) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("job_queue")
    .insert({
      user_id: userId,
      job_type: jobType,
      job_data: jobData,
      status: "pending",
      priority,
      max_retries: maxRetries,
    })
    .select("id")
    .single()

  if (error) {
    console.error("[Queue] Error enqueuing job:", error)
    throw error
  }

  return data.id
}

export async function getQueueStats(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("get_queue_stats", {
    user_id_param: userId,
  })

  if (error) {
    console.error("[Queue] Error getting stats:", error)
    return {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    }
  }

  return data
}

export async function getJobStatus(jobId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("job_queue").select("*").eq("id", jobId).single()

  if (error) {
    console.error("[Queue] Error getting job status:", error)
    return null
  }

  return data
}

export async function retryFailedJob(jobId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("job_queue")
    .update({
      status: "pending",
      retry_count: 0,
      error_message: null,
    })
    .eq("id", jobId)

  if (error) {
    console.error("[Queue] Error retrying job:", error)
    throw error
  }
}
