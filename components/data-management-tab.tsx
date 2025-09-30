"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Download, Upload, Database, Package, Link, RefreshCw, Server } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type {
  C4Catalog,
  ComponentDefinition,
  IntegrationDefinition,
  PluginDefinition,
  InternalDefinition,
} from "@/lib/c4-data-model"
import { defaultC4Catalog, exportCatalog, importCatalog, loadCatalogFromFile } from "@/lib/c4-data-model"

interface DataManagementTabProps {
  onCatalogUpdate?: (catalog: C4Catalog) => void
}

export function DataManagementTab({ onCatalogUpdate }: DataManagementTabProps) {
  const [catalog, setCatalog] = useState<C4Catalog>(defaultC4Catalog)
  const [jsonPreview, setJsonPreview] = useState("")
  const [selectedTab, setSelectedTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initializeCatalog() {
      setIsLoading(true)
      const savedCatalog = localStorage.getItem("c4-catalog")
      if (savedCatalog) {
        try {
          const parsed = JSON.parse(savedCatalog)
          setCatalog(parsed)
        } catch (error) {
          console.error("[v0] Failed to load saved catalog:", error)
          const fileCatalog = await loadCatalogFromFile()
          setCatalog(fileCatalog)
          localStorage.setItem("c4-catalog", JSON.stringify(fileCatalog))
        }
      } else {
        const fileCatalog = await loadCatalogFromFile()
        setCatalog(fileCatalog)
        localStorage.setItem("c4-catalog", JSON.stringify(fileCatalog))
      }
      setIsLoading(false)
    }
    initializeCatalog()
  }, [])

  const handleExportCatalog = () => {
    const dataStr = exportCatalog(catalog)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `c4-catalog-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleImportCatalog = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedCatalog = importCatalog(e.target?.result as string)
          setCatalog(importedCatalog)
          localStorage.setItem("c4-catalog", JSON.stringify(importedCatalog))
          onCatalogUpdate?.(importedCatalog)
          alert("Catalog imported successfully!")
        } catch (error) {
          console.error("[v0] Failed to import catalog:", error)
          alert("Failed to import catalog. Please check the file format.")
        }
      }
      reader.readAsText(file)
    }
    event.target.value = ""
  }

  const handleSaveCatalog = () => {
    try {
      const updatedCatalog = importCatalog(jsonPreview)
      setCatalog(updatedCatalog)
      localStorage.setItem("c4-catalog", jsonPreview)
      onCatalogUpdate?.(updatedCatalog)
      alert("Catalog saved successfully!")
    } catch (error) {
      console.error("[v0] Failed to save catalog:", error)
      alert("Failed to save catalog. Please check the JSON format.")
    }
  }

  const handleResetCatalog = async () => {
    if (confirm("Are you sure you want to reset to the default catalog? This will overwrite all custom changes.")) {
      const fileCatalog = await loadCatalogFromFile()
      setCatalog(fileCatalog)
      localStorage.setItem("c4-catalog", exportCatalog(fileCatalog))
      onCatalogUpdate?.(fileCatalog)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading catalog...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage your C4 model catalog with level-specific relationships
          </p>
        </div>
        <div className="flex gap-2">
          <input type="file" accept=".json" onChange={handleImportCatalog} className="hidden" id="import-catalog" />
          <Button variant="outline" onClick={() => document.getElementById("import-catalog")?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import Catalog
          </Button>
          <Button variant="outline" onClick={handleExportCatalog}>
            <Download className="h-4 w-4 mr-2" />
            Export Catalog
          </Button>
          <Button variant="outline" onClick={handleResetCatalog}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="components">
            <Database className="h-4 w-4 mr-2" />
            Components ({catalog.components.length})
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Link className="h-4 w-4 mr-2" />
            Integrations ({catalog.integrations.length})
          </TabsTrigger>
          <TabsTrigger value="plugins">
            <Package className="h-4 w-4 mr-2" />
            Plugins ({catalog.plugins.length})
          </TabsTrigger>
          <TabsTrigger value="internal">
            <Server className="h-4 w-4 mr-2" />
            Internal ({catalog.internal?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="json">JSON Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Catalog Overview</CardTitle>
              <CardDescription>Summary of your C4 model catalog</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Components</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{catalog.components.length}</div>
                    <p className="text-xs text-muted-foreground">Atlassian products</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Integrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{catalog.integrations.length}</div>
                    <p className="text-xs text-muted-foreground">External systems</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Plugins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{catalog.plugins.length}</div>
                    <p className="text-xs text-muted-foreground">Marketplace apps</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Internal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{catalog.internal?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Internal systems</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Catalog Information</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version:</span>
                    <Badge variant="outline">{catalog.version}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>{new Date(catalog.lastUpdated).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Level-Specific Relationships</h3>
                <p className="text-sm text-muted-foreground">
                  Each component, integration, and plugin can define different relationships for each C4 level:
                </p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {["Landscape", "Context", "Container", "Component", "Code", "Plugin"].map((level) => (
                    <Badge key={level} variant="secondary">
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Components</CardTitle>
              <CardDescription>Atlassian products with level-specific relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {catalog.components.map((component) => (
                  <ComponentCard key={component.id} component={component} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>External systems with level-specific relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {catalog.integrations.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plugins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plugins</CardTitle>
              <CardDescription>Marketplace apps with level-specific relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {catalog.plugins.map((plugin) => (
                  <PluginCard key={plugin.id} plugin={plugin} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="internal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Internal Systems</CardTitle>
              <CardDescription>Custom internal services with level-specific relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {catalog.internal && catalog.internal.length > 0 ? (
                  catalog.internal.map((internal) => <InternalCard key={internal.id} internal={internal} />)
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No internal systems defined. Add them via the JSON editor.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON Editor</CardTitle>
              <CardDescription>
                Edit the complete catalog JSON directly. Be careful - invalid JSON will not be saved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="json-editor">Catalog JSON</Label>
                <Textarea
                  id="json-editor"
                  value={jsonPreview}
                  onChange={(e) => setJsonPreview(e.target.value)}
                  className="font-mono text-xs h-[600px]"
                  placeholder="Catalog JSON..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveCatalog}>Save Changes</Button>
                <Button variant="outline" onClick={() => setJsonPreview(exportCatalog(catalog))}>
                  Reset to Current
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ComponentCard({ component }: { component: ComponentDefinition }) {
  const relationshipCounts = {
    landscape: component.relationships.landscape?.length || 0,
    context: component.relationships.context?.length || 0,
    container: component.relationships.container?.length || 0,
    component: component.relationships.component?.length || 0,
    code: component.relationships.code?.length || 0,
    plugin: component.relationships.plugin?.length || 0,
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{component.name}</CardTitle>
            <CardDescription className="text-sm">{component.description}</CardDescription>
          </div>
          <Badge>{component.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Technology:</span>
            <Badge variant="outline">{component.technology}</Badge>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Relationships by level:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(relationshipCounts).map(([level, count]) => (
                <Badge key={level} variant="secondary" className="text-xs">
                  {level}: {count}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function IntegrationCard({ integration }: { integration: IntegrationDefinition }) {
  const relationshipCounts = {
    landscape: integration.relationships.landscape?.length || 0,
    context: integration.relationships.context?.length || 0,
    container: integration.relationships.container?.length || 0,
    component: integration.relationships.component?.length || 0,
    code: integration.relationships.code?.length || 0,
    plugin: integration.relationships.plugin?.length || 0,
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{integration.name}</CardTitle>
            <CardDescription className="text-sm">{integration.description}</CardDescription>
          </div>
          <Badge>{integration.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Technology:</span>
            <Badge variant="outline">{integration.technology}</Badge>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Relationships by level:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(relationshipCounts).map(([level, count]) => (
                <Badge key={level} variant="secondary" className="text-xs">
                  {level}: {count}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PluginCard({ plugin }: { plugin: PluginDefinition }) {
  const relationshipCounts = {
    landscape: plugin.relationships.landscape?.length || 0,
    context: plugin.relationships.context?.length || 0,
    container: plugin.relationships.container?.length || 0,
    component: plugin.relationships.component?.length || 0,
    code: plugin.relationships.code?.length || 0,
    plugin: plugin.relationships.plugin?.length || 0,
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{plugin.name}</CardTitle>
            <CardDescription className="text-sm">{plugin.description}</CardDescription>
          </div>
          <div className="flex gap-1">
            {plugin.isPopular && <Badge variant="secondary">Popular</Badge>}
            <Badge>{plugin.category}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Vendor:</span>
            <span>{plugin.vendor}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Business Function:</span>
            <Badge variant="outline">{plugin.businessFunction}</Badge>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Integration Points:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {plugin.integrationPoints.map((point) => (
                <Badge key={point} variant="outline" className="text-xs">
                  {point}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Relationships by level:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(relationshipCounts).map(([level, count]) => (
                <Badge key={level} variant="secondary" className="text-xs">
                  {level}: {count}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InternalCard({ internal }: { internal: InternalDefinition }) {
  const relationshipCounts = {
    landscape: internal.relationships.landscape?.length || 0,
    context: internal.relationships.context?.length || 0,
    container: internal.relationships.container?.length || 0,
    component: internal.relationships.component?.length || 0,
    code: internal.relationships.code?.length || 0,
    plugin: internal.relationships.plugin?.length || 0,
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{internal.name}</CardTitle>
            <CardDescription className="text-sm">{internal.description}</CardDescription>
          </div>
          <Badge>{internal.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Technology:</span>
            <Badge variant="outline">{internal.technology}</Badge>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Relationships by level:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(relationshipCounts).map(([level, count]) => (
                <Badge key={level} variant="secondary" className="text-xs">
                  {level}: {count}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
