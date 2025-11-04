"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Github, MessageCircle } from "lucide-react"

export function IntegrationsView({ userId }: { userId: string }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                GitHub
              </CardTitle>
              <Badge variant="secondary">Connected</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your GitHub organizations and repositories to enable webhook integration and PR summarization.
            </p>
            <Button className="w-full">Configure GitHub</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Discord
              </CardTitle>
              <Badge variant="outline">Not Connected</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your Discord server to receive real-time notifications about GitHub events.
            </p>
            <Button className="w-full">Connect Discord</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
