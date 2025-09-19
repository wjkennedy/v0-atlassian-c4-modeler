"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, RefreshCw } from "lucide-react"
import { createMultiLevelAtlassianC4Model, type MultiLevelC4Model } from "@/lib/c4-generator"

interface DiagramPreviewProps {
  components: string[]
  integrations: string[]
  config: {
    title: string
    level: string
    theme: string
  }
}

export function DiagramPreview({ components, integrations, config }: DiagramPreviewProps) {
  const mermaidRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedLevel, setSelectedLevel] = useState<keyof MultiLevelC4Model>("context")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setRefreshKey((prev) => prev + 1)
  }, [components, integrations, config])

  useEffect(() => {
    const renderDiagram = async () => {
      if (!mermaidRef.current || components.length === 0) return

      setIsLoading(true)
      setError(null)

      try {
        // Dynamically import Mermaid
        const mermaid = (await import("mermaid")).default

        // Initialize Mermaid with C4 theme
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor: "#0052cc",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#0052cc",
            lineColor: "#6b7280",
            sectionBkgColor: "#f8fafc",
            altSectionBkgColor: "#f1f5f9",
            gridColor: "#e2e8f0",
            c4PersonBkg: "#08427b",
            c4PersonBorder: "#073b6f",
            c4SystemBkg: "#1168bd",
            c4SystemBorder: "#0b4884",
            c4ContainerBkg: "#438dd5",
            c4ContainerBorder: "#2563eb",
            c4ComponentBkg: "#85bbf0",
            c4ComponentBorder: "#3b82f6",
          },
          c4: {
            personFontSize: 14,
            personFontFamily: "Arial",
            personFontWeight: "normal",
            systemFontSize: 14,
            systemFontFamily: "Arial",
            systemFontWeight: "normal",
          },
        })

        // Generate the multi-level model
        const multiModel = createMultiLevelAtlassianC4Model(components, integrations, config.title)
        const selectedModel = multiModel[selectedLevel]

        const mermaidSyntax = generateMermaidC4Diagram(selectedModel)

        // Clear previous content
        mermaidRef.current.innerHTML = ""

        // Create a unique ID for this diagram
        const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Render the diagram
        const { svg } = await mermaid.render(diagramId, mermaidSyntax)

        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg

          // Apply zoom to the SVG
          const svgElement = mermaidRef.current.querySelector("svg")
          if (svgElement) {
            svgElement.style.transform = `scale(${zoom})`
            svgElement.style.transformOrigin = "top left"
            svgElement.style.width = `${100 / zoom}%`
            svgElement.style.height = `${100 / zoom}%`
          }
        }
      } catch (err) {
        console.error("[v0] Mermaid rendering error:", err)
        setError(err instanceof Error ? err.message : "Failed to render diagram")

        // Fallback to simple text representation
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `
            <div class="p-8 text-center text-gray-500">
              <p class="mb-2">Diagram rendering failed</p>
              <p class="text-sm">${error || "Unknown error"}</p>
              <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                Retry
              </button>
            </div>
          `
        }
      } finally {
        setIsLoading(false)
      }
    }

    renderDiagram()
  }, [components, integrations, config, selectedLevel, refreshKey, zoom, error])

  const generateMermaidC4Diagram = (model: any): string => {
    const levelTitles = {
      landscape: "System Landscape",
      context: "System Context",
      container: "Container",
      component: "Component",
      code: "Code",
    }

    let mermaid = `---
title: ${model.title} - ${levelTitles[model.level as keyof typeof levelTitles]} Diagram
---
C4${model.level.charAt(0).toUpperCase() + model.level.slice(1)}

`

    // Add elements based on type
    model.elements.forEach((element: any) => {
      const cleanId = element.id.replace(/[^a-zA-Z0-9]/g, "_")
      const cleanName = element.name.replace(/"/g, '\\"')
      const cleanDesc = element.description.replace(/"/g, '\\"')
      const tech = element.technology ? `, "${element.technology.replace(/"/g, '\\"')}"` : ""

      switch (element.type) {
        case "person":
          mermaid += `    Person(${cleanId}, "${cleanName}", "${cleanDesc}")\n`
          break
        case "system":
          mermaid += `    System(${cleanId}, "${cleanName}", "${cleanDesc}"${tech})\n`
          break
        case "container":
          mermaid += `    Container(${cleanId}, "${cleanName}", "${cleanDesc}"${tech})\n`
          break
        case "component":
          mermaid += `    Component(${cleanId}, "${cleanName}", "${cleanDesc}"${tech})\n`
          break
        default:
          mermaid += `    System(${cleanId}, "${cleanName}", "${cleanDesc}"${tech})\n`
      }
    })

    mermaid += "\n"

    // Add relationships
    model.relationships.forEach((rel: any) => {
      const cleanFrom = rel.from.replace(/[^a-zA-Z0-9]/g, "_")
      const cleanTo = rel.to.replace(/[^a-zA-Z0-9]/g, "_")
      const cleanDesc = rel.description.replace(/"/g, '\\"')
      const tech = rel.technology ? `, "${rel.technology.replace(/"/g, '\\"')}"` : ""

      mermaid += `    Rel(${cleanFrom}, ${cleanTo}, "${cleanDesc}"${tech})\n`
    })

    return mermaid
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.3))
  const handleReset = () => {
    setZoom(1)
    setRefreshKey((prev) => prev + 1)
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={selectedLevel} onValueChange={(value) => setSelectedLevel(value as keyof MultiLevelC4Model)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="landscape">System Landscape</SelectItem>
              <SelectItem value="context">System Context</SelectItem>
              <SelectItem value="container">Container</SelectItem>
              <SelectItem value="component">Component</SelectItem>
              <SelectItem value="code">Code</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={isLoading}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="px-3">
            {Math.round(zoom * 100)}%
          </Badge>
          <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={isLoading}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} disabled={isLoading}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <Button variant="outline" size="sm">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Diagram Canvas */}
      <Card className="p-4">
        <div className="relative overflow-auto max-h-96 border rounded-lg bg-white">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="flex items-center gap-2 text-gray-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Rendering diagram...</span>
              </div>
            </div>
          )}

          <div
            ref={mermaidRef}
            className="min-h-64 w-full overflow-auto"
            style={{ minWidth: "100%", minHeight: "300px" }}
          />

          {components.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <p className="mb-2">No components selected</p>
                <p className="text-sm">Select components and integrations to generate a diagram</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">C4 Model Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#08427b] rounded border-2 border-[#073b6f]"></div>
            <span>Person/Actor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#1168bd] border-2 border-[#0b4884]"></div>
            <span>Software System</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#438dd5] border-2 border-[#2563eb]"></div>
            <span>Container</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#85bbf0] border-2 border-[#3b82f6]"></div>
            <span>Component</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-400 bg-white"></div>
            <span>External System</span>
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
