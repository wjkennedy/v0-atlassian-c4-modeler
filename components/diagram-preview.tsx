"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react"

interface DiagramPreviewProps {
  components: string[]
  integrations: string[]
  config: {
    title: string
    level: string
    theme: string
  }
}

interface DiagramNode {
  id: string
  name: string
  type: "person" | "system" | "container" | "component" | "integration"
  description: string
  x: number
  y: number
  width: number
  height: number
  color: string
  connections: string[]
}

export function DiagramPreview({ components, integrations, config }: DiagramPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [nodes, setNodes] = useState<DiagramNode[]>([])

  // Generate diagram nodes based on selected components and integrations
  useEffect(() => {
    const generateNodes = () => {
      const newNodes: DiagramNode[] = []
      const yOffset = 100

      // Add a user/person node
      if (components.length > 0) {
        newNodes.push({
          id: "user",
          name: "Solution Partner",
          type: "person",
          description: "Atlassian solution partner managing enterprise architecture",
          x: 50,
          y: 50,
          width: 160,
          height: 80,
          color: "#0891b2",
          connections: components.slice(0, 3), // Connect to first few components
        })
      }

      // Add Atlassian components as containers
      components.forEach((componentId, index) => {
        const componentData = getComponentData(componentId)
        if (componentData) {
          newNodes.push({
            id: componentId,
            name: componentData.name,
            type: "container",
            description: componentData.description,
            x: 300 + (index % 3) * 200,
            y: yOffset + Math.floor(index / 3) * 120,
            width: 180,
            height: 100,
            color: componentData.color,
            connections: integrations.filter((_, i) => i < 2), // Connect to some integrations
          })
        }
      })

      // Add integrations as external systems
      integrations.forEach((integrationId, index) => {
        const integrationData = getIntegrationData(integrationId)
        if (integrationData) {
          newNodes.push({
            id: integrationId,
            name: integrationData.name,
            type: "system",
            description: integrationData.description,
            x: 700 + (index % 2) * 220,
            y: 150 + Math.floor(index / 2) * 120,
            width: 200,
            height: 100,
            color: integrationData.color,
            connections: [],
          })
        }
      })

      setNodes(newNodes)
    }

    generateNodes()
  }, [components, integrations])

  // Draw the diagram
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up canvas scaling
    ctx.save()
    ctx.scale(zoom, zoom)

    // Draw connections first (so they appear behind nodes)
    nodes.forEach((node) => {
      node.connections.forEach((connectionId) => {
        const targetNode = nodes.find((n) => n.id === connectionId)
        if (targetNode) {
          drawConnection(ctx, node, targetNode)
        }
      })
    })

    // Draw nodes
    nodes.forEach((node) => {
      drawNode(ctx, node)
    })

    // Draw title
    ctx.fillStyle = "#374151"
    ctx.font = "bold 24px sans-serif"
    ctx.fillText(config.title, 20, 30)

    // Draw level indicator
    ctx.fillStyle = "#6b7280"
    ctx.font = "14px sans-serif"
    ctx.fillText(`Level: ${config.level.charAt(0).toUpperCase() + config.level.slice(1)}`, 20, 55)

    ctx.restore()
  }, [nodes, zoom, config])

  const drawNode = (ctx: CanvasRenderingContext2D, node: DiagramNode) => {
    const { x, y, width, height, name, type, description, color } = node

    // Draw shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
    ctx.fillRect(x + 2, y + 2, width, height)

    // Draw main rectangle
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(x, y, width, height)

    // Draw border based on type
    ctx.strokeStyle = color
    ctx.lineWidth = type === "person" ? 3 : 2
    if (type === "person") {
      // Draw rounded rectangle for person
      drawRoundedRect(ctx, x, y, width, height, 10)
    } else {
      ctx.strokeRect(x, y, width, height)
    }

    // Draw type indicator
    ctx.fillStyle = color
    ctx.fillRect(x, y, width, 25)

    // Draw type label
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 12px sans-serif"
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)
    ctx.fillText(typeLabel, x + 8, y + 17)

    // Draw name
    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 14px sans-serif"
    const nameLines = wrapText(ctx, name, width - 16)
    nameLines.forEach((line, index) => {
      ctx.fillText(line, x + 8, y + 45 + index * 16)
    })

    // Draw description
    ctx.fillStyle = "#6b7280"
    ctx.font = "11px sans-serif"
    const descLines = wrapText(ctx, description, width - 16)
    descLines.slice(0, 2).forEach((line, index) => {
      ctx.fillText(line, x + 8, y + 65 + nameLines.length * 16 + index * 14)
    })
  }

  const drawConnection = (ctx: CanvasRenderingContext2D, from: DiagramNode, to: DiagramNode) => {
    const fromX = from.x + from.width / 2
    const fromY = from.y + from.height / 2
    const toX = to.x + to.width / 2
    const toY = to.y + to.height / 2

    ctx.strokeStyle = "#9ca3af"
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()

    // Draw arrow
    const angle = Math.atan2(toY - fromY, toX - fromX)
    const arrowLength = 10
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - arrowLength * Math.cos(angle - Math.PI / 6), toY - arrowLength * Math.sin(angle - Math.PI / 6))
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - arrowLength * Math.cos(angle + Math.PI / 6), toY - arrowLength * Math.sin(angle + Math.PI / 6))
    ctx.stroke()
  }

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.stroke()
  }

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(" ")
    const lines: string[] = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const width = ctx.measureText(currentLine + " " + word).width
      if (width < maxWidth) {
        currentLine += " " + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    lines.push(currentLine)
    return lines
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5))
  const handleReset = () => setZoom(1)

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="px-3">
            {Math.round(zoom * 100)}%
          </Badge>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Canvas */}
      <Card className="p-4">
        <div className="relative overflow-auto max-h-96 border rounded-lg">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            className="border-0 bg-gray-50"
            style={{ minWidth: "100%", minHeight: "300px" }}
          />
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Diagram Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-500"></div>
            <span>Person/Actor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 border-2 border-green-500"></div>
            <span>Container</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 border-2 border-purple-500"></div>
            <span>External System</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-400 bg-white"></div>
            <span>Integration</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Helper functions to get component and integration data
