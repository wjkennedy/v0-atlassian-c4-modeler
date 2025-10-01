"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  ChevronRight,
  ChevronDown,
  Box,
  Container,
  Component,
  Code,
  Network,
  Layers,
  Eye,
  EyeOff,
  Home,
  ZoomIn,
} from "lucide-react"
import { createMultiLevelAtlassianC4Model } from "@/lib/c4-generator"
import type {
  C4Element,
  C4Relationship,
  C4Catalog,
  ComponentDefinition,
  IntegrationDefinition,
  PluginDefinition,
  InternalDefinition,
} from "@/lib/c4-data-model"

interface InteractiveExplorerProps {
  components: string[]
  integrations: string[]
  plugins: string[]
  config: {
    title: string
    level: string
    theme: string
  }
  catalog: C4Catalog | null
}

interface ExplorerNode {
  id: string
  name: string
  type: string
  level: "landscape" | "context" | "container" | "component" | "code"
  description?: string
  technology?: string
  children: ExplorerNode[]
  relationships: C4Relationship[]
  element: C4Element
}

interface Breadcrumb {
  id: string
  name: string
  level: "landscape" | "context" | "container" | "component" | "code"
}

export function InteractiveExplorer({ components, integrations, plugins, config, catalog }: InteractiveExplorerProps) {
  const [explorerTree, setExplorerTree] = useState<ExplorerNode[]>([])
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedNode, setSelectedNode] = useState<ExplorerNode | null>(null)
  const [focusedNode, setFocusedNode] = useState<ExplorerNode | null>(null)
  const [currentLevel, setCurrentLevel] = useState<"landscape" | "context" | "container" | "component" | "code">(
    "container",
  )
  const [showRelationships, setShowRelationships] = useState(true)
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])

  useEffect(() => {
    console.log("[v0] Building explorer tree...")
    console.log("[v0] Catalog:", catalog)
    console.log("[v0] Selected components:", components)
    console.log("[v0] Selected integrations:", integrations)
    console.log("[v0] Selected plugins:", plugins)
    buildExplorerTree()
  }, [components, integrations, plugins, config, catalog])

  const buildExplorerTree = () => {
    try {
      if (catalog && catalog.systems && catalog.systems.length > 0) {
        console.log("[v0] Building tree from catalog")
        const tree = buildTreeFromCatalog(catalog)
        setExplorerTree(tree)
        console.log("[v0] Explorer tree built from catalog:", tree)
        return
      }

      // Fallback: Generate the C4 model from selections
      if (components.length === 0 && integrations.length === 0 && plugins.length === 0) {
        console.log("[v0] No components, integrations, or plugins to render")
        setExplorerTree([])
        return
      }

      const model = createMultiLevelAtlassianC4Model(components, integrations, plugins)

      if (!model || !model.elements) {
        console.log("[v0] No model elements to explore")
        setExplorerTree([])
        return
      }

      // Build hierarchical tree from flat elements
      const tree = buildHierarchy(model.elements, model.relationships || [])
      setExplorerTree(tree)
      console.log("[v0] Explorer tree built from model:", tree)
    } catch (error) {
      console.error("[v0] Error building explorer tree:", error)
      setExplorerTree([])
    }
  }

  const buildTreeFromCatalog = (catalog: C4Catalog): ExplorerNode[] => {
    const rootNodes: ExplorerNode[] = []
    const allItems = [...catalog.components, ...catalog.integrations, ...catalog.plugins, ...(catalog.internal || [])]

    console.log("[v0] Building tree from", allItems.length, "catalog items")

    // Create a map of all items by ID for quick lookup
    const itemMap = new Map<
      string,
      ComponentDefinition | IntegrationDefinition | PluginDefinition | InternalDefinition
    >()
    allItems.forEach((item) => itemMap.set(item.id, item))

    // Create nodes for all items
    const nodeMap = new Map<string, ExplorerNode>()
    allItems.forEach((item) => {
      const node: ExplorerNode = {
        id: item.id,
        name: item.name,
        type: item.level || inferTypeFromItem(item),
        level: mapLevelToExplorerLevel(item.level),
        description: item.description,
        technology: item.technology,
        children: [],
        relationships: [],
        element: {
          id: item.id,
          name: item.name,
          type: item.level || inferTypeFromItem(item),
          description: item.description,
          technology: item.technology,
          parent: item.parentId || item.containerId || item.systemId,
        },
      }
      nodeMap.set(item.id, node)
    })

    // Build parent-child relationships
    allItems.forEach((item) => {
      const node = nodeMap.get(item.id)
      if (!node) return

      // Determine parent ID from hierarchy fields
      const parentId = item.parentId || item.containerId || item.systemId

      if (parentId) {
        const parentNode = nodeMap.get(parentId)
        if (parentNode) {
          parentNode.children.push(node)
        } else {
          // Parent doesn't exist in catalog, add to root
          rootNodes.push(node)
        }
      } else {
        // No parent, this is a root node
        rootNodes.push(node)
      }
    })

    console.log("[v0] Built tree with", rootNodes.length, "root nodes")
    return rootNodes
  }

  const inferTypeFromItem = (
    item: ComponentDefinition | IntegrationDefinition | PluginDefinition | InternalDefinition,
  ): string => {
    // Infer type from category or other fields if level is not set
    if ("category" in item) {
      const category = item.category.toLowerCase()
      if (category.includes("system")) return "system"
      if (category.includes("container")) return "container"
      if (category.includes("component")) return "component"
    }
    return "component" // default
  }

  const mapLevelToExplorerLevel = (level?: string): "landscape" | "context" | "container" | "component" | "code" => {
    if (!level) return "component"

    switch (level) {
      case "system":
        return "landscape"
      case "container":
        return "container"
      case "component":
        return "component"
      case "code":
        return "code"
      default:
        return "component"
    }
  }

  const buildHierarchy = (elements: C4Element[], relationships: C4Relationship[]): ExplorerNode[] => {
    const elementMap = new Map<string, ExplorerNode>()
    const rootNodes: ExplorerNode[] = []

    // Create nodes for all elements
    elements.forEach((element) => {
      const node: ExplorerNode = {
        id: element.id,
        name: element.name,
        type: element.type,
        level: mapTypeToLevel(element.type),
        description: element.description,
        technology: element.technology,
        children: [],
        relationships: relationships.filter((r) => r.from === element.id || r.to === element.id),
        element,
      }
      elementMap.set(element.id, node)
    })

    // Build parent-child relationships
    elements.forEach((element) => {
      const node = elementMap.get(element.id)
      if (!node) return

      if (element.parent) {
        const parent = elementMap.get(element.parent)
        if (parent) {
          parent.children.push(node)
        } else {
          rootNodes.push(node)
        }
      } else {
        rootNodes.push(node)
      }
    })

    return rootNodes
  }

  const mapTypeToLevel = (type: string): "landscape" | "context" | "container" | "component" | "code" => {
    switch (type) {
      case "system":
        return "landscape"
      case "person":
      case "external_system":
        return "context"
      case "container":
        return "container"
      case "component":
        return "component"
      case "class":
      case "interface":
        return "code"
      default:
        return "container"
    }
  }

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const selectNode = (node: ExplorerNode) => {
    setSelectedNode(node)
    setCurrentLevel(node.level)
  }

  const zoomIntoNode = (node: ExplorerNode, e: React.MouseEvent) => {
    e.stopPropagation()

    // Only allow zooming into containers and components that have children
    if ((node.type === "container" || node.type === "component") && node.children.length > 0) {
      console.log("[v0] Zooming into:", node.name)
      setFocusedNode(node)
      setSelectedNode(node)
      setCurrentLevel(node.level)

      // Update breadcrumbs
      const newBreadcrumbs = [...breadcrumbs, { id: node.id, name: node.name, level: node.level }]
      setBreadcrumbs(newBreadcrumbs)

      // Auto-expand the focused node
      const newExpanded = new Set(expandedNodes)
      newExpanded.add(node.id)
      setExpandedNodes(newExpanded)
    }
  }

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      // Go to root
      setFocusedNode(null)
      setBreadcrumbs([])
      setCurrentLevel("container")
    } else {
      // Find the node in the tree
      const targetBreadcrumb = breadcrumbs[index]
      const node = findNodeById(explorerTree, targetBreadcrumb.id)
      if (node) {
        setFocusedNode(node)
        setSelectedNode(node)
        setCurrentLevel(node.level)
        setBreadcrumbs(breadcrumbs.slice(0, index + 1))
      }
    }
  }

  const findNodeById = (nodes: ExplorerNode[], id: string): ExplorerNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      const found = findNodeById(node.children, id)
      if (found) return found
    }
    return null
  }

  const getDisplayTree = (): ExplorerNode[] => {
    if (!focusedNode) return explorerTree
    return [focusedNode]
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "system":
        return <Box className="h-4 w-4" />
      case "container":
        return <Container className="h-4 w-4" />
      case "component":
        return <Component className="h-4 w-4" />
      case "class":
      case "interface":
        return <Code className="h-4 w-4" />
      case "external_system":
        return <Network className="h-4 w-4" />
      default:
        return <Box className="h-4 w-4" />
    }
  }

  const getColorForType = (type: string) => {
    switch (type) {
      case "system":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "container":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20"
      case "component":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "class":
      case "interface":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20"
      case "external_system":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
      default:
        return "bg-primary/10 text-primary border-primary/20"
    }
  }

  const renderNode = (node: ExplorerNode, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedNode?.id === node.id
    const hasChildren = node.children.length > 0
    const canZoomIn = (node.type === "container" || node.type === "component") && hasChildren

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
            isSelected ? "bg-primary/20 border border-primary/40" : "hover:bg-muted/50 border border-transparent"
          }`}
          style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
          onClick={() => selectNode(node)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(node.id)
              }}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}

          <div className={`p-1.5 rounded-md ${getColorForType(node.type)}`}>{getIconForType(node.type)}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{node.name}</span>
              <Badge variant="outline" className="text-xs capitalize">
                {node.type}
              </Badge>
            </div>
            {node.technology && <span className="text-xs text-muted-foreground">{node.technology}</span>}
          </div>

          {canZoomIn && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => zoomIntoNode(node, e)}
              title="Zoom into this element"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          )}

          {node.relationships.length > 0 && showRelationships && (
            <Badge variant="secondary" className="text-xs">
              {node.relationships.length} rel
            </Badge>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div className="space-y-1">{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  const renderRelationships = (node: ExplorerNode) => {
    if (!showRelationships || node.relationships.length === 0) return null

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Network className="h-4 w-4" />
          Relationships ({node.relationships.length})
        </h4>
        <div className="space-y-2">
          {node.relationships.map((rel, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
              <Badge variant="outline" className="text-xs">
                {rel.from === node.id ? "→" : "←"}
              </Badge>
              <span className="flex-1 truncate">{rel.description || "Connected"}</span>
              {rel.technology && (
                <Badge variant="secondary" className="text-xs">
                  {rel.technology}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const levelBadges: {
    level: "landscape" | "context" | "container" | "component" | "code"
    label: string
    icon: any
  }[] = [
    { level: "landscape", label: "Landscape", icon: Layers },
    { level: "context", label: "Context", icon: Box },
    { level: "container", label: "Container", icon: Container },
    { level: "component", label: "Component", icon: Component },
    { level: "code", label: "Code", icon: Code },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tree View */}
      <Card className="lg:col-span-2 softpop-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Architecture Explorer
              </CardTitle>
              <CardDescription>Navigate through your C4 model hierarchy</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRelationships(!showRelationships)}
              className="gap-2"
            >
              {showRelationships ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Relationships
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {breadcrumbs.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="ghost" size="sm" onClick={() => navigateToBreadcrumb(-1)} className="h-7 px-2 gap-1">
                  <Home className="h-3 w-3" />
                  Root
                </Button>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.id} className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <Button variant="ghost" size="sm" onClick={() => navigateToBreadcrumb(index)} className="h-7 px-2">
                      {crumb.name}
                    </Button>
                  </div>
                ))}
              </div>
              <Separator className="mt-3" />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {levelBadges.map(({ level, label, icon: Icon }) => (
              <Badge
                key={level}
                variant={currentLevel === level ? "default" : "outline"}
                className="cursor-pointer gap-1"
                onClick={() => setCurrentLevel(level)}
              >
                <Icon className="h-3 w-3" />
                {label}
              </Badge>
            ))}
          </div>
          <Separator className="mb-4" />
          <ScrollArea className="h-[600px] pr-4">
            {explorerTree.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Box className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No architecture elements to explore</p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  Select components, integrations, or plugins to build your model
                </p>
              </div>
            ) : (
              <div className="space-y-1">{getDisplayTree().map((node) => renderNode(node))}</div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Details Panel */}
      <Card className="softpop-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Element Details
          </CardTitle>
          <CardDescription>View selected element information</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${getColorForType(selectedNode.type)}`}>
                    {getIconForType(selectedNode.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{selectedNode.name}</h3>
                    <Badge variant="outline" className="text-xs capitalize mt-1">
                      {selectedNode.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {selectedNode.description && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedNode.description}</p>
                </div>
              )}

              {selectedNode.technology && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Technology</h4>
                  <Badge variant="secondary">{selectedNode.technology}</Badge>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold mb-2">Hierarchy</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="capitalize">
                      {selectedNode.level}
                    </Badge>
                    <span className="text-muted-foreground">Level</span>
                  </div>
                  {selectedNode.children.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{selectedNode.children.length}</Badge>
                      <span className="text-muted-foreground">Children</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {renderRelationships(selectedNode)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Eye className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Select an element to view details</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
