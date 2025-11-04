/**
 * Configuration validation and helpers
 * Ensures all required environment variables are set
 */

interface Config {
  supabase: {
    url: string
    anonKey: string
  }
  app: {
    url: string
  }
  openai: {
    apiKey: string
  }
  jobQueue: {
    secret: string
  }
}

export function validateConfig(): Config {
  const errors: string[] = []

  // Supabase
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL is required")
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
  }

  // App URL
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    errors.push("NEXT_PUBLIC_APP_URL is required")
  }

  // OpenAI (optional but recommended)
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY not set - AI features will be disabled")
  }

  // Job Queue
  if (!process.env.JOB_QUEUE_SECRET) {
    errors.push("JOB_QUEUE_SECRET is required")
  }

  if (errors.length > 0) {
    console.error("❌ Configuration errors:")
    errors.forEach((err) => console.error(`  - ${err}`))
    throw new Error(`Missing required environment variables: ${errors.join(", ")}`)
  }

  return {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL!,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
    },
    jobQueue: {
      secret: process.env.JOB_QUEUE_SECRET!,
    },
  }
}

// Validate on module load (server-side only)
if (typeof window === "undefined") {
  try {
    validateConfig()
    console.log("✅ Environment configuration valid")
  } catch (error) {
    console.error(error)
  }
}

export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },
  jobQueue: {
    secret: process.env.JOB_QUEUE_SECRET || "",
  },
}
