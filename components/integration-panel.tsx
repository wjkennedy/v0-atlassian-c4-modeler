"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { integrations, internalConcerns } from "@/lib/integration-data"

interface IntegrationPanelProps {
  selectedIntegrations: string[]
  onSelectionChange: (integrations: string[]) => void
  customIntegrations?: any[]
}

export function IntegrationPanel({
  selectedIntegrations,
  onSelectionChange,
  customIntegrations = [],
}: IntegrationPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"external" | "internal">("external")

  const allExternalIntegrations = [...integrations, ...customIntegrations.filter((i) => !i.isInternal)]
  const allInternalConcerns = [...internalConcerns, ...customIntegrations.filter((i) => i.isInternal)]

  const currentIntegrations = activeTab === "external" ? allExternalIntegrations : allInternalConcerns

  const filteredIntegrations = currentIntegrations.filter(
    (integration) =>
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const categories = Array.from(new Set(filteredIntegrations.map((i) => i.category)))

  const handleIntegrationToggle = (integrationId: string) => {
    const newSelection = selectedIntegrations.includes(integrationId)
      ? selectedIntegrations.filter((id) => id !== integrationId)
      : [...selectedIntegrations, integrationId]
    onSelectionChange(newSelection)
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("external")}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "external"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          External Integrations
        </button>
        <button
          onClick={() => setActiveTab("internal")}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "internal"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Internal Concerns
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${activeTab} integrations...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Integration Categories */}
      {categories.map((category) => {
        const categoryIntegrations = filteredIntegrations.filter((i) => i.category === category)

        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{category}</CardTitle>
                <Badge variant="outline">
                  {categoryIntegrations.filter((i) => selectedIntegrations.includes(i.id)).length} /{" "}
                  {categoryIntegrations.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryIntegrations.map((integration) => {
                  const Icon = integration.icon
                  const isSelected = selectedIntegrations.includes(integration.id)

                  return (
                    <div
                      key={integration.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-muted/50 ${
                        isSelected ? "border-primary bg-primary/5" : "border-border"
                      }`}
                      onClick={() => handleIntegrationToggle(integration.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleIntegrationToggle(integration.id)}
                        className="mt-1"
                      />
                      <div className={`p-2 rounded-md ${integration.color} bg-opacity-10`}>
                        <Icon className={`h-4 w-4 text-white`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{integration.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{integration.description}</p>
                        {integration.id.startsWith("custom-") && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Custom
                          </Badge>
                        )}
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
  )
}
