"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComponentSelection } from "@/components/component-selection"
import { IntegrationPanel } from "@/components/integration-panel"
import { DiagramPreview } from "@/components/diagram-preview"
import { ConfigurationPanel } from "@/components/configuration-panel"
import { ExportPanel } from "@/components/export-panel"
import { Building2, Network, Settings, Download, Eye, Layers } from "lucide-react"

export default function C4GeneratorPage() {
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([])
  const [diagramConfig, setDiagramConfig] = useState({
    title: "Atlassian Cloud Architecture",
    level: "container",
    theme: "professional",
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">C4 Model Generator</h1>
                <p className="text-sm text-muted-foreground">Atlassian Solution Partners</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground">
                Enterprise Ready
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Architecture Configuration
                </CardTitle>
                <CardDescription>
                  Configure your Atlassian Cloud architecture components and integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="components" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="components" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Components
                    </TabsTrigger>
                    <TabsTrigger value="integrations" className="flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      Integrations
                    </TabsTrigger>
                    <TabsTrigger value="config" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Configuration
                    </TabsTrigger>
                    <TabsTrigger value="export" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="components" className="mt-6">
                    <ComponentSelection
                      selectedComponents={selectedComponents}
                      onSelectionChange={setSelectedComponents}
                    />
                  </TabsContent>

                  <TabsContent value="integrations" className="mt-6">
                    <IntegrationPanel
                      selectedIntegrations={selectedIntegrations}
                      onSelectionChange={setSelectedIntegrations}
                    />
                  </TabsContent>

                  <TabsContent value="config" className="mt-6">
                    <ConfigurationPanel config={diagramConfig} onConfigChange={setDiagramConfig} />
                  </TabsContent>

                  <TabsContent value="export" className="mt-6">
                    <ExportPanel
                      selectedComponents={selectedComponents}
                      selectedIntegrations={selectedIntegrations}
                      config={diagramConfig}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Live Preview
                </CardTitle>
                <CardDescription>Real-time C4 diagram preview</CardDescription>
              </CardHeader>
              <CardContent>
                <DiagramPreview
                  components={selectedComponents}
                  integrations={selectedIntegrations}
                  config={diagramConfig}
                />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Architecture Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Components</span>
                  <Badge variant="outline">{selectedComponents.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Integrations</span>
                  <Badge variant="outline">{selectedIntegrations.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Diagram Level</span>
                  <Badge variant="secondary" className="capitalize">
                    {diagramConfig.level}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
