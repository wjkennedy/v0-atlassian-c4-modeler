"use client"

import React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Palette,
  Download,
  Shield,
  Database,
  Plus,
  Trash2,
  Edit,
  Upload,
  FileDown,
  Server,
  Cloud,
  Users,
  Mail,
  FileText,
  BarChart3,
  Zap,
  Lock,
  GitBranch,
  Smartphone,
  Monitor,
  Workflow,
  Brain,
  CreditCard,
  MessageCircle,
  Video,
  Headphones,
  Target,
  Search,
  Globe,
  MessageSquare,
  Building,
  Calendar,
  Copy,
  CheckCircle,
  Layers,
  Moon,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"
import { createAtlassianC4Model, createMultiLevelAtlassianC4Model } from "@/lib/c4-generator"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComponentsUpdate?: (components: any[]) => void
  onIntegrationsUpdate?: (integrations: any[]) => void
  selectedComponents?: string[]
  selectedIntegrations?: string[]
  config?: {
    title: string
    level: string
    theme: string
  }
}

const iconMap = {
  Server,
  Cloud,
  Users,
  Mail,
  FileText,
  BarChart3,
  Zap,
  Lock,
  GitBranch,
  Smartphone,
  Monitor,
  Workflow,
  Brain,
  CreditCard,
  MessageCircle,
  Video,
  Headphones,
  Target,
  Search,
  Globe,
  MessageSquare,
  Building,
  Calendar,
  Database,
  Shield,
  Settings,
}

