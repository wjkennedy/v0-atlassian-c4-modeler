"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Zap, Shield, Database, Cloud, Users, Mail, FileText, BarChart3, Settings, Lock } from "lucide-react"

interface IntegrationPanelProps {
  selectedIntegrations: string[]
  onSelectionChange: (integrations: string[]) => void
}

const integrations = [
  {
    id: "servicenow",
    name: "ServiceNow",
    description: "IT service management and workflow automation",
    category: "ITSM",
    icon: Settings,
    color: "bg-green-600",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Customer relationship management",
    category: "CRM",
    icon: Cloud,
    color: "bg-blue-600",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Code repository and collaboration",
    category: "DevOps",
    icon: FileText,
    color: "bg-gray-800",
  },
  {
    id: "okta",
    name: "Okta",
    description: "Identity and access management",
    category: "Security",
    icon: Shield,
    color: "bg-blue-500",
  },
  {
    id: "azure-ad",
    name: "Azure Active Directory",
    description: "Microsoft identity platform",
    category: "Security",
    icon: Lock,
    color: "bg-blue-700",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team communication and collaboration",
    category: "Communication",
    icon: Mail,
    color: "bg-purple-600",
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    description: "Unified communication platform",
    category: "Communication",
    icon: Users,
    color: "bg-indigo-600",
  },
  {
    id: "tableau",
    name: "Tableau",
    description: "Business intelligence and analytics",
    category: "Analytics",
    icon: BarChart3,
    color: "bg-orange-500",
  },
  {
    id: "power-bi",
    name: "Power BI",
    description: "Microsoft business analytics",
    category: "Analytics",
    icon: BarChart3,
    color: "bg-yellow-600",
  },
  {
    id: "jenkins",
    name: "Jenkins",
    description: "Continuous integration and deployment",
    category: "DevOps",
    icon: Zap,
    color: "bg-red-600",
  },
  {
    id: "aws",
    name: "Amazon Web Services",
    description: "Cloud infrastructure and services",
    category: "Infrastructure",
    icon: Cloud,
    color: "bg-orange-600",
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    description: "Cloud computing platform",
    category: "Infrastructure",
    icon: Cloud,
    color: "bg-blue-600",
  },
]

const internalConcerns = [
  {
    id: "audit-framework",
    name: "Audit Framework",
    description: "Compliance and audit trail management",
    category: "Governance",
    icon: Shield,
    color: "bg-gray-600",
  },
  {
    id: "reporting-engine",
    name: "Reporting Engine",
    description: "Custom reporting and analytics",
    category: "Analytics",
    icon: BarChart3,
    color: "bg-green-600",
  },
  {
    id: "automation-platform",
    name: "Automation Platform",
    description: "Workflow and process automation",
    category: "Automation",
    icon: Zap,
    color: "bg-purple-600",
  },
  {
    id: "work-item-classifier",
    name: "Work Item Classifier",
    description: "AI-powered work item classification",
    category: "AI/ML",
    icon: Settings,
    color: "bg-indigo-600",
  },
  {
    id: "data-ingestion",
    name: "Data Ingestion Service",
    description: "Custom data import and processing",
    category: "Data",
    icon: Database,
    color: "bg-cyan-600",
  },
]

export function IntegrationPanel({ selectedIntegrations, onSelectionChange }: IntegrationPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"external" | "internal">("external")

  const currentIntegrations = activeTab === "external" ? integrations : internalConcerns

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
