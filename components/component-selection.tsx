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
} from "lucide-react"

interface ComponentSelectionProps {
  selectedComponents: string[]
  onSelectionChange: (components: string[]) => void
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

export function ComponentSelection({ selectedComponents, onSelectionChange }: ComponentSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredComponents = atlassianComponents.filter(
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
