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
import { SettingsModal } from "@/components/settings-modal"
import { PluginAsComponents } from "@/components/plugin-as-components"
import { ThemeToggle } from "@/components/theme-toggle"
import { Building2, Network, Settings, Download, Eye, Layers, Package } from "lucide-react"

export default function C4GeneratorPage() {
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([])
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([])
  const [diagramConfig, setDiagramConfig] = useState({
    title: "Atlassian Cloud Architecture",
    level: "container",
    theme: "professional",
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [customComponents, setCustomComponents] = useState<any[]>([])
  const [customIntegrations, setCustomIntegrations] = useState<any[]>([])

  const handleCustomComponentsUpdate = (components: any[]) => {
    setCustomComponents(components)
  }

  const handleCustomIntegrationsUpdate = (integrations: any[]) => {
    setCustomIntegrations(integrations)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 softpop-shadow">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl softpop-shadow">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  C4 Model Generator
                </h1>
                <p className="text-sm text-muted-foreground font-medium">Atlassian Solution Partners</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="softpop-button border-primary/20 hover:border-primary/40"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b bg-gradient-to-br from-card/50 to-muted/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <Card className="softpop-card softpop-shadow border-primary/10">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                Live Preview
              </CardTitle>
              <CardDescription className="text-base">
                Real-time C4 diagram preview with Softpop aesthetics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DiagramPreview
                components={selectedComponents}
                integrations={selectedIntegrations}
                plugins={selectedPlugins}
                config={diagramConfig}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-8">
            <Card className="softpop-card softpop-shadow border-primary/10">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  Architecture Configuration
                </CardTitle>
                <CardDescription className="text-base">
                  Configure your Atlassian Cloud architecture with beautiful Softpop design
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="components" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger
                      value="components"
                      className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Building2 className="h-4 w-4" />
                      Components
                    </TabsTrigger>
                    <TabsTrigger
                      value="integrations"
                      className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Network className="h-4 w-4" />
                      Integrations
                    </TabsTrigger>
                    <TabsTrigger
                      value="plugins"
                      className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Package className="h-4 w-4" />
                      Plugins
                    </TabsTrigger>
                    <TabsTrigger
                      value="config"
                      className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Settings className="h-4 w-4" />
                      Configuration
                    </TabsTrigger>
                    <TabsTrigger
                      value="export"
                      className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="components" className="mt-6">
                    <ComponentSelection
                      selectedComponents={selectedComponents}
                      onSelectionChange={setSelectedComponents}
                      customComponents={customComponents}
                    />
                  </TabsContent>

                  <TabsContent value="integrations" className="mt-6">
                    <IntegrationPanel
                      selectedIntegrations={selectedIntegrations}
                      onSelectionChange={setSelectedIntegrations}
                      customIntegrations={customIntegrations}
                    />
                  </TabsContent>

                  <TabsContent value="plugins" className="mt-6">
                    <PluginAsComponents
                      selectedPlugins={selectedPlugins}
                      onSelectionChange={setSelectedPlugins}
                      customComponents={customComponents}
                      onCustomComponentsChange={handleCustomComponentsUpdate}
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

          <div className="space-y-6">
            <Card className="softpop-card softpop-shadow border-primary/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Architecture Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-muted/50 to-accent/10">
                  <span className="text-sm font-medium text-muted-foreground">Components</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {selectedComponents.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-muted/50 to-secondary/10">
                  <span className="text-sm font-medium text-muted-foreground">Integrations</span>
                  <Badge variant="outline" className="bg-secondary/10 text-secondary-foreground border-secondary/20">
                    {selectedIntegrations.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-muted/50 to-accent/10">
                  <span className="text-sm font-medium text-muted-foreground">Plugins</span>
                  <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/20">
                    {selectedPlugins.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-muted/50 to-primary/10">
                  <span className="text-sm font-medium text-muted-foreground">Diagram Level</span>
                  <Badge variant="secondary" className="capitalize bg-primary/20 text-primary">
                    {diagramConfig.level}
                  </Badge>
                </div>
                {customComponents.length > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-muted/50 to-accent/10">
                    <span className="text-sm font-medium text-muted-foreground">Custom Components</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {customComponents.length}
                    </Badge>
                  </div>
                )}
                {customIntegrations.length > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-muted/50 to-secondary/10">
                    <span className="text-sm font-medium text-muted-foreground">Custom Integrations</span>
                    <Badge variant="outline" className="bg-secondary/10 text-secondary-foreground border-secondary/20">
                      {customIntegrations.length}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onComponentsUpdate={handleCustomComponentsUpdate}
        onIntegrationsUpdate={handleCustomIntegrationsUpdate}
      />
    </div>
  )
}
