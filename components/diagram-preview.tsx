"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Download } from "lucide-react"
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
  const diagramRef = useRef<HTMLDivElement>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedLevel, setSelectedLevel] = useState<keyof MultiLevelC4Model>("context")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [currentModel, setCurrentModel] = useState<any>(null)

  useEffect(() => {
    setRefreshKey((prev) => prev + 1)
  }, [components, integrations, config])

  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagramRef.current) {
        console.log("[v0] Diagram ref not ready yet")
        return
      }

      if (components.length === 0) {
        console.log("[v0] No components to render")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Generate the multi-level model
        const multiModel = createMultiLevelAtlassianC4Model(components, integrations, config.title)
        const selectedModel = multiModel[selectedLevel]

        setCurrentModel(selectedModel)

        const svgDiagram = generateSVGDiagram(selectedModel)

        if (diagramRef.current) {
          diagramRef.current.innerHTML = svgDiagram
        }
        setIsLoading(false)
      } catch (err) {
        console.error("[v0] Diagram rendering error:", err)
        setError(err instanceof Error ? err.message : "Failed to render diagram")

        if (diagramRef.current) {
          diagramRef.current.innerHTML = `
            <div class="p-8 text-center text-gray-500">
              <p class="mb-2">Diagram rendering failed</p>
              <p class="text-sm">${err instanceof Error ? err.message : "Unknown error"}</p>
              <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                Retry
              </button>
            </div>
          `
        }
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      renderDiagram()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [components, integrations, config, selectedLevel, refreshKey])

  const generateSVGDiagram = (model: any): string => {
    const elements = model.elements || []
    const relationships = model.relationships || []

    // Calculate layout
    const boxWidth = 200
    const boxHeight = 120
    const spacing = 80
    const cols = Math.ceil(Math.sqrt(elements.length))
    const rows = Math.ceil(elements.length / cols)

    const svgWidth = Math.max(800, cols * (boxWidth + spacing) + spacing)
    const svgHeight = Math.max(600, rows * (boxHeight + spacing) + spacing + 100) // Extra space for title

    // Color scheme for different element types
    const colors = {
      person: { bg: "#08427b", border: "#073b6f", text: "#ffffff" },
      system: { bg: "#1168bd", border: "#0b4884", text: "#ffffff" },
      container: { bg: "#438dd5", border: "#2563eb", text: "#ffffff" },
      component: { bg: "#85bbf0", border: "#3b82f6", text: "#000000" },
      external: { bg: "#ffffff", border: "#6b7280", text: "#000000" },
    }

    let svg = `
      <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .element-box { stroke-width: 2; }
            .element-text { font-family: Arial, sans-serif; text-anchor: middle; dominant-baseline: middle; }
            .title-text { font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; text-anchor: middle; }
            .relationship-line { stroke: #666; stroke-width: 2; marker-end: url(#arrowhead); }
            .relationship-text { font-family: Arial, sans-serif; font-size: 12px; text-anchor: middle; fill: #666; }
          </style>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>
        
        <!-- Title -->
        <text x="${svgWidth / 2}" y="40" class="title-text" fill="#333">${model.title}</text>
    `

    // Position elements in a grid
    const elementPositions: Record<string, { x: number; y: number }> = {}

    elements.forEach((element: any, index: number) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = spacing + col * (boxWidth + spacing)
      const y = 80 + spacing + row * (boxHeight + spacing) // 80px offset for title

      elementPositions[element.id] = { x, y }

      const elementType = element.type || "system"
      const color = colors[elementType as keyof typeof colors] || colors.system

      // Draw element box
      svg += `
        <rect x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" 
              fill="${color.bg}" stroke="${color.border}" class="element-box" rx="8" />
        
        <!-- Element name -->
        <text x="${x + boxWidth / 2}" y="${y + 30}" class="element-text" 
              fill="${color.text}" fontSize="14" fontWeight="bold">
          ${element.name}
        </text>
        
        <!-- Element description -->
        <text x="${x + boxWidth / 2}" y="${y + 50}" class="element-text" 
              fill="${color.text}" fontSize="11">
          ${element.description}
        </text>
        
        <!-- Element technology -->
        ${
          element.technology
            ? `
          <text x="${x + boxWidth / 2}" y="${y + 70}" class="element-text" 
                fill="${color.text}" fontSize="10" opacity="0.8">
            ${element.technology}
          </text>
        `
            : ""
        }
      `
    })

    // Draw relationships
    relationships.forEach((rel: any) => {
      const fromPos = elementPositions[rel.from]
      const toPos = elementPositions[rel.to]

      if (fromPos && toPos) {
        // Calculate connection points (center of boxes)
        const fromX = fromPos.x + boxWidth / 2
        const fromY = fromPos.y + boxHeight / 2
        const toX = toPos.x + boxWidth / 2
        const toY = toPos.y + boxHeight / 2

        // Calculate midpoint for label
        const midX = (fromX + toX) / 2
        const midY = (fromY + toY) / 2

        svg += `
          <line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" class="relationship-line" />
          <text x="${midX}" y="${midY - 5}" class="relationship-text">
            ${rel.description}
          </text>
        `
      }
    })

    svg += "</svg>"
    return svg
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleDownloadPDF = async () => {
    if (!diagramRef.current) {
      console.error("[v0] Diagram ref not available for PDF generation")
      return
    }

    if (!currentModel) {
      console.error("[v0] No current model for PDF generation")
      return
    }

    setIsGeneratingPDF(true)
    try {
      // Dynamically import the PDF generation libraries
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).jsPDF

      // Get the diagram container
      const diagramElement = diagramRef.current
      const svgElement = diagramElement.querySelector("svg")

      if (!svgElement) {
        throw new Error("No diagram found to export")
      }

      const tempContainer = document.createElement("div")
      tempContainer.style.backgroundColor = "#ffffff"
      tempContainer.style.padding = "20px"
      tempContainer.style.position = "absolute"
      tempContainer.style.left = "-9999px"
      tempContainer.style.top = "0"
      tempContainer.appendChild(svgElement.cloneNode(true))
      document.body.appendChild(tempContainer)

      const canvas = await html2canvas(tempContainer, {
        backgroundColor: "#ffffff",
        scale: 4.17, // 600dpi / 144dpi (default) = 4.17x scale for 600dpi
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      // Clean up temporary container
      document.body.removeChild(tempContainer)

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "landscape", // 17x11 is typically landscape
        unit: "in", // Use inches for precise sizing
        format: [17, 11], // 17 inches wide by 11 inches tall
      })

      // Calculate scaling to fit the image within the 17x11 format
      const pdfWidth = 17
      const pdfHeight = 11
      const imgAspectRatio = canvas.width / canvas.height
      const pdfAspectRatio = pdfWidth / pdfHeight

      let finalWidth, finalHeight, xOffset, yOffset

      if (imgAspectRatio > pdfAspectRatio) {
        // Image is wider relative to PDF, fit to width
        finalWidth = pdfWidth
        finalHeight = pdfWidth / imgAspectRatio
        xOffset = 0
        yOffset = (pdfHeight - finalHeight) / 2
      } else {
        // Image is taller relative to PDF, fit to height
        finalHeight = pdfHeight
        finalWidth = pdfHeight * imgAspectRatio
        xOffset = (pdfWidth - finalWidth) / 2
        yOffset = 0
      }

      pdf.addImage(imgData, "PNG", xOffset, yOffset, finalWidth, finalHeight)

      // Generate filename
      const levelTitles = {
        landscape: "System-Landscape",
        context: "System-Context",
        container: "Container",
        component: "Component",
        code: "Code",
      }

      const filename = `${config.title.toLowerCase().replace(/\s+/g, "-")}-${levelTitles[selectedLevel]}-diagram.pdf`
      pdf.save(filename)
    } catch (error) {
      console.error("[v0] PDF generation error:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
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

          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isLoading || isGeneratingPDF || components.length === 0}
          >
            <Download className={`h-4 w-4 ${isGeneratingPDF ? "animate-pulse" : ""}`} />
            {isGeneratingPDF ? "Generating..." : "PDF"}
          </Button>
        </div>
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
            ref={diagramRef}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#08427b] rounded border-2 border-[#073b6f] flex-shrink-0"></div>
            <span className="whitespace-nowrap">Person/Actor</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#1168bd] border-2 border-[#0b4884] flex-shrink-0"></div>
            <span className="whitespace-nowrap">Software System</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#438dd5] border-2 border-[#2563eb] flex-shrink-0"></div>
            <span className="whitespace-nowrap">Container</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#85bbf0] border-2 border-[#3b82f6] flex-shrink-0"></div>
            <span className="whitespace-nowrap">Component</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-gray-400 bg-white flex-shrink-0"></div>
            <span className="whitespace-nowrap">External System</span>
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
