"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
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
  Filter,
  Star,
} from "lucide-react"
import { MarketplaceParser, type MarketplaceApp } from "@/lib/marketplace-parser"

interface MarketplaceSelectionProps {
  selectedPlugins: string[]
  onSelectionChange: (plugins: string[]) => void
  selectedComponents: string[]
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
  "Testing & QA": "bg-green-500",
  "Time Tracking": "bg-blue-500",
  "Reporting & Analytics": "bg-purple-500",
  "Development & CI/CD": "bg-orange-500",
  "Workflow & Automation": "bg-indigo-500",
  "Project Management": "bg-emerald-500",
  "Integration & Connectivity": "bg-cyan-500",
  Visualization: "bg-pink-500",
  "Security & Access": "bg-red-500",
  Communication: "bg-yellow-500",
  Other: "bg-gray-500",
}

export function MarketplaceSelection({
  selectedPlugins,
  onSelectionChange,
  selectedComponents,
}: MarketplaceSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [marketplaceApps, setMarketplaceApps] = useState<MarketplaceApp[]>([])
  const [appsByCategory, setAppsByCategory] = useState<Record<string, MarketplaceApp[]>>({})
  const [showPopularOnly, setShowPopularOnly] = useState(false)

  useEffect(() => {
    // Load marketplace data
    const loadMarketplaceData = async () => {
      try {
        const response = await fetch("/data/atlassian-marketplace-apps.txt")
        const data = await response.text()
        const parser = new MarketplaceParser(data)
        const apps = parser.getApps()
        const categorized = parser.getAppsByCategory()

        setMarketplaceApps(apps)
        setAppsByCategory(categorized)
      } catch (error) {
        console.error("[v0] Failed to load marketplace data:", error)
        // Fallback to sample data
        const sampleApps = getSampleMarketplaceApps()
        setMarketplaceApps(sampleApps)
        setAppsByCategory(groupAppsByCategory(sampleApps))
      }
    }

    loadMarketplaceData()
  }, [])

  const popularPluginKeys = [
    "com.onresolve.jira.groovy.groovyrunner", // ScriptRunner
    "com.xpandit.plugins.xray", // Xray
    "is.origo.jira.tempo-plugin", // Tempo Timesheets
    "com.almworks.jira.structure", // Structure
    "com.eazybi.jira.plugins.eazybi-jira", // eazyBI
    "com.github.integration.production", // GitHub
    "com.kanoah.test-manager", // Zephyr
    "com.innovalog.jmwe.jira-misc-workflow-extensions", // JMWE
    "eu.softwareplant.bigpicture", // BigPicture
    "com.mxgraph.jira.plugins.drawio", // draw.io
  ]

  const filteredApps = marketplaceApps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.summary.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || app.category === selectedCategory

    const matchesPopular = !showPopularOnly || popularPluginKeys.includes(app.key)

    return matchesSearch && matchesCategory && matchesPopular
  })

  const categories = Object.keys(appsByCategory).sort()

  const handlePluginToggle = (pluginKey: string) => {
    const newSelection = selectedPlugins.includes(pluginKey)
      ? selectedPlugins.filter((key) => key !== pluginKey)
      : [...selectedPlugins, pluginKey]
    onSelectionChange(newSelection)
  }

  const handleSelectPopular = () => {
    const popularApps = marketplaceApps.filter((app) => popularPluginKeys.includes(app.key))
    const popularKeys = popularApps.map((app) => app.key)
    onSelectionChange([...new Set([...selectedPlugins, ...popularKeys])])
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  const getRelevantAppsForComponents = () => {
    if (selectedComponents.length === 0) return filteredApps

    return filteredApps.filter((app) => {
      const appText = `${app.name} ${app.tagline} ${app.summary}`.toLowerCase()
      return selectedComponents.some((componentId) => {
        if (componentId.includes("jira")) return appText.includes("jira")
        if (componentId === "confluence") return appText.includes("confluence")
        if (componentId === "bitbucket") return appText.includes("bitbucket") || appText.includes("git")
        return true
      })
    })
  }

  const relevantApps = getRelevantAppsForComponents()

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Atlassian Marketplace Apps</h3>
          <p className="text-sm text-muted-foreground">
            Select plugins and apps to include in your plugin ecosystem diagram
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectPopular}>
            <Star className="h-4 w-4 mr-2" />
            Select Popular
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search marketplace apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={showPopularOnly} onCheckedChange={setShowPopularOnly} />
            <span className="text-sm">Popular apps only</span>
          </div>

          <Badge variant="outline">{selectedPlugins.length} selected</Badge>
        </div>
      </div>

      {/* Apps Grid */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="relevant">Relevant to Selection</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => {
              const isSelected = selectedPlugins.includes(app.key)
              const isPopular = popularPluginKeys.includes(app.key)
              const Icon = categoryIcons[app.category as keyof typeof categoryIcons] || Package
              const colorClass = categoryColors[app.category as keyof typeof categoryColors] || "bg-gray-500"

              return (
                <Card
                  key={app.key}
                  className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""}`}
                  onClick={() => handlePluginToggle(app.key)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={isSelected} onChange={() => handlePluginToggle(app.key)} />
                        <div className={`p-2 rounded-md ${colorClass} bg-opacity-10`}>
                          <Icon className={`h-4 w-4 ${colorClass.replace("bg-", "text-")}`} />
                        </div>
                      </div>
                      {isPopular && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium leading-tight">{app.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {app.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2">{app.tagline}</p>
                    {app.summary && <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{app.summary}</p>}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="category" className="mt-4">
          <div className="space-y-6">
            {categories.map((category) => {
              const categoryApps = appsByCategory[category].filter(
                (app) =>
                  app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  app.tagline.toLowerCase().includes(searchTerm.toLowerCase()),
              )

              if (categoryApps.length === 0) return null

              const Icon = categoryIcons[category as keyof typeof categoryIcons] || Package
              const colorClass = categoryColors[category as keyof typeof categoryColors] || "bg-gray-500"

              return (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${colorClass} bg-opacity-10`}>
                        <Icon className={`h-5 w-5 ${colorClass.replace("bg-", "text-")}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category}</CardTitle>
                        <Badge variant="outline">
                          {categoryApps.filter((app) => selectedPlugins.includes(app.key)).length} /{" "}
                          {categoryApps.length}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryApps.map((app) => {
                        const isSelected = selectedPlugins.includes(app.key)
                        const isPopular = popularPluginKeys.includes(app.key)

                        return (
                          <div
                            key={app.key}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                              isSelected ? "border-primary bg-primary/5" : "border-border"
                            }`}
                            onClick={() => handlePluginToggle(app.key)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handlePluginToggle(app.key)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">{app.name}</h4>
                                {isPopular && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="h-3 w-3" />
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{app.tagline}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="relevant" className="mt-4">
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Apps Relevant to Your Selection</h4>
              <p className="text-sm text-muted-foreground">
                Based on your selected Atlassian components: {selectedComponents.join(", ")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relevantApps.map((app) => {
                const isSelected = selectedPlugins.includes(app.key)
                const isPopular = popularPluginKeys.includes(app.key)
                const Icon = categoryIcons[app.category as keyof typeof categoryIcons] || Package
                const colorClass = categoryColors[app.category as keyof typeof categoryColors] || "bg-gray-500"

                return (
                  <Card
                    key={app.key}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handlePluginToggle(app.key)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox checked={isSelected} onChange={() => handlePluginToggle(app.key)} />
                          <div className={`p-2 rounded-md ${colorClass} bg-opacity-10`}>
                            <Icon className={`h-4 w-4 ${colorClass.replace("bg-", "text-")}`} />
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {isPopular && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {app.category}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-sm font-medium leading-tight">{app.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2">{app.tagline}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getSampleMarketplaceApps(): MarketplaceApp[] {
  return [
    {
      name: "ScriptRunner for Jira",
      key: "com.onresolve.jira.groovy.groovyrunner",
      tagline: "The must-have app for Jira admins",
      summary: "Automation and customization toolkit",
      category: "Workflow & Automation",
    },
    {
      name: "Xray Test Management",
      key: "com.xpandit.plugins.xray",
      tagline: "Native Test Management",
      summary: "Built for every member of your team to plan, test, track and release great software",
      category: "Testing & QA",
    },
    {
      name: "Tempo Timesheets",
      key: "is.origo.jira.tempo-plugin",
      tagline: "#1 AI Jira Time Tracking App",
      summary: "Project Management & Billing with Google, Slack & Outlook Integration",
      category: "Time Tracking",
    },
    {
      name: "Structure by Tempo",
      key: "com.almworks.jira.structure",
      tagline: "Jira Portfolio Management (PPM)",
      summary: "Manage projects & team capacity in excel spreadsheet-like tables",
      category: "Project Management",
    },
    {
      name: "eazyBI Reports",
      key: "com.eazybi.jira.plugins.eazybi-jira",
      tagline: "Leading reports, charts, and dashboards app",
      summary: "Scalable, Powerful, Enterprise-Ready. Complete Analytics Solution",
      category: "Reporting & Analytics",
    },
  ]
}

function groupAppsByCategory(apps: MarketplaceApp[]): Record<string, MarketplaceApp[]> {
  return apps.reduce(
    (acc, app) => {
      if (!acc[app.category]) acc[app.category] = []
      acc[app.category].push(app)
      return acc
    },
    {} as Record<string, MarketplaceApp[]>,
  )
}
