"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Clock,
  BarChart3,
  Code,
  Workflow,
  Target,
  Link,
  Eye,
  Shield,
  MessageSquare,
  Star,
  Download,
  Upload,
} from "lucide-react"

interface PluginComponent {
  id: string
  name: string
  description: string
  category: string
  technology: string
  vendor: string
  isPopular: boolean
  atlassianProducts: string[]
  businessFunction: string
  integrationPoints: string[]
}

interface PluginAsComponentsProps {
  selectedPlugins: string[]
  onSelectionChange: (plugins: string[]) => void
  customComponents: any[]
  onCustomComponentsChange: (components: any[]) => void
}

const categoryIcons = {
  "Testing & QA": Eye,
  "Time Tracking": Clock,
  "Reporting & Analytics": BarChart3,
  "Development & CI/CD": Code,
  "Workflow & Automation": Workflow,
  "Project Management": Target,
  "Integration & Connectivity": Link,
  Visualization: Package,
  "Security & Access": Shield,
  Communication: MessageSquare,
  Other: Package,
}

const categoryColors = {
  "Testing & QA": "bg-green-100 text-green-800 border-green-200",
  "Time Tracking": "bg-blue-100 text-blue-800 border-blue-200",
  "Reporting & Analytics": "bg-purple-100 text-purple-800 border-purple-200",
  "Development & CI/CD": "bg-orange-100 text-orange-800 border-orange-200",
  "Workflow & Automation": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Project Management": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Integration & Connectivity": "bg-cyan-100 text-cyan-800 border-cyan-200",
  Visualization: "bg-pink-100 text-pink-800 border-pink-200",
  "Security & Access": "bg-red-100 text-red-800 border-red-200",
  Communication: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Other: "bg-gray-100 text-gray-800 border-gray-200",
}

const defaultPluginComponents: PluginComponent[] = [
  {
    id: "scriptrunner",
    name: "ScriptRunner for Jira",
    description: "Automation and customization toolkit for Jira administrators",
    category: "Workflow & Automation",
    technology: "Groovy Scripts",
    vendor: "Adaptavist",
    isPopular: true,
    atlassianProducts: ["Jira Software", "Jira Service Management"],
    businessFunction: "Process Optimization",
    integrationPoints: ["Workflow", "Custom Fields", "Automation", "JQL"],
  },
  {
    id: "xray",
    name: "Xray Test Management",
    description: "Native test management solution for Jira",
    category: "Testing & QA",
    technology: "Test Management",
    vendor: "Xpand IT",
    isPopular: true,
    atlassianProducts: ["Jira Software"],
    businessFunction: "Quality Assurance",
    integrationPoints: ["Issue Management", "Workflow", "Dashboard"],
  },
  {
    id: "tempo",
    name: "Tempo Timesheets",
    description: "AI-powered time tracking and project management",
    category: "Time Tracking",
    technology: "Time Tracking",
    vendor: "Tempo",
    isPopular: true,
    atlassianProducts: ["Jira Software", "Jira Service Management"],
    businessFunction: "Resource Management",
    integrationPoints: ["Custom Fields", "Dashboard", "REST API"],
  },
  {
    id: "structure",
    name: "Structure by Tempo",
    description: "Portfolio and project management for Jira",
    category: "Project Management",
    technology: "Portfolio Management",
    vendor: "Tempo",
    isPopular: true,
    atlassianProducts: ["Jira Software"],
    businessFunction: "Project Delivery",
    integrationPoints: ["Project Management", "Dashboard", "JQL"],
  },
  {
    id: "eazybi",
    name: "eazyBI Reports",
    description: "Advanced reporting and analytics for Jira",
    category: "Reporting & Analytics",
    technology: "Business Intelligence",
    vendor: "eazyBI",
    isPopular: true,
    atlassianProducts: ["Jira Software", "Jira Service Management"],
    businessFunction: "Business Intelligence",
    integrationPoints: ["Dashboard", "REST API", "Custom Fields"],
  },
  {
    id: "github",
    name: "GitHub for Jira",
    description: "Connect your GitHub repositories to Jira for seamless development workflow",
    category: "Development & CI/CD",
    technology: "Git Integration",
    vendor: "GitHub",
    isPopular: true,
    atlassianProducts: ["Jira Software"],
    businessFunction: "Development Workflow",
    integrationPoints: ["Issue Management", "Workflow", "REST API"],
  },
  {
    id: "figma",
    name: "Figma for Jira",
    description: "Embed Figma designs directly in Jira issues for better design collaboration",
    category: "Visualization",
    technology: "Design Integration",
    vendor: "Figma",
    isPopular: true,
    atlassianProducts: ["Jira Software"],
    businessFunction: "Design Collaboration",
    integrationPoints: ["Issue Management", "Custom Fields"],
  },
  {
    id: "gitlab",
    name: "GitLab for Jira",
    description: "Integrate GitLab repositories with Jira for complete DevOps visibility",
    category: "Development & CI/CD",
    technology: "Git Integration",
    vendor: "GitLab",
    isPopular: true,
    atlassianProducts: ["Jira Software"],
    businessFunction: "DevOps Integration",
    integrationPoints: ["Issue Management", "Workflow", "REST API"],
  },
  {
    id: "zephyr",
    name: "Zephyr Scale",
    description: "Enterprise test management solution for Jira",
    category: "Testing & QA",
    technology: "Test Management",
    vendor: "SmartBear",
    isPopular: true,
    atlassianProducts: ["Jira Software"],
    businessFunction: "Quality Assurance",
    integrationPoints: ["Issue Management", "Workflow", "Dashboard"],
  },
  {
    id: "teams",
    name: "Microsoft Teams for Jira",
    description: "Collaborate on Jira issues directly from Microsoft Teams",
    category: "Communication",
    technology: "Chat Integration",
    vendor: "Microsoft",
    isPopular: true,
    atlassianProducts: ["Jira Software", "Jira Service Management"],
    businessFunction: "Team Collaboration",
    integrationPoints: ["Issue Management", "Webhooks"],
  },
]

