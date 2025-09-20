import { generateComponentRelationships } from "./relationship-generator"

export interface MultiLevelC4Model {
  landscape: C4Model
  context: C4Model
  container: C4Model
  component: C4Model
  code: C4Model
  plugin?: C4Model
}

export interface C4Model {
  title: string
  description?: string
  elements: C4Element[]
  relationships: C4Relationship[]
  level: "context" | "container" | "component" | "code" | "landscape" | "plugin"
}

export interface C4Element {
  id: string
  name: string
  type: "person" | "system" | "container" | "component" | "external"
  description: string
  technology?: string
}

export interface C4Relationship {
  from: string
  to: string
  description: string
  technology?: string
}

export interface Component {
  id: string
  name: string
  description: string
  type?: string
  technology?: string
}

export interface Integration {
  id: string
  name: string
  description: string
  type?: string
  technology?: string
}

export function createMultiLevelAtlassianC4Model(
  componentIds: string[],
  integrationIds: string[],
  title: string,
  pluginIds: string[] = [],
): MultiLevelC4Model {
  // Load component and integration data
  const components: Component[] = componentIds.map((id) => getComponentData(id)).filter(Boolean)
  const integrations: Integration[] = integrationIds.map((id) => getIntegrationData(id)).filter(Boolean)

  const pluginData = pluginIds.map((id) => getPluginData(id)).filter(Boolean)

  // Convert plugins to components for diagram rendering
  const pluginComponents: Component[] = pluginData.map((plugin) => ({
    id: plugin.key,
    name: plugin.name,
    description: plugin.summary,
    type: "component",
    technology: "Atlassian Plugin",
  }))

  const allComponents = [...components, ...pluginComponents]
  const allIntegrations = integrations

  // Generate different C4 levels
  return {
    landscape: {
      title: `${title} - System Landscape`,
      level: "landscape",
      elements: [
        {
          id: "user",
          name: "Solution Partner",
          type: "person",
          description: "Atlassian solution partner",
        },
        ...allComponents.map((comp) => ({
          id: comp.id,
          name: comp.name,
          description: comp.description,
          type: "system" as const,
          technology: comp.technology,
        })),
      ],
      relationships: generateBasicRelationships(allComponents, allIntegrations),
    },
    context: {
      title: `${title} - System Context`,
      level: "context",
      elements: [
        {
          id: "user",
          name: "Solution Partner",
          type: "person",
          description: "Atlassian solution partner",
        },
        ...allComponents.map((comp) => ({
          id: comp.id,
          name: comp.name,
          description: comp.description,
          type: "system" as const,
          technology: comp.technology,
        })),
        ...allIntegrations.map((int) => ({
          id: int.id,
          name: int.name,
          description: int.description,
          type: "external" as const,
          technology: int.technology,
        })),
      ],
      relationships: generateComponentRelationships(allComponents, allIntegrations),
    },
    container: {
      title: `${title} - Container Diagram`,
      level: "container",
      elements: allComponents.map((comp) => ({
        id: comp.id,
        name: comp.name,
        description: comp.description,
        type: "container" as const,
        technology: comp.technology,
      })),
      relationships: generateComponentRelationships(allComponents, allIntegrations),
    },
    component: {
      title: `${title} - Component Diagram`,
      level: "component",
      elements: allComponents.map((comp) => ({
        id: comp.id,
        name: comp.name,
        description: comp.description,
        type: "component" as const,
        technology: comp.technology,
      })),
      relationships: generateComponentRelationships(allComponents, allIntegrations),
    },
    code: {
      title: `${title} - Code Diagram`,
      level: "code",
      elements: allComponents.map((comp) => ({
        id: comp.id,
        name: comp.name,
        description: comp.description,
        type: "component" as const,
        technology: comp.technology,
      })),
      relationships: generateComponentRelationships(allComponents, allIntegrations),
    },
  }
}

export function createAtlassianC4Model(
  selectedComponents: string[],
  selectedIntegrations: string[],
  config: { title: string; level: string },
): C4ModelGenerator {
  const generator = new C4ModelGenerator(config.title, config.level as C4Model["level"])

  // Add user/person
  generator.addElement({
    id: "user",
    name: "Solution Partner",
    type: "person",
    description: "Atlassian solution partner managing enterprise architecture",
  })

  // Add Atlassian components
  selectedComponents.forEach((componentId) => {
    const component = getComponentData(componentId)
    if (component) {
      generator.addElement({
        id: componentId,
        name: component.name,
        type: "system",
        description: component.description,
        technology: component.technology,
      })
    }
  })

  // Add integrations
  selectedIntegrations.forEach((integrationId) => {
    const integration = getIntegrationData(integrationId)
    if (integration) {
      generator.addElement({
        id: integrationId,
        name: integration.name,
        type: "external",
        description: integration.description,
        technology: integration.technology,
      })
    }
  })

  return generator
}