export function SettingsModal({
  open,
  onOpenChange,
  onComponentsUpdate,
  onIntegrationsUpdate,
  selectedComponents = [],
  selectedIntegrations = [],
  config = { title: "Atlassian Architecture", level: "container", theme: "professional" },
}: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    // General Settings
    organizationName: "Atlassian Solution Partners",
    defaultDiagramTitle: "Atlassian Cloud Architecture",
    autoSave: true,
    showGridLines: true,
    darkMode: theme === "dark",

    // Diagram Settings
    defaultTheme: "professional",
    defaultLevel: "container",
    includeTimestamps: true,
    showLegend: true,

    // Export Settings
    defaultFormat: "plantuml",
    includeMetadata: true,
    compressOutput: false,
    generateAllLevels: false,
    selectedLevel: "context",

    // Security Settings
    enableAuditLog: true,
    requireApproval: false,
    encryptExports: false,
  })

  const [exportFormat, setExportFormat] = useState("plantuml")
  const [copied, setCopied] = useState(false)
  const [generateAllLevels, setGenerateAllLevels] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState("context")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const [customComponents, setCustomComponents] = useState<any[]>([])
  const [customIntegrations, setCustomIntegrations] = useState<any[]>([])
  const [newComponent, setNewComponent] = useState({
    name: "",
    description: "",
    category: "",
    icon: "Server",
    color: "bg-blue-500",
  })
  const [newIntegration, setNewIntegration] = useState({
    name: "",
    description: "",
    category: "",
    icon: "Server",
    color: "bg-blue-500",
  })
  const [editingComponent, setEditingComponent] = useState<any>(null)
  const [editingIntegration, setEditingIntegration] = useState<any>(null)

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))

    if (key === "darkMode") {
      setTheme(value ? "dark" : "light")
    }
  }

  const addComponent = () => {
    if (newComponent.name && newComponent.description) {
      const component = {
        id: `custom-${Date.now()}`,
        ...newComponent,
      }
      const updated = [...customComponents, component]
      setCustomComponents(updated)
      onComponentsUpdate?.(updated)
      setNewComponent({ name: "", description: "", category: "", icon: "Server", color: "bg-blue-500" })
    }
  }

  const updateComponent = (id: string, updates: any) => {
    const updated = customComponents.map((c) => (c.id === id ? { ...c, ...updates } : c))
    setCustomComponents(updated)
    onComponentsUpdate?.(updated)
    setEditingComponent(null)
  }

  const deleteComponent = (id: string) => {
    const updated = customComponents.filter((c) => c.id !== id)
    setCustomComponents(updated)
    onComponentsUpdate?.(updated)
  }

  const addIntegration = () => {
    if (newIntegration.name && newIntegration.description) {
      const integration = {
        id: `custom-${Date.now()}`,
        ...newIntegration,
      }
      const updated = [...customIntegrations, integration]
      setCustomIntegrations(updated)
      onIntegrationsUpdate?.(updated)
      setNewIntegration({ name: "", description: "", category: "", icon: "Server", color: "bg-blue-500" })
    }
  }

  const updateIntegration = (id: string, updates: any) => {
    const updated = customIntegrations.map((i) => (i.id === id ? { ...i, ...updates } : i))
    setCustomIntegrations(updated)
    onIntegrationsUpdate?.(updated)
    setEditingIntegration(null)
  }

  const deleteIntegration = (id: string) => {
    const updated = customIntegrations.filter((i) => i.id !== id)
    setCustomIntegrations(updated)
    onIntegrationsUpdate?.(updated)
  }

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

  const handleCopy = async () => {
    const markup = generateC4Markup()
    await navigator.clipboard.writeText(markup)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const markup = generateC4Markup()
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

  const handleExportPDF = async () => {
    if (selectedComponents.length === 0) return

    setIsGeneratingPDF(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).jsPDF

      const markup = generateC4Markup()

      if (exportFormat === "mermaid") {
        const tempContainer = document.createElement("div")
        tempContainer.style.position = "absolute"
        tempContainer.style.left = "-9999px"
        tempContainer.style.top = "-9999px"
        tempContainer.style.width = "1200px"
        tempContainer.style.backgroundColor = "#ffffff"
        tempContainer.style.padding = "20px"
        document.body.appendChild(tempContainer)

        try {
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

          const diagramId = `pdf-export-${Date.now()}`
          const { svg } = await mermaid.render(diagramId, markup)

          tempContainer.innerHTML = svg

          const canvas = await html2canvas(tempContainer, {
            backgroundColor: "#ffffff",
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
          })

          const imgData = canvas.toDataURL("image/png")
          const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? "landscape" : "portrait",
            unit: "px",
            format: [canvas.width, canvas.height],
          })

          pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)

          const levelSuffix = generateAllLevels ? "-all-levels" : `-${selectedLevel}`
          const filename = `${config.title.toLowerCase().replace(/\s+/g, "-")}${levelSuffix}-diagram.pdf`
          pdf.save(filename)
        } finally {
          document.body.removeChild(tempContainer)
        }
      } else {
        const pdf = new jsPDF()
        const lines = markup.split("\n")
        let yPosition = 20

        pdf.setFontSize(16)
        pdf.text(`${config.title} - C4 Model`, 20, yPosition)
        yPosition += 20

        pdf.setFontSize(10)
        lines.forEach((line) => {
          if (yPosition > 280) {
            pdf.addPage()
            yPosition = 20
          }
          pdf.text(line, 20, yPosition)
          yPosition += 5
        })

        const levelSuffix = generateAllLevels ? "-all-levels" : `-${selectedLevel}`
        const filename = `${config.title.toLowerCase().replace(/\s+/g, "-")}${levelSuffix}-markup.pdf`
        pdf.save(filename)
      }
    } catch (error) {
      console.error("[v0] PDF export error:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const exportData = () => {
    const data = {
      components: customComponents,
      integrations: customIntegrations,
      settings,
      selectedComponents,
      selectedIntegrations,
      config,
      diagrams: {
        markup: generateC4Markup(),
        format: exportFormat,
        allLevels: generateAllLevels,
        selectedLevel,
      },
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `c4-generator-full-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.components) {
            setCustomComponents(data.components)
            onComponentsUpdate?.(data.components)
          }
          if (data.integrations) {
            setCustomIntegrations(data.integrations)
            onIntegrationsUpdate?.(data.integrations)
          }
          if (data.settings) {
            setSettings((prev) => ({ ...prev, ...data.settings }))
          }
          if (data.diagrams) {
            setExportFormat(data.diagrams.format || "plantuml")
            setGenerateAllLevels(data.diagrams.allLevels || false)
            setSelectedLevel(data.diagrams.selectedLevel || "context")
          }
        } catch (error) {
          console.error("Failed to import data:", error)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen !max-w-none overflow-y-auto p-6 rounded-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Settings & Data Management
          </DialogTitle>
          <DialogDescription>
            Configure your C4 Model Generator preferences, manage custom components, and handle data import/export
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="diagrams">Diagrams</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organization Settings</CardTitle>
                <CardDescription>Configure your organization details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      value={settings.organizationName}
                      onChange={(e) => handleSettingChange("organizationName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-title">Default Diagram Title</Label>
                    <Input
                      id="default-title"
                      value={settings.defaultDiagramTitle}
                      onChange={(e) => handleSettingChange("defaultDiagramTitle", e.target.value)}
                    />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-save Changes</Label>
                      <p className="text-sm text-muted-foreground">Automatically save configuration changes</p>
                    </div>
                    <Switch
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Grid Lines</Label>
                      <p className="text-sm text-muted-foreground">Display grid lines in diagram preview</p>
                    </div>
                    <Switch
                      checked={settings.showGridLines}
                      onCheckedChange={(checked) => handleSettingChange("showGridLines", checked)}
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    <div className="space-y-0.5">
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Configuration Management
                  </CardTitle>
                  <CardDescription>Import and export application settings and custom data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={exportData} variant="outline" className="flex items-center gap-2 bg-transparent">
                      <FileDown className="h-4 w-4" />
                      Export All Data
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={importData}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button variant="outline" className="w-full flex items-center gap-2 bg-transparent">
                        <Upload className="h-4 w-4" />
                        Import Data
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Export Includes:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Application settings and preferences</li>
                      <li>• Custom components and integrations</li>
                      <li>• Selected components and integrations</li>
                      <li>• Current diagram configuration</li>
                      <li>• Generated markup and export settings</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Current Data Summary
                  </CardTitle>
                  <CardDescription>Overview of your current configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-primary/5 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">{customComponents.length}</div>
                      <div className="text-xs text-muted-foreground">Custom Components</div>
                    </div>
                    <div className="p-3 bg-secondary/5 rounded-lg text-center">
                      <div className="text-2xl font-bold text-secondary">{customIntegrations.length}</div>
                      <div className="text-xs text-muted-foreground">Custom Integrations</div>
                    </div>
                    <div className="p-3 bg-accent/5 rounded-lg text-center">
                      <div className="text-2xl font-bold text-accent">{selectedComponents.length}</div>
                      <div className="text-xs text-muted-foreground">Selected Components</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <div className="text-2xl font-bold">{selectedIntegrations.length}</div>
                      <div className="text-xs text-muted-foreground">Selected Integrations</div>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Data Privacy</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All data is stored locally in your browser. Export files contain only your configuration data.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Diagram Export Options
                  </CardTitle>
                  <CardDescription>Generate and export C4 model diagrams</CardDescription>
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
                      <Label className="text-sm font-medium">Preview Level</Label>
                      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
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
                    <Label className="text-sm font-medium">Export Format</Label>
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

                  <Button
                    onClick={handleExportPDF}
                    className="w-full"
                    variant="secondary"
                    disabled={selectedComponents.length === 0 || isGeneratingPDF}
                  >
                    <FileDown className={`h-4 w-4 mr-2 ${isGeneratingPDF ? "animate-pulse" : ""}`} />
                    {isGeneratingPDF ? "Generating PDF..." : "Export as PDF"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generated Markup Preview</CardTitle>
                  <CardDescription>Preview and copy the generated diagram markup</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    value={
                      selectedComponents.length > 0 ? generateC4Markup() : "Select components to generate markup..."
                    }
                    readOnly
                    className="font-mono text-sm min-h-64"
                    placeholder="Generated markup will appear here..."
                  />
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Export Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Use PlantUML for professional documentation</li>
                      <li>• Choose Mermaid for GitHub integration</li>
                      <li>• Select Structurizr DSL for comprehensive modeling</li>
                      {generateAllLevels && <li>• "All Levels" generates complete C4 model hierarchy</li>}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="diagrams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Diagram Defaults
                </CardTitle>
                <CardDescription>Set default values for new diagrams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Theme</Label>
                    <Select
                      value={settings.defaultTheme}
                      onValueChange={(value) => handleSettingChange("defaultTheme", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="colorful">Colorful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Level</Label>
                    <Select
                      value={settings.defaultLevel}
                      onValueChange={(value) => handleSettingChange("defaultLevel", value)}
                    >
                      <SelectTrigger>
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
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Timestamps</Label>
                    <p className="text-sm text-muted-foreground">Add generation timestamp to diagrams</p>
                  </div>
                  <Switch
                    checked={settings.includeTimestamps}
                    onCheckedChange={(checked) => handleSettingChange("includeTimestamps", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Legend</Label>
                    <p className="text-sm text-muted-foreground">Display legend in generated diagrams</p>
                  </div>
                  <Switch
                    checked={settings.showLegend}
                    onCheckedChange={(checked) => handleSettingChange("showLegend", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Compliance
                </CardTitle>
                <CardDescription>Configure security and audit settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Audit Log</Label>
                    <p className="text-sm text-muted-foreground">Track all diagram generation activities</p>
                  </div>
                  <Switch
                    checked={settings.enableAuditLog}
                    onCheckedChange={(checked) => handleSettingChange("enableAuditLog", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Approval</Label>
                    <p className="text-sm text-muted-foreground">Require approval before exporting diagrams</p>
                  </div>
                  <Switch
                    checked={settings.requireApproval}
                    onCheckedChange={(checked) => handleSettingChange("requireApproval", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Encrypt Exports</Label>
                    <p className="text-sm text-muted-foreground">Encrypt exported diagram files</p>
                  </div>
                  <Switch
                    checked={settings.encryptExports}
                    onCheckedChange={(checked) => handleSettingChange("encryptExports", checked)}
                  />
                </div>
                <Separator />
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Data Storage</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All settings are stored locally in your browser. No data is transmitted to external servers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="components" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Custom Components
                </CardTitle>
                <CardDescription>Add and manage custom Atlassian components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Component Name</Label>
                    <Input
                      value={newComponent.name}
                      onChange={(e) => setNewComponent((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Custom Jira Plugin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={newComponent.category}
                      onChange={(e) => setNewComponent((prev) => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Custom Products"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newComponent.description}
                    onChange={(e) => setNewComponent((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the component"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Select
                      value={newComponent.icon}
                      onValueChange={(value) => setNewComponent((prev) => ({ ...prev, icon: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(iconMap).map((iconName) => (
                          <SelectItem key={iconName} value={iconName}>
                            {iconName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Select
                      value={newComponent.color}
                      onValueChange={(value) => setNewComponent((prev) => ({ ...prev, color: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bg-blue-500">Blue</SelectItem>
                        <SelectItem value="bg-green-500">Green</SelectItem>
                        <SelectItem value="bg-purple-500">Purple</SelectItem>
                        <SelectItem value="bg-orange-500">Orange</SelectItem>
                        <SelectItem value="bg-red-500">Red</SelectItem>
                        <SelectItem value="bg-yellow-500">Yellow</SelectItem>
                        <SelectItem value="bg-indigo-500">Indigo</SelectItem>
                        <SelectItem value="bg-pink-500">Pink</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addComponent} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Component
                </Button>

                <Separator />

                <div className="space-y-2">
                  <Label>Custom Components ({customComponents.length})</Label>
                  {customComponents.map((component) => (
                    <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${component.color} bg-opacity-10`}>
                          {React.createElement(iconMap[component.icon as keyof typeof iconMap] || Server, {
                            className: "h-4 w-4",
                          })}
                        </div>
                        <div>
                          <p className="font-medium">{component.name}</p>
                          <p className="text-sm text-muted-foreground">{component.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {component.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingComponent(component)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteComponent(component.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Custom Integrations
                </CardTitle>
                <CardDescription>Add and manage custom integrations and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Integration Name</Label>
                    <Input
                      value={newIntegration.name}
                      onChange={(e) => setNewIntegration((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Custom API Service"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={newIntegration.category}
                      onChange={(e) => setNewIntegration((prev) => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Custom Services"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newIntegration.description}
                    onChange={(e) => setNewIntegration((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the integration"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Select
                      value={newIntegration.icon}
                      onValueChange={(value) => setNewIntegration((prev) => ({ ...prev, icon: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(iconMap).map((iconName) => (
                          <SelectItem key={iconName} value={iconName}>
                            {iconName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Select
                      value={newIntegration.color}
                      onValueChange={(value) => setNewIntegration((prev) => ({ ...prev, color: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bg-blue-500">Blue</SelectItem>
                        <SelectItem value="bg-green-500">Green</SelectItem>
                        <SelectItem value="bg-purple-500">Purple</SelectItem>
                        <SelectItem value="bg-orange-500">Orange</SelectItem>
                        <SelectItem value="bg-red-500">Red</SelectItem>
                        <SelectItem value="bg-yellow-500">Yellow</SelectItem>
                        <SelectItem value="bg-indigo-500">Indigo</SelectItem>
                        <SelectItem value="bg-pink-500">Pink</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addIntegration} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Integration
                </Button>

                <Separator />

                <div className="space-y-2">
                  <Label>Custom Integrations ({customIntegrations.length})</Label>
                  {customIntegrations.map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${integration.color} bg-opacity-10`}>
                          {React.createElement(iconMap[integration.icon as keyof typeof iconMap] || Cloud, {
                            className: "h-4 w-4",
                          })}
                        </div>
                        <div>
                          <p className="font-medium">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {integration.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingIntegration(integration)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteIntegration(integration.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
