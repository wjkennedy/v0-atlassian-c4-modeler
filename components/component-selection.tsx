"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  Server,
  Database,
  Globe,
  Shield,
  Users,
  FileText,
  GitBranch,
  MessageSquare,
  BarChart3,
  Zap,
  Building,
  Workflow,
  Brain,
  Smartphone,
  Calendar,
  Target,
} from "lucide-react"

interface ComponentSelectionProps {
  selectedComponents: string[]
  onSelectionChange: (components: string[]) => void
  customComponents?: any[]
}

const atlassianComponents = [
  {
    id: "jira-software",
    name: "Jira Software",
    description: "Project management and issue tracking",
    category: "Core Products",
    icon: Server,
    color: "bg-blue-500",
  },
  {
    id: "jira-service-management",
    name: "Jira Service Management",
    description: "IT service management and support",
    category: "Core Products",
    icon: Shield,
    color: "bg-green-500",
  },
  {
    id: "jira-work-management",
    name: "Jira Work Management",
    description: "Business team project management",
    category: "Core Products",
    icon: Server,
    color: "bg-blue-600",
  },
  {
    id: "confluence",
    name: "Confluence",
    description: "Team collaboration and documentation",
    category: "Core Products",
    icon: FileText,
    color: "bg-purple-500",
  },
  {
    id: "bitbucket",
    name: "Bitbucket",
    description: "Git repository management",
    category: "Core Products",
    icon: GitBranch,
    color: "bg-indigo-500",
  },
  {
    id: "compass",
    name: "Compass",
    description: "Developer experience platform",
    category: "Platform",
    icon: BarChart3,
    color: "bg-orange-500",
  },
  {
    id: "atlas",
    name: "Atlas",
    description: "Teamwork directory and insights",
    category: "Platform",
    icon: Users,
    color: "bg-pink-500",
  },
  {
    id: "jira-align",
    name: "Jira Align",
    description: "Enterprise agile planning",
    category: "Enterprise",
    icon: BarChart3,
    color: "bg-emerald-500",
  },
  {
    id: "jira-product-discovery",
    name: "Jira Product Discovery",
    description: "Product roadmap and discovery",
    category: "Product Management",
    icon: Workflow,
    color: "bg-violet-500",
  },
  {
    id: "trello",
    name: "Trello",
    description: "Visual project management boards",
    category: "Core Products",
    icon: Server,
    color: "bg-blue-400",
  },
  {
    id: "bamboo",
    name: "Bamboo",
    description: "Continuous integration and deployment",
    category: "DevOps",
    icon: Zap,
    color: "bg-yellow-500",
  },
  {
    id: "crowd",
    name: "Crowd",
    description: "Identity management and single sign-on",
    category: "Security",
    icon: Shield,
    color: "bg-teal-500",
  },
  {
    id: "fisheye-crucible",
    name: "Fisheye & Crucible",
    description: "Code review and repository browsing",
    category: "DevOps",
    icon: GitBranch,
    color: "bg-cyan-500",
  },
  {
    id: "atlassian-access",
    name: "Atlassian Access",
    description: "Enterprise security and user management",
    category: "Security",
    icon: Shield,
    color: "bg-red-600",
  },
  {
    id: "atlassian-analytics",
    name: "Atlassian Analytics",
    description: "Cross-product analytics and insights",
    category: "Analytics",
    icon: BarChart3,
    color: "bg-purple-600",
  },
  {
    id: "statuspage",
    name: "Statuspage",
    description: "Status communication platform",
    category: "Operations",
    icon: Globe,
    color: "bg-cyan-500",
  },
  {
    id: "opsgenie",
    name: "Opsgenie",
    description: "Incident management and alerting",
    category: "Operations",
    icon: MessageSquare,
    color: "bg-red-500",
  },
  {
    id: "atlassian-marketplace",
    name: "Atlassian Marketplace",
    description: "App marketplace and ecosystem",
    category: "Platform",
    icon: Building,
    color: "bg-indigo-600",
  },
  {
    id: "atlassian-intelligence",
    name: "Atlassian Intelligence",
    description: "AI-powered features across Atlassian products",
    category: "AI/ML",
    icon: Brain,
    color: "bg-violet-600",
  },
  {
    id: "atlassian-mobile",
    name: "Atlassian Mobile Apps",
    description: "Mobile applications for iOS and Android",
    category: "Mobile",
    icon: Smartphone,
    color: "bg-gray-600",
  },
  {
    id: "team-calendars",
    name: "Team Calendars",
    description: "Team scheduling and calendar management",
    category: "Productivity",
    icon: Calendar,
    color: "bg-blue-500",
  },
  {
    id: "portfolio-for-jira",
    name: "Portfolio for Jira",
    description: "Advanced project portfolio management",
    category: "Enterprise",
    icon: Target,
    color: "bg-green-600",
  },
  {
    id: "database-primary",
    name: "Primary Database",
    description: "Main application database",
    category: "Infrastructure",
    icon: Database,
    color: "bg-gray-500",
  },
  {
    id: "database-analytics",
    name: "Analytics Database",
    description: "Data warehouse and analytics",
    category: "Infrastructure",
    icon: Database,
    color: "bg-yellow-500",
  },
]

export function ComponentSelection({
  selectedComponents,
  onSelectionChange,
  customComponents = [],
}: ComponentSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const allComponents = [...atlassianComponents, ...customComponents]

  const filteredComponents = allComponents.filter(
    (component) =>
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const categories = Array.from(new Set(filteredComponents.map((c) => c.category)))

  const handleComponentToggle = (componentId: string) => {
    const newSelection = selectedComponents.includes(componentId)
      ? selectedComponents.filter((id) => id !== componentId)
      : [...selectedComponents, componentId]
    onSelectionChange(newSelection)
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Component Categories */}
      {categories.map((category) => {
        const categoryComponents = filteredComponents.filter((c) => c.category === category)

        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{category}</CardTitle>
                <Badge variant="outline">
                  {categoryComponents.filter((c) => selectedComponents.includes(c.id)).length} /{" "}
                  {categoryComponents.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryComponents.map((component) => {
                  const Icon = component.icon
                  const isSelected = selectedComponents.includes(component.id)

                  return (
                    <div
                      key={component.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-muted/50 ${
                        isSelected ? "border-primary bg-primary/5" : "border-border"
                      }`}
                      onClick={() => handleComponentToggle(component.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleComponentToggle(component.id)}
                        className="mt-1"
                      />
                      <div className={`p-2 rounded-md ${component.color} bg-opacity-10`}>
                        <Icon className={`h-4 w-4 ${component.color.replace("bg-", "text-")}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{component.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{component.description}</p>
                        {component.id.startsWith("custom-") && (
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
