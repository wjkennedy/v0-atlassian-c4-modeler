"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { atlassianComponents } from "@/lib/component-data"

interface ComponentSelectionProps {
  selectedComponents: string[]
  onSelectionChange: (components: string[]) => void
  customComponents?: any[]
}

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
                        onCheckedChange={() => handleComponentToggle(component.id)}
                        className="mt-1"
                      />
                      <div className={`p-2 rounded-md ${component.color || "bg-gray-500"} bg-opacity-10`}>
                        <Icon
                          className={`h-4 w-4 ${component.color ? component.color.replace("bg-", "text-") : "text-gray-500"}`}
                        />
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
