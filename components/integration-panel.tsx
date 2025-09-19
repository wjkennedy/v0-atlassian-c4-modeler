"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  Zap,
  Shield,
  Database,
  Cloud,
  Users,
  Mail,
  FileText,
  BarChart3,
  Settings,
  Lock,
  GitBranch,
  Server,
  Smartphone,
  Monitor,
  Workflow,
  Brain,
  CreditCard,
  MessageCircle,
  Video,
  Headphones,
  Target,
} from "lucide-react"

interface IntegrationPanelProps {
  selectedIntegrations: string[]
  onSelectionChange: (integrations: string[]) => void
  customIntegrations?: any[]
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
    id: "github-enterprise",
    name: "GitHub Enterprise",
    description: "Enterprise code repository and collaboration",
    category: "DevOps",
    icon: FileText,
    color: "bg-gray-900",
  },
  {
    id: "gitlab",
    name: "GitLab",
    description: "DevOps platform with integrated CI/CD",
    category: "DevOps",
    icon: GitBranch,
    color: "bg-orange-600",
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
    id: "ping-identity",
    name: "Ping Identity",
    description: "Enterprise identity and access management",
    category: "Security",
    icon: Shield,
    color: "bg-yellow-600",
  },
  {
    id: "auth0",
    name: "Auth0",
    description: "Identity platform for developers",
    category: "Security",
    icon: Lock,
    color: "bg-orange-500",
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    description: "Google productivity and collaboration tools",
    category: "Productivity",
    icon: Mail,
    color: "bg-red-500",
  },
  {
    id: "microsoft-365",
    name: "Microsoft 365",
    description: "Microsoft productivity suite",
    category: "Productivity",
    icon: Mail,
    color: "bg-blue-600",
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
    id: "zoom",
    name: "Zoom",
    description: "Video conferencing and communication",
    category: "Communication",
    icon: Users,
    color: "bg-blue-400",
  },
  {
    id: "webex",
    name: "Cisco Webex",
    description: "Enterprise video conferencing",
    category: "Communication",
    icon: Users,
    color: "bg-green-600",
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
    id: "looker",
    name: "Looker",
    description: "Business intelligence and data platform",
    category: "Analytics",
    icon: BarChart3,
    color: "bg-green-500",
  },
  {
    id: "qlik",
    name: "Qlik Sense",
    description: "Self-service data analytics",
    category: "Analytics",
    icon: BarChart3,
    color: "bg-green-700",
  },
  {
    id: "splunk",
    name: "Splunk",
    description: "Data platform for security and observability",
    category: "Analytics",
    icon: BarChart3,
    color: "bg-orange-700",
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
    id: "azure-devops",
    name: "Azure DevOps",
    description: "Microsoft DevOps platform",
    category: "DevOps",
    icon: Zap,
    color: "bg-blue-600",
  },
  {
    id: "circleci",
    name: "CircleCI",
    description: "Continuous integration and delivery",
    category: "DevOps",
    icon: Zap,
    color: "bg-green-600",
  },
  {
    id: "teamcity",
    name: "TeamCity",
    description: "JetBrains CI/CD server",
    category: "DevOps",
    icon: Zap,
    color: "bg-blue-500",
  },
  {
    id: "terraform",
    name: "Terraform",
    description: "Infrastructure as code",
    category: "DevOps",
    icon: Server,
    color: "bg-purple-600",
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
  {
    id: "google-cloud",
    name: "Google Cloud Platform",
    description: "Google cloud infrastructure and services",
    category: "Infrastructure",
    icon: Cloud,
    color: "bg-red-600",
  },
  {
    id: "docker",
    name: "Docker",
    description: "Containerization platform",
    category: "Infrastructure",
    icon: Server,
    color: "bg-blue-500",
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    description: "Container orchestration platform",
    category: "Infrastructure",
    icon: Server,
    color: "bg-indigo-600",
  },
  {
    id: "datadog",
    name: "Datadog",
    description: "Monitoring and analytics platform",
    category: "Monitoring",
    icon: Monitor,
    color: "bg-purple-500",
  },
  {
    id: "new-relic",
    name: "New Relic",
    description: "Application performance monitoring",
    category: "Monitoring",
    icon: Monitor,
    color: "bg-green-500",
  },
  {
    id: "pagerduty",
    name: "PagerDuty",
    description: "Incident response platform",
    category: "Monitoring",
    icon: Smartphone,
    color: "bg-green-600",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing and financial services",
    category: "Finance",
    icon: CreditCard,
    color: "bg-purple-600",
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Digital payment platform",
    category: "Finance",
    icon: CreditCard,
    color: "bg-blue-600",
  },
  {
    id: "discord",
    name: "Discord",
    description: "Voice, video and text communication",
    category: "Communication",
    icon: MessageCircle,
    color: "bg-indigo-600",
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "Cloud communications platform",
    category: "Communication",
    icon: Smartphone,
    color: "bg-red-500",
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Email delivery and marketing platform",
    category: "Communication",
    icon: Mail,
    color: "bg-blue-500",
  },
  {
    id: "intercom",
    name: "Intercom",
    description: "Customer messaging and support platform",
    category: "Support",
    icon: MessageCircle,
    color: "bg-blue-600",
  },
  {
    id: "zendesk",
    name: "Zendesk",
    description: "Customer service and support platform",
    category: "Support",
    icon: Headphones,
    color: "bg-green-600",
  },
  {
    id: "freshdesk",
    name: "Freshdesk",
    description: "Customer support software",
    category: "Support",
    icon: Headphones,
    color: "bg-orange-500",
  },
  {
    id: "loom",
    name: "Loom",
    description: "Video messaging and screen recording",
    category: "Communication",
    icon: Video,
    color: "bg-purple-500",
  },
  {
    id: "notion",
    name: "Notion",
    description: "All-in-one workspace for notes and collaboration",
    category: "Productivity",
    icon: FileText,
    color: "bg-gray-800",
  },
  {
    id: "airtable",
    name: "Airtable",
    description: "Cloud collaboration service with database features",
    category: "Productivity",
    icon: Database,
    color: "bg-yellow-500",
  },
  {
    id: "monday",
    name: "Monday.com",
    description: "Work operating system and project management",
    category: "Productivity",
    icon: BarChart3,
    color: "bg-purple-600",
  },
  {
    id: "asana",
    name: "Asana",
    description: "Team collaboration and project management",
    category: "Productivity",
    icon: Target,
    color: "bg-pink-500",
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
    icon: Brain,
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
  {
    id: "notification-service",
    name: "Notification Service",
    description: "Centralized notification management",
    category: "Communication",
    icon: Mail,
    color: "bg-blue-500",
  },
  {
    id: "workflow-engine",
    name: "Workflow Engine",
    description: "Custom business process workflows",
    category: "Automation",
    icon: Workflow,
    color: "bg-orange-600",
  },
  {
    id: "integration-hub",
    name: "Integration Hub",
    description: "Central integration management platform",
    category: "Integration",
    icon: Settings,
    color: "bg-teal-600",
  },
  {
    id: "api-gateway",
    name: "API Gateway",
    description: "Centralized API management and routing",
    category: "Infrastructure",
    icon: Server,
    color: "bg-blue-600",
  },
  {
    id: "message-queue",
    name: "Message Queue",
    description: "Asynchronous message processing system",
    category: "Infrastructure",
    icon: Workflow,
    color: "bg-green-600",
  },
  {
    id: "cache-layer",
    name: "Cache Layer",
    description: "Distributed caching for performance optimization",
    category: "Infrastructure",
    icon: Database,
    color: "bg-red-600",
  },
  {
    id: "search-engine",
    name: "Search Engine",
    description: "Full-text search and indexing service",
    category: "Data",
    icon: Search,
    color: "bg-orange-600",
  },
]

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
