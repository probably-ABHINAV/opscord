import { processPRSummarizationJob } from "@/lib/ai"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  // Simple security check - in production use proper API key validation
  if (authHeader !== `Bearer ${process.env.JOB_QUEUE_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    // Get pending jobs
    const { data: jobs, error: queryError } = await supabase
      .from("job_queue")
      .select("*")
      .eq("status", "pending")
      .lt("retry_count", 3)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(5)

    if (queryError || !jobs || jobs.length === 0) {
      return NextResponse.json({ message: "No pending jobs" }, { status: 200 })
    }

    let processedCount = 0
    let failedCount = 0

    for (const job of jobs) {
      try {
        // Mark as processing
        await supabase
          .from("job_queue")
          .update({
            status: "processing",
            started_at: new Date().toISOString(),
          })
          .eq("id", job.id)

        switch (job.job_type) {
          case "pr_summary":
            await processPRSummarizationJob(
              job.id,
              job.job_data.repo_id,
              job.job_data.pr_number,
              job.job_data.repo_full_name,
            )
            processedCount++
            break
          default:
            console.warn(`Unknown job type: ${job.job_type}`)
        }
      } catch (error) {
        console.error(`[Queue] Error processing job ${job.id}:`, error)
        failedCount++

        // Increment retry count
        const newRetryCount = job.retry_count + 1
        const newStatus = newRetryCount >= job.max_retries ? "failed" : "pending"

        await supabase
          .from("job_queue")
          .update({
            status: newStatus,
            retry_count: newRetryCount,
            error_message: error instanceof Error ? error.message : "Unknown error",
          })
          .eq("id", job.id)
      }
    }

    return NextResponse.json({
      success: true,
      processedCount,
      failedCount,
      totalProcessed: processedCount + failedCount,
    })
  } catch (error) {
    console.error("[Queue] Fatal error:", error)
    return NextResponse.json({ error: "Failed to process queue" }, { status: 500 })
  }
}
