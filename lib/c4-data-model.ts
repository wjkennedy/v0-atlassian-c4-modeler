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
  internal?: InternalDefinition[] // Added optional internal systems array
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