function getComponentData(id: string) {
  const components: Record<string, { name: string; description: string; color: string }> = {
    "jira-software": { name: "Jira Software", description: "Project management", color: "#0052cc" },
    "jira-service-management": { name: "Jira Service Management", description: "ITSM platform", color: "#36b37e" },
    confluence: { name: "Confluence", description: "Team collaboration", color: "#172b4d" },
    bitbucket: { name: "Bitbucket", description: "Git repository", color: "#0052cc" },
    compass: { name: "Compass", description: "Developer experience", color: "#ff5630" },
    atlas: { name: "Atlas", description: "Team directory", color: "#6554c0" },
    statuspage: { name: "Statuspage", description: "Status communication", color: "#00b8d9" },
    opsgenie: { name: "Opsgenie", description: "Incident management", color: "#ff5630" },
    "database-primary": { name: "Primary Database", description: "Main data store", color: "#6b7280" },
    "database-analytics": { name: "Analytics Database", description: "Data warehouse", color: "#f59e0b" },
  }
  return components[id]
}

function getIntegrationData(id: string) {
  const integrations: Record<string, { name: string; description: string; color: string }> = {
    servicenow: { name: "ServiceNow", description: "ITSM platform", color: "#62d84e" },
    salesforce: { name: "Salesforce", description: "CRM platform", color: "#00a1e0" },
    github: { name: "GitHub", description: "Code repository", color: "#24292e" },
    okta: { name: "Okta", description: "Identity management", color: "#007dc1" },
    "azure-ad": { name: "Azure AD", description: "Microsoft identity", color: "#0078d4" },
    slack: { name: "Slack", description: "Team communication", color: "#4a154b" },
    "microsoft-teams": { name: "Microsoft Teams", description: "Unified communication", color: "#6264a7" },
    tableau: { name: "Tableau", description: "Business intelligence", color: "#e97627" },
    "power-bi": { name: "Power BI", description: "Microsoft analytics", color: "#f2c811" },
    jenkins: { name: "Jenkins", description: "CI/CD platform", color: "#d33833" },
    aws: { name: "Amazon Web Services", description: "Cloud infrastructure", color: "#ff9900" },
    azure: { name: "Microsoft Azure", description: "Cloud platform", color: "#0078d4" },
    "audit-framework": { name: "Audit Framework", description: "Compliance management", color: "#6b7280" },
    "reporting-engine": { name: "Reporting Engine", description: "Custom reporting", color: "#10b981" },
    "automation-platform": { name: "Automation Platform", description: "Process automation", color: "#8b5cf6" },
    "work-item-classifier": { name: "Work Item Classifier", description: "AI classification", color: "#6366f1" },
    "data-ingestion": { name: "Data Ingestion Service", description: "Data processing", color: "#06b6d4" },
  }
  return integrations[id]
}
