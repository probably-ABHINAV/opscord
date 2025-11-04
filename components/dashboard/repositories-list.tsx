"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, CheckCircle } from "lucide-react"

interface Repository {
  id: string
  repo_name: string
  repo_full_name: string
  is_active: boolean
  auto_summarize: boolean
  created_at: string
}

export function RepositoriesList({ userId }: { userId: string }) {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRepos = async () => {
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from("github_repositories")
          .select(
            `
            id,
            repo_name,
            repo_full_name,
            is_active,
            auto_summarize,
            created_at
          `,
          )
          .order("created_at", { ascending: false })

        if (error) throw error
        setRepos(data || [])
      } catch (error) {
        console.error("Failed to fetch repositories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRepos()
  }, [userId])

  if (loading) {
    return <div className="text-muted-foreground">Loading repositories...</div>
  }

  if (repos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">
            No repositories connected yet. Connect your first repository to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {repos.map((repo) => (
        <Card key={repo.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{repo.repo_full_name}</CardTitle>
              <div className="flex gap-2">
                {repo.auto_summarize && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-500">
                    Auto-Summarize
                  </Badge>
                )}
                {repo.is_active && (
                  <Badge className="bg-green-500/20 text-green-500">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Connected on {new Date(repo.created_at).toLocaleDateString()}
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                // TODO: Implement delete
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
