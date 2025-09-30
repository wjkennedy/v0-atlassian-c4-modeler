// Comprehensive C4 data model with level-specific relationships

export interface C4LevelRelationship {
  from: string
  to: string
  description: string
  technology?: string
  tags?: string[]
}

export interface ComponentDefinition {
  id: string
  name: string
  description: string
  category: string
  technology: string
  vendor: string
  atlassianProducts: string[]
  // Hierarchy tracking
  systemId?: string // Which system this component belongs to
  containerId?: string // Which container this component belongs to
  parentId?: string // Generic parent reference for flexibility
  level?: "system" | "container" | "component" | "code" // Explicit level indicator
  // Level-specific relationship definitions
  relationships: {
    landscape?: C4LevelRelationship[]
    context?: C4LevelRelationship[]
    container?: C4LevelRelationship[]
    component?: C4LevelRelationship[]
    code?: C4LevelRelationship[]
    plugin?: C4LevelRelationship[]
  }
}

export interface IntegrationDefinition {
  id: string
  name: string
  description: string
  category: string
  technology: string
  vendor: string
  atlassianProducts?: string[]
  // Hierarchy tracking
  systemId?: string
  containerId?: string
  parentId?: string
  level?: "system" | "container" | "component" | "code"
  // Level-specific relationship definitions
  relationships: {
    landscape?: C4LevelRelationship[]
    context?: C4LevelRelationship[]
    container?: C4LevelRelationship[]
    component?: C4LevelRelationship[]
    code?: C4LevelRelationship[]
    plugin?: C4LevelRelationship[]
  }
}

export interface PluginDefinition {
  id: string
  name: string
  description: string
  category: string
  technology: string
  vendor: string
  isPopular: boolean
  atlassianProducts: string[]
  businessFunction: string
  integrationPoints: string[]
  color?: string
  // Hierarchy tracking
  systemId?: string
  containerId?: string
  componentId?: string // Plugins can extend specific components
  parentId?: string
  level?: "system" | "container" | "component" | "code"
  // Level-specific relationship definitions
  relationships: {
    landscape?: C4LevelRelationship[]
    context?: C4LevelRelationship[]
    container?: C4LevelRelationship[]
    component?: C4LevelRelationship[]
    code?: C4LevelRelationship[]
    plugin?: C4LevelRelationship[]
  }
}

export interface InternalDefinition {
  id: string
  name: string
  description: string
  category: string
  technology: string
  vendor: string
  atlassianProducts?: string[]
  // Hierarchy tracking
  systemId?: string
  containerId?: string
  parentId?: string
  level?: "system" | "container" | "component" | "code"
  // Level-specific relationship definitions
  relationships: {
    landscape?: C4LevelRelationship[]
    context?: C4LevelRelationship[]
    container?: C4LevelRelationship[]
    component?: C4LevelRelationship[]
    code?: C4LevelRelationship[]
    plugin?: C4LevelRelationship[]
  }
}

export interface C4Catalog {
  version: string
  lastUpdated: string
  components: ComponentDefinition[]
  integrations: IntegrationDefinition[]
  plugins: PluginDefinition[]
  internal?: InternalDefinition[]
}

export const defaultC4Catalog: C4Catalog = {
  version: "1.1.0",
  lastUpdated: "2025-09-30T16:43:19.391322Z",
  components: [],
  integrations: [],
  plugins: [],
  internal: [],
}

export async function loadCatalogFromFile(): Promise<C4Catalog> {
  try {
    const response = await fetch("/data/c4-catalog-v1.1.json")
    const catalog = await response.json()
    return catalog
  } catch (error) {
    console.error("[v0] Failed to load catalog from file:", error)
    return defaultC4Catalog
  }
}

// Utility functions for catalog management
export function exportCatalog(catalog: C4Catalog): string {
  return JSON.stringify(catalog, null, 2)
}

export function importCatalog(jsonString: string): C4Catalog {
  const catalog = JSON.parse(jsonString)
  return {
    ...catalog,
    lastUpdated: new Date().toISOString(),
  }
}

export function mergeCatalogs(existing: C4Catalog, imported: C4Catalog): C4Catalog {
  return {
    version: imported.version || existing.version,
    lastUpdated: new Date().toISOString(),
    components: [...existing.components, ...imported.components],
    integrations: [...existing.integrations, ...imported.integrations],
    plugins: [...existing.plugins, ...imported.plugins],
    internal: [...(existing.internal || []), ...(imported.internal || [])], // Merge internal systems
  }
}

// Utility functions for hierarchy navigation
export function getChildrenOf(
  catalog: C4Catalog,
  parentId: string,
): Array<ComponentDefinition | IntegrationDefinition | PluginDefinition | InternalDefinition> {
  const allItems = [...catalog.components, ...catalog.integrations, ...catalog.plugins, ...(catalog.internal || [])]
  return allItems.filter(
    (item) => item.parentId === parentId || item.containerId === parentId || item.systemId === parentId,
  )
}

export function getParentOf(
  catalog: C4Catalog,
  itemId: string,
): ComponentDefinition | IntegrationDefinition | PluginDefinition | InternalDefinition | undefined {
  const allItems = [...catalog.components, ...catalog.integrations, ...catalog.plugins, ...(catalog.internal || [])]
  const item = allItems.find((i) => i.id === itemId)
  if (!item) return undefined

  const parentId = item.parentId || item.containerId || item.systemId
  if (!parentId) return undefined

  return allItems.find((i) => i.id === parentId)
}

export function getHierarchyPath(
  catalog: C4Catalog,
  itemId: string,
): Array<ComponentDefinition | IntegrationDefinition | PluginDefinition | InternalDefinition> {
  const path: Array<ComponentDefinition | IntegrationDefinition | PluginDefinition | InternalDefinition> = []
  const allItems = [...catalog.components, ...catalog.integrations, ...catalog.plugins, ...(catalog.internal || [])]

  let currentItem = allItems.find((i) => i.id === itemId)
  while (currentItem) {
    path.unshift(currentItem)
    const parentId = currentItem.parentId || currentItem.containerId || currentItem.systemId
    if (!parentId) break
    currentItem = allItems.find((i) => i.id === parentId)
  }

  return path
}

export function getItemsByLevel(
  catalog: C4Catalog,
  level: "system" | "container" | "component" | "code",
): Array<ComponentDefinition | IntegrationDefinition | PluginDefinition | InternalDefinition> {
  const allItems = [...catalog.components, ...catalog.integrations, ...catalog.plugins, ...(catalog.internal || [])]
  return allItems.filter((item) => item.level === level)
}

export function getItemsInSystem(
  catalog: C4Catalog,
  systemId: string,
): Array<ComponentDefinition | IntegrationDefinition | PluginDefinition | InternalDefinition> {
  const allItems = [...catalog.components, ...catalog.integrations, ...catalog.plugins, ...(catalog.internal || [])]
  return allItems.filter((item) => item.systemId === systemId || item.id === systemId)
}

export function getItemsInContainer(
  catalog: C4Catalog,
  containerId: string,
): Array<ComponentDefinition | IntegrationDefinition | PluginDefinition | InternalDefinition> {
  const allItems = [...catalog.components, ...catalog.integrations, ...catalog.plugins, ...(catalog.internal || [])]
  return allItems.filter((item) => item.containerId === containerId || item.id === containerId)
}