export function PluginAsComponents({
  selectedPlugins,
  onSelectionChange,
  customComponents,
  onCustomComponentsChange,
}: PluginAsComponentsProps) {
  const [pluginComponents, setPluginComponents] = useState<PluginComponent[]>(defaultPluginComponents)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPlugin, setEditingPlugin] = useState<PluginComponent | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showPopularOnly, setShowPopularOnly] = useState(false)

  useEffect(() => {
    const pluginAsCustomComponents = pluginComponents.map((plugin) => ({
      id: plugin.id,
      name: plugin.name,
      description: plugin.description,
      type: "plugin",
      category: plugin.category,
      technology: plugin.technology,
      vendor: plugin.vendor,
      isCustom: true,
    }))

    // Merge with existing custom components, avoiding duplicates
    const existingNonPlugins = customComponents.filter((comp) => comp.type !== "plugin")
    const updatedCustomComponents = [...existingNonPlugins, ...pluginAsCustomComponents]
    onCustomComponentsChange(updatedCustomComponents)
  }, [pluginComponents])

  useEffect(() => {
    const loadPluginsFromFile = async () => {
      try {
        const response = await fetch("/data/atlassian-plugins.json")
        if (response.ok) {
          const plugins = await response.json()
          if (Array.isArray(plugins) && plugins.length > 0) {
            console.log("[v0] Loaded plugins from JSON file:", plugins.length)
            setPluginComponents(plugins)
          }
        }
      } catch (error) {
        console.log("[v0] Failed to load plugins from JSON, using defaults:", error)
      }
    }

    loadPluginsFromFile()
  }, [])

  const filteredPlugins = pluginComponents.filter((plugin) => {
    const matchesSearch =
      plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.vendor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || plugin.category === selectedCategory

    const matchesPopular = !showPopularOnly || plugin.isPopular

    return matchesSearch && matchesCategory && matchesPopular
  })

  const categories = [...new Set(pluginComponents.map((p) => p.category))].sort()

  const handlePluginToggle = (pluginId: string) => {
    const newSelection = selectedPlugins.includes(pluginId)
      ? selectedPlugins.filter((id) => id !== pluginId)
      : [...selectedPlugins, pluginId]
    onSelectionChange(newSelection)
  }

  const handleAddPlugin = (plugin: Omit<PluginComponent, "id">) => {
    const newPlugin: PluginComponent = {
      ...plugin,
      id: `custom_${Date.now()}`,
    }
    setPluginComponents([...pluginComponents, newPlugin])
    setIsAddDialogOpen(false)
  }

  const handleEditPlugin = (plugin: PluginComponent) => {
    setPluginComponents(pluginComponents.map((p) => (p.id === plugin.id ? plugin : p)))
    setEditingPlugin(null)
  }

  const handleDeletePlugin = (pluginId: string) => {
    setPluginComponents(pluginComponents.filter((p) => p.id !== pluginId))
    onSelectionChange(selectedPlugins.filter((id) => id !== pluginId))
  }

  const handleExportPlugins = () => {
    const dataStr = JSON.stringify(pluginComponents, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "atlassian-plugins.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleImportPlugins = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedPlugins = JSON.parse(e.target?.result as string)
          if (Array.isArray(importedPlugins)) {
            // Validate plugin structure
            const validPlugins = importedPlugins.filter(
              (plugin) => plugin.id && plugin.name && plugin.description && plugin.category,
            )
            console.log("[v0] Imported plugins:", validPlugins.length)
            setPluginComponents(validPlugins)
          } else {
            console.error("[v0] Invalid plugin data format - expected array")
          }
        } catch (error) {
          console.error("[v0] Failed to import plugins:", error)
          alert("Failed to import plugins. Please check the file format.")
        }
      }
      reader.readAsText(file)
    }
    // Reset the input
    event.target.value = ""
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Plugin Components</h3>
          <p className="text-sm text-muted-foreground">Manage Atlassian marketplace plugins as custom components</p>
        </div>
        <div className="flex gap-2">
          <input type="file" accept=".json" onChange={handleImportPlugins} className="hidden" id="import-plugins" />
          <Button variant="outline" size="sm" onClick={() => document.getElementById("import-plugins")?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPlugins}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Plugin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <PluginForm onSubmit={handleAddPlugin} onCancel={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <Input placeholder="Search plugins..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Checkbox checked={showPopularOnly} onCheckedChange={setShowPopularOnly} />
            <span className="text-sm">Popular only</span>
          </div>

          <Badge variant="outline">{selectedPlugins.length} selected</Badge>
        </div>
      </div>

      {/* Plugins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlugins.map((plugin) => {
          const isSelected = selectedPlugins.includes(plugin.id)
          const Icon = categoryIcons[plugin.category as keyof typeof categoryIcons] || Package
          const colorClass =
            categoryColors[plugin.category as keyof typeof categoryColors] ||
            "bg-gray-100 text-gray-800 border-gray-200"

          return (
            <Card
              key={plugin.id}
              className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={isSelected} onCheckedChange={() => handlePluginToggle(plugin.id)} />
                    <div className="p-2 rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {plugin.isPopular && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setEditingPlugin(plugin)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePlugin(plugin.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-sm font-medium leading-tight">{plugin.name}</CardTitle>
                  <Badge className={`text-xs mt-1 ${colorClass}`}>{plugin.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground line-clamp-2">{plugin.description}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs">
                    <strong>Vendor:</strong> {plugin.vendor}
                  </p>
                  <p className="text-xs">
                    <strong>Technology:</strong> {plugin.technology}
                  </p>
                  <p className="text-xs">
                    <strong>Products:</strong> {plugin.atlassianProducts.join(", ")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit Dialog */}
      {editingPlugin && (
        <Dialog open={!!editingPlugin} onOpenChange={() => setEditingPlugin(null)}>
          <DialogContent className="max-w-2xl">
            <PluginForm plugin={editingPlugin} onSubmit={handleEditPlugin} onCancel={() => setEditingPlugin(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface PluginFormProps {
  plugin?: PluginComponent
  onSubmit: (plugin: PluginComponent | Omit<PluginComponent, "id">) => void
  onCancel: () => void
}

function PluginForm({ plugin, onSubmit, onCancel }: PluginFormProps) {
  const [formData, setFormData] = useState({
    name: plugin?.name || "",
    description: plugin?.description || "",
    category: plugin?.category || "Other",
    technology: plugin?.technology || "",
    vendor: plugin?.vendor || "",
    isPopular: plugin?.isPopular || false,
    atlassianProducts: plugin?.atlassianProducts || [],
    businessFunction: plugin?.businessFunction || "",
    integrationPoints: plugin?.integrationPoints || [],
  })

  const categories = Object.keys(categoryIcons)
  const atlassianProducts = ["Jira Software", "Jira Service Management", "Confluence", "Bitbucket"]
  const integrationOptions = [
    "Workflow",
    "Custom Fields",
    "Dashboard",
    "REST API",
    "Webhooks",
    "Automation",
    "JQL",
    "Issue Management",
    "Project Management",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (plugin) {
      onSubmit({ ...plugin, ...formData })
    } else {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{plugin ? "Edit Plugin" : "Add New Plugin"}</DialogTitle>
        <DialogDescription>
          {plugin ? "Update plugin details" : "Add a new Atlassian marketplace plugin"}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Plugin Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="vendor">Vendor</Label>
          <Input
            id="vendor"
            value={formData.vendor}
            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="technology">Technology</Label>
          <Input
            id="technology"
            value={formData.technology}
            onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>Atlassian Products</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {atlassianProducts.map((product) => (
            <div key={product} className="flex items-center space-x-2">
              <Checkbox
                checked={formData.atlassianProducts.includes(product)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData({
                      ...formData,
                      atlassianProducts: [...formData.atlassianProducts, product],
                    })
                  } else {
                    setFormData({
                      ...formData,
                      atlassianProducts: formData.atlassianProducts.filter((p) => p !== product),
                    })
                  }
                }}
              />
              <Label className="text-sm">{product}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Integration Points</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {integrationOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                checked={formData.integrationPoints.includes(option)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData({
                      ...formData,
                      integrationPoints: [...formData.integrationPoints, option],
                    })
                  } else {
                    setFormData({
                      ...formData,
                      integrationPoints: formData.integrationPoints.filter((p) => p !== option),
                    })
                  }
                }}
              />
              <Label className="text-sm">{option}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          checked={formData.isPopular}
          onCheckedChange={(checked) => setFormData({ ...formData, isPopular: !!checked })}
        />
        <Label>Mark as popular plugin</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{plugin ? "Update" : "Add"} Plugin</Button>
      </DialogFooter>
    </form>
  )
}
