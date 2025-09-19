// Core C4 model generation utilities

export interface C4Element {
  id: string
  name: string
  type: "person" | "system" | "container" | "component"
  description: string
  technology?: string
  tags?: string[]
}

export interface C4Relationship {
  from: string
  to: string
  description: string
  technology?: string
  tags?: string[]
}

export interface C4Model {
  title: string
  description?: string
  elements: C4Element[]
  relationships: C4Relationship[]
  level: "context" | "container" | "component" | "code"
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

  addElement(element: C4Element): this {
    this.model.elements.push(element)
    return this
  }

  addRelationship(relationship: C4Relationship): this {
    this.model.relationships.push(relationship)
    return this
  }

  setDescription(description: string): this {
    this.model.description = description
    return this
  }

  generatePlantUML(): string {
    const includeMap = {
      context: "C4_Context.puml",
      container: "C4_Container.puml",
      component: "C4_Component.puml",
      code: "C4_Component.puml",
    }

    let puml = `@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/${includeMap[this.model.level]}

title ${this.model.title}
${this.model.description ? `\n!define DESCRIPTION ${this.model.description}` : ""}

`

    // Add elements
    this.model.elements.forEach((element) => {
      const elementType = this.getPlantUMLElementType(element.type)
      const tech = element.technology ? `, "${element.technology}"` : ""
      puml += `${elementType}(${element.id}, "${element.name}"${tech}, "${element.description}")
`
    })

    puml += `
`

    // Add relationships
    this.model.relationships.forEach((rel) => {
      const tech = rel.technology ? `, "${rel.technology}"` : ""
      puml += `Rel(${rel.from}, ${rel.to}, "${rel.description}"${tech})
`
    })

    puml += `
@enduml`

    return puml
  }

  generateMermaid(): string {
    let mermaid = `graph TD
`

    // Add elements with styling
    this.model.elements.forEach((element) => {
      const shape = this.getMermaidShape(element.type)
      mermaid += `    ${element.id}${shape}
`
    })

    mermaid += `
`

    // Add relationships
    this.model.relationships.forEach((rel) => {
      mermaid += `    ${rel.from} -->|${rel.description}| ${rel.to}
`
    })

    // Add styling
    mermaid += `
    classDef person fill:#08427b
    classDef system fill:#1168bd
    classDef container fill:#438dd5
    classDef component fill:#85bbf0
`

    this.model.elements.forEach((element) => {
      mermaid += `    class ${element.id} ${element.type}
`
    })

    return mermaid
  }

  generateStructurizr(): string {
    let dsl = `workspace {
    model {
`

    // Group elements by type
    const people = this.model.elements.filter((e) => e.type === "person")
    const systems = this.model.elements.filter((e) => e.type === "system")
    const containers = this.model.elements.filter((e) => e.type === "container")
    const components = this.model.elements.filter((e) => e.type === "component")

    // Add people
    people.forEach((person) => {
      dsl += `        ${person.id} = person "${person.name}" "${person.description}"
`
    })

    // Add systems
    systems.forEach((system) => {
      dsl += `        ${system.id} = softwareSystem "${system.name}" "${system.description}"
`
    })

    // Add containers within systems (simplified)
    if (containers.length > 0) {
      dsl += `        
        mainSystem = softwareSystem "${this.model.title}" {
`
      containers.forEach((container) => {
        const tech = container.technology ? ` "${container.technology}"` : ""
        dsl += `            ${container.id} = container "${container.name}"${tech} "${container.description}"
`
      })
      dsl += `        }
`
    }

    dsl += `
`

    // Add relationships
    this.model.relationships.forEach((rel) => {
      dsl += `        ${rel.from} -> ${rel.to} "${rel.description}"
`
    })

    dsl += `    }
    
    views {
        systemContext mainSystem {
            include *
            autoLayout
        }
        
        container mainSystem {
            include *
            autoLayout
        }
    }
}`

    return dsl
  }