export class C4ModelGenerator {
  private model: C4Model

  constructor(title: string, level: C4Model["level"] = "container") {
    this.model = {
      title,
      level,
      elements: [],
      relationships: [],
    }
  }

  addElement(element: C4Element) {
    this.model.elements.push(element)
  }

  addRelationship(relationship: C4Relationship) {
    this.model.relationships.push(relationship)
  }

  generatePlantUML(): string {
    // Implementation for PlantUML generation
    return `@startuml\n!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml\n\ntitle ${this.model.title}\n\n@enduml`
  }

  generateMermaid(): string {
    // Implementation for Mermaid generation
    return `graph TD\n    title[${this.model.title}]`
  }

  generateStructurizr(): string {
    // Implementation for Structurizr generation
    return `workspace "${this.model.title}" {\n    model {\n    }\n}`
  }
}

function getPluginData(pluginId: string) {
  // This would normally load from the JSON file, but for now we'll use a lookup
  try {
    // In a real implementation, this would load from the actual plugin data file
    // For now, return a mock plugin structure
    return {
      key: pluginId,
      name: pluginId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      summary: `${pluginId} plugin functionality`,
    }
  } catch (error) {
    console.warn("[v0] Could not load plugin data:", error)
    return null
  }
}

function getComponentData(id: string): Component | null {
  const components: Record<string, Component> = {
    "jira-software": { id, name: "Jira Software", description: "Project management", technology: "Web Application" },
    "jira-service-management": {
      id,
      name: "Jira Service Management",
      description: "ITSM platform",
      technology: "Web Application",
    },
    confluence: { id, name: "Confluence", description: "Team collaboration", technology: "Web Application" },
    bitbucket: { id, name: "Bitbucket", description: "Git repository", technology: "Version Control" },
    compass: { id, name: "Compass", description: "Developer experience", technology: "Web Application" },
    atlas: { id, name: "Atlas", description: "Team directory", technology: "Web Application" },
    statuspage: { id, name: "Statuspage", description: "Status communication", technology: "Web Application" },
    opsgenie: { id, name: "Opsgenie", description: "Incident management", technology: "Web Application" },
    "database-primary": { id, name: "Primary Database", description: "Main data store", technology: "Database" },
    "database-analytics": { id, name: "Analytics Database", description: "Data warehouse", technology: "Database" },
  }
  return components[id] || null
}

function getIntegrationData(id: string): Integration | null {
  const integrations: Record<string, Integration> = {
    servicenow: { id, name: "ServiceNow", description: "ITSM platform", technology: "REST API" },
    salesforce: { id, name: "Salesforce", description: "CRM platform", technology: "REST API" },
    github: { id, name: "GitHub", description: "Code repository", technology: "REST API" },
    okta: { id, name: "Okta", description: "Identity management", technology: "SAML/OAuth" },
    "azure-ad": { id, name: "Azure AD", description: "Microsoft identity", technology: "SAML/OAuth" },
    slack: { id, name: "Slack", description: "Team communication", technology: "Webhook/API" },
    "microsoft-teams": { id, name: "Microsoft Teams", description: "Unified communication", technology: "Webhook/API" },
    tableau: { id, name: "Tableau", description: "Business intelligence", technology: "REST API" },
    "power-bi": { id, name: "Power BI", description: "Microsoft analytics", technology: "REST API" },
    jenkins: { id, name: "Jenkins", description: "CI/CD platform", technology: "REST API" },
    aws: { id, name: "Amazon Web Services", description: "Cloud infrastructure", technology: "REST API" },
    azure: { id, name: "Microsoft Azure", description: "Cloud platform", technology: "REST API" },
  }
  return integrations[id] || null
}

function generateBasicRelationships(components: Component[], integrations: Integration[]): C4Relationship[] {
  const relationships: C4Relationship[] = []

  // Connect user to first component
  if (components.length > 0) {
    relationships.push({
      from: "user",
      to: components[0].id,
      description: "Uses",
    })
  }

  return relationships
}
