"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Copy, FileText, ImageIcon, Share2, CheckCircle, Layers } from "lucide-react"
import { createAtlassianC4Model, createMultiLevelAtlassianC4Model, type MultiLevelC4Model } from "@/lib/c4-generator"

interface ExportPanelProps {
  selectedComponents: string[]
  selectedIntegrations: string[]
  config: {
    title: string
    level: string
    theme: string
  }
}

export function ExportPanel({ selectedComponents, selectedIntegrations, config }: ExportPanelProps) {
  const [exportFormat, setExportFormat] = useState("plantuml")
  const [copied, setCopied] = useState(false)
  const [generateAllLevels, setGenerateAllLevels] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<keyof MultiLevelC4Model>("context")

  const generateC4Markup = () => {
    if (generateAllLevels) {
      const multiModel = createMultiLevelAtlassianC4Model(selectedComponents, selectedIntegrations, config.title)
      const selectedModel = multiModel[selectedLevel]

      const tempGenerator = {
        generatePlantUML: () => generatePlantUMLForModel(selectedModel),
        generateMermaid: () => generateMermaidForModel(selectedModel),
        generateStructurizr: () => generateStructurizrForModel(selectedModel),
      }

      switch (exportFormat) {
        case "plantuml":
          return tempGenerator.generatePlantUML()
        case "mermaid":
          return tempGenerator.generateMermaid()
        case "structurizr":
          return tempGenerator.generateStructurizr()
        default:
          return tempGenerator.generatePlantUML()
      }
    } else {
      const generator = createAtlassianC4Model(selectedComponents, selectedIntegrations, config)
      switch (exportFormat) {
        case "plantuml":
          return generator.generatePlantUML()
        case "mermaid":
          return generator.generateMermaid()
        case "structurizr":
          return generator.generateStructurizr()
        default:
          return generator.generatePlantUML()
      }
    }
  }

  const generatePlantUMLForModel = (model: any) => {
    const includeMap = {
      context: "C4_Context.puml",
      container: "C4_Container.puml",
      component: "C4_Component.puml",
      code: "C4_Component.puml",
      landscape: "C4_Landscape.puml",
    }

    let puml = `@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/${includeMap[model.level]}

title ${model.title} - ${model.level.charAt(0).toUpperCase() + model.level.slice(1)} Diagram
${model.description ? `\n!define DESCRIPTION ${model.description}` : ""}

`

    model.elements.forEach((element: any) => {
      const elementType = getPlantUMLElementType(element.type)
      const tech = element.technology ? `, "${element.technology}"` : ""
      puml += `${elementType}(${element.id}, "${element.name}"${tech}, "${element.description}")
`
    })

    puml += `
`

    model.relationships.forEach((rel: any) => {
      const tech = rel.technology ? `, "${rel.technology}"` : ""
      puml += `Rel(${rel.from}, ${rel.to}, "${rel.description}"${tech})
`
    })

    puml += `
@enduml`
    return puml
  }

  const generateMermaidForModel = (model: any) => {
    let mermaid = `---
title: ${model.title} - ${model.level.charAt(0).toUpperCase() + model.level.slice(1)} Diagram
---
graph TD

`

    model.elements.forEach((element: any) => {
      const shape = getMermaidShape(element.type)
      const tech = element.technology ? `<br/><i>${element.technology}</i>` : ""
      mermaid += `    ${element.id}${shape.replace("${type}", `${element.name}${tech}<br/>${element.description}`)}
`
    })

    mermaid += `
`

    model.relationships.forEach((rel: any) => {
      const tech = rel.technology ? ` (${rel.technology})` : ""
      mermaid += `    ${rel.from} -->|${rel.description}${tech}| ${rel.to}
`
    })

    mermaid += `
    classDef person fill:#08427b
    classDef system fill:#1168bd
    classDef container fill:#438dd5
    classDef component fill:#85bbf0
`

    model.elements.forEach((element: any) => {
      mermaid += `    class ${element.id} ${element.type}
`
    })

    return mermaid
  }

  const generateStructurizrForModel = (model: any) => {
    let dsl = `workspace "${model.title} - ${model.level.charAt(0).toUpperCase() + model.level.slice(1)} Diagram" {
    model {
`

    const people = model.elements.filter((e: any) => e.type === "person")
    const systems = model.elements.filter((e: any) => e.type === "system")
    const containers = model.elements.filter((e: any) => e.type === "container")

    people.forEach((person: any) => {
      dsl += `        ${person.id} = person "${person.name}" "${person.description}"
`
    })

    systems.forEach((system: any) => {
      dsl += `        ${system.id} = softwareSystem "${system.name}" "${system.description}"
`
    })

    if (containers.length > 0) {
      dsl += `        
        mainSystem = softwareSystem "${model.title}" {
`
      containers.forEach((container: any) => {
        const tech = container.technology ? ` "${container.technology}"` : ""
        dsl += `            ${container.id} = container "${container.name}"${tech} "${container.description}"
`
      })
      dsl += `        }
`
    }

    dsl += `
`

    model.relationships.forEach((rel: any) => {
      dsl += `        ${rel.from} -> ${rel.to} "${rel.description}"
`
    })

    dsl += `    }
    
    views {
        systemContext mainSystem {
            include *
            autoLayout
        }
        
        container mainSystem {
            include *
            autoLayout
        }
    }
}`

    return dsl
  }

  const getPlantUMLElementType = (type: string): string => {
    const typeMap = {
      person: "Person",
      system: "System",
      container: "Container",
      component: "Component",
      landscape: "System",
    }
    return typeMap[type as keyof typeof typeMap] || "Container"
  }

  const getMermaidShape = (type: string): string => {
    const shapeMap = {
      person: `["${type}"]`,
      system: `[${type}]`,
      container: `(${type})`,
      component: `{${type}}`,
      landscape: `[${type}]`,
    }
    return shapeMap[type as keyof typeof shapeMap] || `[${type}]`
  }

  const generateAllLevelsMarkup = () => {
    const multiModel = createMultiLevelAtlassianC4Model(selectedComponents, selectedIntegrations, config.title)
    let allMarkup = ""

    Object.entries(multiModel).forEach(([level, model]) => {
      allMarkup += `\n\n// ========== ${level.toUpperCase()} DIAGRAM ==========\n\n`

      const tempGenerator = {
        generatePlantUML: () => generatePlantUMLForModel(model),
        generateMermaid: () => generateMermaidForModel(model),
        generateStructurizr: () => generateStructurizrForModel(model),
      }

      switch (exportFormat) {
        case "plantuml":
          allMarkup += tempGenerator.generatePlantUML()
          break
        case "mermaid":
          allMarkup += tempGenerator.generateMermaid()
          break
        case "structurizr":
          allMarkup += tempGenerator.generateStructurizr()
          break
        default:
          allMarkup += tempGenerator.generatePlantUML()
      }
    })

    return allMarkup
  }

  const handleCopy = async () => {
    const markup = generateAllLevels ? generateAllLevelsMarkup() : generateC4Markup()
    await navigator.clipboard.writeText(markup)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const markup = generateAllLevels ? generateAllLevelsMarkup() : generateC4Markup()
    const extension = exportFormat === "plantuml" ? "puml" : exportFormat === "mermaid" ? "mmd" : "dsl"
    const levelSuffix = generateAllLevels ? "-all-levels" : `-${selectedLevel}`
    const filename = `${config.title.toLowerCase().replace(/\s+/g, "-")}${levelSuffix}.${extension}`

    const blob = new Blob([markup], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportImage = async () => {
    const markup = generateAllLevels ? generateAllLevelsMarkup() : generateC4Markup()

    if (exportFormat === "mermaid") {
      try {
        // Use local Mermaid rendering instead of external service
        const mermaid = (await import("mermaid")).default

        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor: "#0052cc",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#0052cc",
            lineColor: "#6b7280",
          },
        })

        const diagramId = `export-${Date.now()}`
        const { svg } = await mermaid.render(diagramId, markup)

        // Create a downloadable SVG file
        const blob = new Blob([svg], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${config.title.toLowerCase().replace(/\s+/g, "-")}-diagram.svg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error("[v0] Failed to render Mermaid diagram:", error)
        alert("Failed to render diagram. Please try again.")
      }
    } else if (exportFormat === "plantuml") {
      // For PlantUML, create a downloadable file instead of external link
      const blob = new Blob([markup], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${config.title.toLowerCase().replace(/\s+/g, "-")}-diagram.puml`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      // For other formats, download the markup file
      const extension = exportFormat === "structurizr" ? "dsl" : "txt"
      const blob = new Blob([markup], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${config.title.toLowerCase().replace(/\s+/g, "-")}-diagram.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const getFormatDescription = () => {
    const descriptions = {
      plantuml: "Industry-standard C4 model notation with PlantUML. Best for documentation and presentations.",
      mermaid: "Modern diagram-as-code format. Great for GitHub integration and local rendering.",
      structurizr: "Structurizr DSL format. Perfect for architecture modeling and multiple view generation.",
    }
    return descriptions[exportFormat as keyof typeof descriptions] || ""
  }

  return (
    <div className="space-y-6">
      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Generate All C4 Levels</span>
            </div>
            <Button
              variant={generateAllLevels ? "default" : "outline"}
              size="sm"
              onClick={() => setGenerateAllLevels(!generateAllLevels)}
            >
              {generateAllLevels ? "All Levels" : "Single Level"}
            </Button>
          </div>

          {generateAllLevels && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview Level</label>
              <Select
                value={selectedLevel}
                onValueChange={(value) => setSelectedLevel(value as keyof MultiLevelC4Model)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level to preview" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscape">Level 0: System Landscape</SelectItem>
                  <SelectItem value="context">Level 1: System Context</SelectItem>
                  <SelectItem value="container">Level 2: Container</SelectItem>
                  <SelectItem value="component">Level 3: Component</SelectItem>
                  <SelectItem value="code">Level 4: Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plantuml">
                  <div className="flex flex-col items-start">
                    <span>PlantUML C4 Model</span>
                    <span className="text-xs text-muted-foreground">Industry standard, great for docs</span>
                  </div>
                </SelectItem>
                <SelectItem value="mermaid">
                  <div className="flex flex-col items-start">
                    <span>Mermaid Diagram</span>
                    <span className="text-xs text-muted-foreground">Modern, GitHub compatible</span>
                  </div>
                </SelectItem>
                <SelectItem value="structurizr">
                  <div className="flex flex-col items-start">
                    <span>Structurizr DSL</span>
                    <span className="text-xs text-muted-foreground">Architecture modeling platform</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{getFormatDescription()}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Markup
            </Button>
            <Button variant="outline" onClick={handleCopy} className="flex-1 bg-transparent">
              {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview and Export Formats */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Markup</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="markup">Markup</TabsTrigger>
              <TabsTrigger value="export">Export Options</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-4">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Architecture Summary</h4>
                  {generateAllLevels && (
                    <div className="mb-3">
                      <Badge variant="outline" className="capitalize">
                        Previewing: {selectedLevel} Level
                      </Badge>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Components ({selectedComponents.length}):</span>
                      <div className="mt-1 space-y-1">
                        {selectedComponents.slice(0, 5).map((id) => {
                          const component = getComponentData(id)
                          return (
                            <Badge key={id} variant="outline" className="mr-1 mb-1">
                              {component?.name}
                            </Badge>
                          )
                        })}
                        {selectedComponents.length > 5 && (
                          <Badge variant="outline">+{selectedComponents.length - 5} more</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Integrations ({selectedIntegrations.length}):</span>
                      <div className="mt-1 space-y-1">
                        {selectedIntegrations.slice(0, 5).map((id) => {
                          const integration = getIntegrationData(id)
                          return (
                            <Badge key={id} variant="secondary" className="mr-1 mb-1">
                              {integration?.name}
                            </Badge>
                          )
                        })}
                        {selectedIntegrations.length > 5 && (
                          <Badge variant="secondary">+{selectedIntegrations.length - 5} more</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {selectedComponents.length + selectedIntegrations.length + 1}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Elements</div>
                  </div>
                  <div className="p-3 bg-secondary/5 rounded-lg">
                    <div className="text-2xl font-bold text-secondary">
                      {Math.max(selectedComponents.length + selectedIntegrations.length - 1, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Relationships</div>
                  </div>
                  <div className="p-3 bg-accent/5 rounded-lg">
                    <div className="text-2xl font-bold text-accent">{generateAllLevels ? "4" : "1"}</div>
                    <div className="text-xs text-muted-foreground">C4 Levels</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="markup" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="capitalize">
                      {exportFormat}
                    </Badge>
                    {generateAllLevels && <Badge variant="secondary">All Levels</Badge>}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <Textarea
                  value={generateAllLevels ? generateAllLevelsMarkup() : generateC4Markup()}
                  readOnly
                  className="font-mono text-sm min-h-64"
                  placeholder="Generated markup will appear here..."
                />
              </div>
            </TabsContent>

            <TabsContent value="export" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={handleExportImage}>
                    <ImageIcon className="h-6 w-6 mb-2" />
                    <span className="text-sm">{exportFormat === "mermaid" ? "Download SVG" : "Download File"}</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={handleDownload}>
                    <FileText className="h-6 w-6 mb-2" />
                    <span className="text-sm">Download Markup</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={handleCopy}>
                    <Share2 className="h-6 w-6 mb-2" />
                    <span className="text-sm">Copy to Clipboard</span>
                  </Button>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Export Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use PlantUML for professional documentation and presentations</li>
                    <li>• Choose Mermaid for GitHub README files and local rendering</li>
                    <li>• Select Structurizr DSL for comprehensive architecture modeling</li>
                    <li>• Mermaid diagrams render locally and can be exported as SVG images</li>
                    {generateAllLevels && (
                      <li>• "All Levels" generates Landscape, Context, Container, Component, and Code diagrams</li>
                    )}
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function getComponentData(id: string) {
  const components: Record<string, { id: string; name: string; description: string; color: string }> = {
    "jira-software": {
      id,
      name: "Jira Software",
      description: "Project management and issue tracking",
      color: "#0052cc",
    },
    "jira-service-management": {
      id,
      name: "Jira Service Management",
      description: "IT service management platform",
      color: "#36b37e",
    },
    confluence: { id, name: "Confluence", description: "Team collaboration and documentation", color: "#172b4d" },
    bitbucket: { id, name: "Bitbucket", description: "Git repository management", color: "#0052cc" },
    compass: { id, name: "Compass", description: "Developer experience platform", color: "#ff5630" },
    atlas: { id, name: "Atlas", description: "Team directory and insights", color: "#6554c0" },
    statuspage: { id, name: "Statuspage", description: "Status communication platform", color: "#00b8d9" },
    opsgenie: { id, name: "Opsgenie", description: "Incident management and alerting", color: "#ff5630" },
    "database-primary": { id, name: "Primary Database", description: "Main application database", color: "#6b7280" },
    "database-analytics": {
      id,
      name: "Analytics Database",
      description: "Data warehouse and analytics",
      color: "#f59e0b",
    },
  }
  return components[id]
}

function getIntegrationData(id: string) {
  const integrations: Record<string, { id: string; name: string; description: string; color: string }> = {
    servicenow: {
      id,
      name: "ServiceNow",
      description: "IT service management and workflow automation",
      color: "#62d84e",
    },
    salesforce: { id, name: "Salesforce", description: "Customer relationship management", color: "#00a1e0" },
    github: { id, name: "GitHub", description: "Code repository and collaboration", color: "#24292e" },
    okta: { id, name: "Okta", description: "Identity and access management", color: "#007dc1" },
    "azure-ad": { id, name: "Azure Active Directory", description: "Microsoft identity platform", color: "#0078d4" },
    slack: { id, name: "Slack", description: "Team communication and collaboration", color: "#4a154b" },
    "microsoft-teams": { id, name: "Microsoft Teams", description: "Unified communication platform", color: "#6264a7" },
    tableau: { id, name: "Tableau", description: "Business intelligence and analytics", color: "#e97627" },
    "power-bi": { id, name: "Power BI", description: "Microsoft business analytics", color: "#f2c811" },
    jenkins: { id, name: "Jenkins", description: "Continuous integration and deployment", color: "#d33833" },
    aws: { id, name: "Amazon Web Services", description: "Cloud infrastructure and services", color: "#ff9900" },
    azure: { id, name: "Microsoft Azure", description: "Cloud computing platform", color: "#0078d4" },
    "audit-framework": {
      id,
      name: "Audit Framework",
      description: "Compliance and audit trail management",
      color: "#6b7280",
    },
    "reporting-engine": {
      id,
      name: "Reporting Engine",
      description: "Custom reporting and analytics",
      color: "#10b981",
    },
    "automation-platform": {
      id,
      name: "Automation Platform",
      description: "Workflow and process automation",
      color: "#8b5cf6",
    },
    "work-item-classifier": {
      id,
      name: "Work Item Classifier",
      description: "AI-powered work item classification",
      color: "#6366f1",
    },
    "data-ingestion": {
      id,
      name: "Data Ingestion Service",
      description: "Custom data import and processing",
      color: "#06b6d4",
    },
  }
  return integrations[id]
}
