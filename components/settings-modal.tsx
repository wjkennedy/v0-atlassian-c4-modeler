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
} from "lucide-react"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComponentsUpdate?: (components: any[]) => void
  onIntegrationsUpdate?: (integrations: any[]) => void
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

export function SettingsModal({ open, onOpenChange, onComponentsUpdate, onIntegrationsUpdate }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    // General Settings
    organizationName: "Atlassian Solution Partners",
    defaultDiagramTitle: "Atlassian Cloud Architecture",
    autoSave: true,
    showGridLines: true,

    // Diagram Settings
    defaultTheme: "professional",
    defaultLevel: "container",
    includeTimestamps: true,
    showLegend: true,

    // Export Settings
    defaultFormat: "plantuml",
    includeMetadata: true,
    compressOutput: false,

    // Security Settings
    enableAuditLog: true,
    requireApproval: false,
    encryptExports: false,
  })

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

  const exportData = () => {
    const data = {
      components: customComponents,
      integrations: customIntegrations,
      settings,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `c4-generator-config-${new Date().toISOString().split("T")[0]}.json`
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
        } catch (error) {
          console.error("Failed to import data:", error)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Settings
          </DialogTitle>
          <DialogDescription>
            Configure your C4 Model Generator preferences and manage custom components
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="diagrams">Diagrams</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organization Settings</CardTitle>
                <CardDescription>Configure your organization details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <Separator />
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
                <Separator />
                <div className="flex gap-2">
                  <Button onClick={exportData} variant="outline" className="flex items-center gap-2 bg-transparent">
                    <FileDown className="h-4 w-4" />
                    Export Configuration
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                      <Upload className="h-4 w-4" />
                      Import Configuration
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Preferences
                </CardTitle>
                <CardDescription>Configure default export settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Export Format</Label>
                  <Select
                    value={settings.defaultFormat}
                    onValueChange={(value) => handleSettingChange("defaultFormat", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plantuml">PlantUML</SelectItem>
                      <SelectItem value="mermaid">Mermaid</SelectItem>
                      <SelectItem value="drawio">Draw.io</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Metadata</Label>
                    <p className="text-sm text-muted-foreground">Add generation metadata to exports</p>
                  </div>
                  <Switch
                    checked={settings.includeMetadata}
                    onCheckedChange={(checked) => handleSettingChange("includeMetadata", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compress Output</Label>
                    <p className="text-sm text-muted-foreground">Minimize exported file size</p>
                  </div>
                  <Switch
                    checked={settings.compressOutput}
                    onCheckedChange={(checked) => handleSettingChange("compressOutput", checked)}
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