  private getPlantUMLElementType(type: C4Element["type"]): string {
    const typeMap = {
      person: "Person",
      system: "System",
      container: "Container",
      component: "Component",
    }
    return typeMap[type] || "Container"
  }

  private getMermaidShape(type: C4Element["type"]): string {
    const shapeMap = {
      person: `["${type}"]`,
      system: `[${type}]`,
      container: `(${type})`,
      component: `{${type}}`,
    }
    return shapeMap[type] || `[${type}]`
  }

  getModel(): C4Model {
    return { ...this.model }
  }
}

// Utility functions for Atlassian-specific components
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
    const component = getAtlassianComponent(componentId)
    if (component) {
      generator.addElement({
        id: componentId,
        name: component.name,
        type: "container",
        description: component.description,
        technology: "Atlassian Cloud",
        tags: ["atlassian"],
      })

      // Add relationship from user to component
      generator.addRelationship({
        from: "user",
        to: componentId,
        description: "Uses",
      })
    }
  })

  // Add integrations as external systems
  selectedIntegrations.forEach((integrationId) => {
    const integration = getIntegrationData(integrationId)
    if (integration) {
      generator.addElement({
        id: integrationId,
        name: integration.name,
        type: "system",
        description: integration.description,
        tags: ["external"],
      })

      // Add relationships from components to integrations
      if (selectedComponents.length > 0) {
        generator.addRelationship({
          from: selectedComponents[0],
          to: integrationId,
          description: "Integrates with",
          technology: "HTTPS/REST API",
        })
      }
    }
  })

  return generator
}

function getAtlassianComponent(id: string) {
  const components: Record<string, { name: string; description: string }> = {
    "jira-software": { name: "Jira Software", description: "Project management and issue tracking" },
    "jira-service-management": { name: "Jira Service Management", description: "IT service management platform" },
    confluence: { name: "Confluence", description: "Team collaboration and documentation" },
    bitbucket: { name: "Bitbucket", description: "Git repository management" },
    compass: { name: "Compass", description: "Developer experience platform" },
    atlas: { name: "Atlas", description: "Team directory and insights" },
    statuspage: { name: "Statuspage", description: "Status communication platform" },
    opsgenie: { name: "Opsgenie", description: "Incident management and alerting" },
    "database-primary": { name: "Primary Database", description: "Main application database" },
    "database-analytics": { name: "Analytics Database", description: "Data warehouse and analytics" },
  }
  return components[id]
}

function getIntegrationData(id: string) {
  const integrations: Record<string, { name: string; description: string }> = {
    servicenow: { name: "ServiceNow", description: "IT service management and workflow automation" },
    salesforce: { name: "Salesforce", description: "Customer relationship management" },
    github: { name: "GitHub", description: "Code repository and collaboration" },
    okta: { name: "Okta", description: "Identity and access management" },
    "azure-ad": { name: "Azure Active Directory", description: "Microsoft identity platform" },
    slack: { name: "Slack", description: "Team communication and collaboration" },
    "microsoft-teams": { name: "Microsoft Teams", description: "Unified communication platform" },
    tableau: { name: "Tableau", description: "Business intelligence and analytics" },
    "power-bi": { name: "Power BI", description: "Microsoft business analytics" },
    jenkins: { name: "Jenkins", description: "Continuous integration and deployment" },
    aws: { name: "Amazon Web Services", description: "Cloud infrastructure and services" },
    azure: { name: "Microsoft Azure", description: "Cloud computing platform" },
    "audit-framework": { name: "Audit Framework", description: "Compliance and audit trail management" },
    "reporting-engine": { name: "Reporting Engine", description: "Custom reporting and analytics" },
    "automation-platform": { name: "Automation Platform", description: "Workflow and process automation" },
    "work-item-classifier": { name: "Work Item Classifier", description: "AI-powered work item classification" },
    "data-ingestion": { name: "Data Ingestion Service", description: "Custom data import and processing" },
  }
  return integrations[id]
}
