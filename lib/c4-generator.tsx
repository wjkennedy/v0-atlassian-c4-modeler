// Core C4 model generation utilities

export interface C4Element {
  id: string
  name: string
  type: "person" | "system" | "container" | "component"
  description: string
  technology?: string
  tags?: string[]
  parent?: string // For hierarchical relationships
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
  level: "context" | "container" | "component" | "code" | "landscape"
}

export interface MultiLevelC4Model {
  landscape: C4Model // Added System Landscape diagram
  context: C4Model
  container: C4Model
  component: C4Model
  code: C4Model
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
      landscape: "C4_Context.puml", // Added landscape mapping
      context: "C4_Context.puml",
      container: "C4_Container.puml",
      component: "C4_Component.puml",
      code: "C4_Component.puml",
    }

    let puml = `@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/${includeMap[this.model.level]}

title ${this.model.title.replace(/[^\w\s-]/g, "")} - ${this.model.level.charAt(0).toUpperCase() + this.model.level.slice(1)} Diagram
${this.model.description ? `\n!define DESCRIPTION ${this.model.description.replace(/[^\w\s-]/g, "")}` : ""}

`

    // Add elements
    this.model.elements.forEach((element) => {
      const elementType = this.getPlantUMLElementType(element.type)
      const tech = element.technology ? `, "${element.technology.replace(/"/g, "'")}"` : ""
      const safeName = element.name.replace(/"/g, "'")
      const safeDescription = element.description.replace(/"/g, "'")
      puml += `${elementType}(${element.id}, "${safeName}"${tech}, "${safeDescription}")
`
    })

    puml += `
`

    // Add relationships
    this.model.relationships.forEach((rel) => {
      const tech = rel.technology ? `, "${rel.technology.replace(/"/g, "'")}"` : ""
      const safeDescription = rel.description.replace(/"/g, "'")
      puml += `Rel(${rel.from}, ${rel.to}, "${safeDescription}"${tech})
`
    })

    puml += `
@enduml`

    return puml
  }

  generateMermaid(): string {
    let mermaid = `---
title: ${this.model.title} - ${this.model.level.charAt(0).toUpperCase() + this.model.level.slice(1)} Diagram
---
graph TD

`

    // Add elements with styling
    this.model.elements.forEach((element) => {
      const shape = this.getMermaidShape(element.type)
      const tech = element.technology ? `<br/><i>${element.technology}</i>` : ""
      const safeName = element.name.replace(/[<>]/g, "")
      const safeDescription = element.description.replace(/[<>]/g, "")
      const content = `${safeName}${tech}<br/>${safeDescription}`
      mermaid += `    ${element.id}${shape.replace("${type}", content)}
`
    })

    mermaid += `
`

    // Add relationships
    this.model.relationships.forEach((rel) => {
      const tech = rel.technology ? ` (${rel.technology})` : ""
      const safeDescription = rel.description.replace(/\|/g, " ")
      mermaid += `    ${rel.from} -->|${safeDescription}${tech}| ${rel.to}
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
    let dsl = `workspace "${this.model.title} - ${this.model.level.charAt(0).toUpperCase() + this.model.level.slice(1)} Diagram" {
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

export class MultiLevelC4Generator {
  private baseTitle: string
  private selectedComponents: string[]
  private selectedIntegrations: string[]

  constructor(title: string, selectedComponents: string[], selectedIntegrations: string[]) {
    this.baseTitle = title
    this.selectedComponents = selectedComponents
    this.selectedIntegrations = selectedIntegrations
  }

  generateAllLevels(): MultiLevelC4Model {
    return {
      landscape: this.generateSystemLandscape(), // Added System Landscape generation
      context: this.generateContextDiagram(),
      container: this.generateContainerDiagram(),
      component: this.generateComponentDiagram(),
      code: this.generateCodeDiagram(),
    }
  }

  private generateContextDiagram(): C4Model {
    const generator = new C4ModelGenerator(`${this.baseTitle}`, "context")

    // Add main user
    generator.addElement({
      id: "user",
      name: "Solution Partner",
      type: "person",
      description: "Atlassian solution partner managing enterprise architecture",
    })

    // Add main Atlassian system
    generator.addElement({
      id: "atlassian_system",
      name: "Atlassian Cloud Platform",
      type: "system",
      description: "Integrated suite of Atlassian Cloud products for enterprise collaboration",
      technology: "Cloud SaaS",
    })

    // Add external systems based on integrations
    this.selectedIntegrations.forEach((integrationId) => {
      const integration = getIntegrationData(integrationId)
      if (integration) {
        generator.addElement({
          id: integrationId,
          name: integration.name,
          type: "system",
          description: integration.description,
          tags: ["external"],
        })

        // Add relationship from Atlassian system to integration
        generator.addRelationship({
          from: "atlassian_system",
          to: integrationId,
          description: "Integrates with",
          technology: this.getIntegrationTechnology(integrationId),
        })
      }
    })

    // Add relationship from user to main system
    generator.addRelationship({
      from: "user",
      to: "atlassian_system",
      description: "Uses for project management and collaboration",
    })

    return generator.getModel()
  }

  private generateContainerDiagram(): C4Model {
    const generator = new C4ModelGenerator(`${this.baseTitle}`, "container")

    // Add user
    generator.addElement({
      id: "user",
      name: "Solution Partner",
      type: "person",
      description: "Atlassian solution partner managing enterprise architecture",
    })

    // Add Atlassian containers based on selected components
    this.selectedComponents.forEach((componentId) => {
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
          technology: "HTTPS/Web UI",
        })
      }
    })

    if (this.hasCICDIntegrations()) {
      // Add CI/CD pipeline container
      generator.addElement({
        id: "cicd_pipeline",
        name: "CI/CD Pipeline",
        type: "container",
        description: "Automated build, test, and deployment pipeline",
        technology: "Jenkins/GitHub Actions/Azure DevOps",
        tags: ["automation"],
      })

      // Add artifact repository
      generator.addElement({
        id: "artifact_repo",
        name: "Artifact Repository",
        type: "container",
        description: "Stores build artifacts and deployment packages",
        technology: "Docker Registry/Nexus/Azure Artifacts",
        tags: ["storage"],
      })

      // Add deployment tracking
      generator.addElement({
        id: "deployment_tracker",
        name: "Deployment Tracker",
        type: "container",
        description: "Tracks deployment status and release information",
        technology: "Custom Service",
        tags: ["monitoring"],
      })

      // Connect CI/CD to relevant components
      const repoSources = ["bitbucket", "github"]
      const selectedRepo = repoSources.find(
        (repo) => this.selectedComponents.includes(repo) || this.selectedIntegrations.includes(repo),
      )

      if (selectedRepo) {
        generator.addRelationship({
          from: selectedRepo,
          to: "cicd_pipeline",
          description: "Triggers builds on code changes",
          technology: "Webhooks",
        })
      }

      generator.addRelationship({
        from: "cicd_pipeline",
        to: "artifact_repo",
        description: "Stores build artifacts",
        technology: "REST API",
      })

      generator.addRelationship({
        from: "cicd_pipeline",
        to: "deployment_tracker",
        description: "Reports deployment status",
        technology: "REST API",
      })

      // Connect to Jira if selected
      if (this.selectedComponents.includes("jira-software")) {
        generator.addRelationship({
          from: "deployment_tracker",
          to: "jira-software",
          description: "Updates issue status and deployment info",
          technology: "REST API",
        })
      }
    }

    // Add databases if components require them
    if (this.selectedComponents.some((id) => ["jira-software", "confluence", "jira-service-management"].includes(id))) {
      generator.addElement({
        id: "primary_database",
        name: "Primary Database",
        type: "container",
        description: "Main application database for Atlassian products",
        technology: "PostgreSQL/MySQL",
        tags: ["database"],
      })

      // Connect relevant components to database
      this.selectedComponents.forEach((componentId) => {
        if (["jira-software", "confluence", "jira-service-management"].includes(componentId)) {
          generator.addRelationship({
            from: componentId,
            to: "primary_database",
            description: "Reads from and writes to",
            technology: "JDBC/SQL",
          })
        }
      })
    }

    // Add external integrations as external systems
    this.selectedIntegrations.forEach((integrationId) => {
      const integration = getIntegrationData(integrationId)
      if (integration && !["jenkins", "github"].includes(integrationId)) {
        // Skip already handled CI/CD
        generator.addElement({
          id: integrationId,
          name: integration.name,
          type: "system",
          description: integration.description,
          tags: ["external"],
        })

        // Connect to relevant Atlassian components
        if (this.selectedComponents.length > 0) {
          generator.addRelationship({
            from: this.selectedComponents[0],
            to: integrationId,
            description: "Integrates with",
            technology: this.getIntegrationTechnology(integrationId),
          })
        }
      }
    })

    return generator.getModel()
  }

  private generateComponentDiagram(): C4Model {
    const generator = new C4ModelGenerator(`${this.baseTitle}`, "component")

    // Focus on the first selected component for detailed breakdown
    const primaryComponent = this.selectedComponents[0]
    if (!primaryComponent) return generator.getModel()

    const component = getAtlassianComponent(primaryComponent)
    if (!component) return generator.getModel()

    // Add user
    generator.addElement({
      id: "user",
      name: "Solution Partner",
      type: "person",
      description: "Atlassian solution partner managing enterprise architecture",
    })

    // Add components within the primary container
    const componentMap = this.getComponentBreakdown(primaryComponent)
    Object.entries(componentMap).forEach(([id, comp]) => {
      generator.addElement({
        id,
        name: comp.name,
        type: "component",
        description: comp.description,
        technology: comp.technology,
        parent: primaryComponent,
      })
    })

    // Add database
    generator.addElement({
      id: "database",
      name: "Database",
      type: "container",
      description: "Application database",
      technology: "PostgreSQL",
    })

    // Add relationships between components
    generator.addRelationship({
      from: "user",
      to: "web_controller",
      description: "Makes requests to",
      technology: "HTTPS",
    })

    generator.addRelationship({
      from: "web_controller",
      to: "business_logic",
      description: "Uses",
    })

    generator.addRelationship({
      from: "business_logic",
      to: "data_access",
      description: "Uses",
    })

    generator.addRelationship({
      from: "data_access",
      to: "database",
      description: "Reads from and writes to",
      technology: "JDBC/SQL",
    })

    if (this.selectedIntegrations.includes("jenkins") || this.selectedIntegrations.includes("github")) {
      generator.addElement({
        id: "webhook_handler",
        name: "Webhook Handler",
        type: "component",
        description: "Processes incoming webhooks from CI/CD systems",
        technology: "REST API",
      })

      generator.addElement({
        id: "deployment_tracker",
        name: "Deployment Tracker",
        type: "component",
        description: "Tracks deployment status and updates issues",
        technology: "Background Service",
      })

      generator.addRelationship({
        from: "webhook_handler",
        to: "deployment_tracker",
        description: "Triggers",
      })

      generator.addRelationship({
        from: "deployment_tracker",
        to: "business_logic",
        description: "Updates issue status via",
      })
    }

    return generator.getModel()
  }

  private generateCodeDiagram(): C4Model {
    const generator = new C4ModelGenerator(`${this.baseTitle}`, "code")

    // This would typically show class-level details
    // For demonstration, we'll show key classes for the business logic component

    generator.addElement({
      id: "IssueController",
      name: "IssueController",
      type: "component",
      description: "REST controller for issue operations",
      technology: "Java/Spring",
    })

    generator.addElement({
      id: "IssueService",
      name: "IssueService",
      type: "component",
      description: "Business logic for issue management",
      technology: "Java",
    })

    generator.addElement({
      id: "IssueRepository",
      name: "IssueRepository",
      type: "component",
      description: "Data access layer for issues",
      technology: "JPA/Hibernate",
    })

    generator.addElement({
      id: "Issue",
      name: "Issue",
      type: "component",
      description: "Domain model representing an issue",
      technology: "Java Entity",
    })

    // Add relationships
    generator.addRelationship({
      from: "IssueController",
      to: "IssueService",
      description: "Uses",
    })

    generator.addRelationship({
      from: "IssueService",
      to: "IssueRepository",
      description: "Uses",
    })

    generator.addRelationship({
      from: "IssueRepository",
      to: "Issue",
      description: "Manages",
    })

    return generator.getModel()
  }

  private generateSystemLandscape(): C4Model {
    const generator = new C4ModelGenerator(`${this.baseTitle} - Enterprise Landscape`, "landscape")

    // Add different types of users/personas
    generator.addElement({
      id: "solution_partner",
      name: "Solution Partner",
      type: "person",
      description: "Atlassian solution partner managing enterprise architecture",
    })

    generator.addElement({
      id: "end_users",
      name: "End Users",
      type: "person",
      description: "Development teams and business users",
    })

    generator.addElement({
      id: "administrators",
      name: "System Administrators",
      type: "person",
      description: "IT administrators managing the platform",
    })

    // Add main Atlassian ecosystem as a system
    generator.addElement({
      id: "atlassian_ecosystem",
      name: "Atlassian Cloud Ecosystem",
      type: "system",
      description: "Complete Atlassian Cloud platform with integrated products",
      technology: "Cloud SaaS",
    })

    // Add external systems based on integrations
    this.selectedIntegrations.forEach((integrationId) => {
      const integration = getIntegrationData(integrationId)
      if (integration) {
        generator.addElement({
          id: integrationId,
          name: integration.name,
          type: "system",
          description: integration.description,
          tags: ["external"],
        })

        // Connect external systems to Atlassian ecosystem
        generator.addRelationship({
          from: "atlassian_ecosystem",
          to: integrationId,
          description: "Integrates with",
          technology: this.getIntegrationTechnology(integrationId),
        })
      }
    })

    // Add relationships from users to systems
    generator.addRelationship({
      from: "solution_partner",
      to: "atlassian_ecosystem",
      description: "Configures and manages",
    })

    generator.addRelationship({
      from: "end_users",
      to: "atlassian_ecosystem",
      description: "Uses for daily work",
    })

    generator.addRelationship({
      from: "administrators",
      to: "atlassian_ecosystem",
      description: "Administers and maintains",
    })

    return generator.getModel()
  }

  private getComponentBreakdown(
    componentId: string,
  ): Record<string, { name: string; description: string; technology: string }> {
    const breakdowns: Record<string, Record<string, { name: string; description: string; technology: string }>> = {
      "jira-software": {
        web_controller: {
          name: "Web Controller",
          description: "Handles HTTP requests and responses",
          technology: "Spring MVC",
        },
        business_logic: {
          name: "Business Logic",
          description: "Core issue management and workflow logic",
          technology: "Java Services",
        },
        data_access: {
          name: "Data Access Layer",
          description: "Database operations and queries",
          technology: "JPA/Hibernate",
        },
        notification_service: {
          name: "Notification Service",
          description: "Handles email and in-app notifications",
          technology: "Message Queue",
        },
      },
      confluence: {
        web_controller: {
          name: "Page Controller",
          description: "Handles page and space operations",
          technology: "Spring MVC",
        },
        business_logic: {
          name: "Content Service",
          description: "Page creation, editing, and collaboration logic",
          technology: "Java Services",
        },
        data_access: {
          name: "Content Repository",
          description: "Page and attachment storage operations",
          technology: "JPA + File Storage",
        },
        search_service: {
          name: "Search Service",
          description: "Content indexing and search functionality",
          technology: "Elasticsearch",
        },
      },
    }

    return (
      breakdowns[componentId] || {
        web_controller: {
          name: "Web Controller",
          description: "Handles HTTP requests",
          technology: "REST API",
        },
        business_logic: {
          name: "Business Logic",
          description: "Core application logic",
          technology: "Application Service",
        },
        data_access: {
          name: "Data Access",
          description: "Database operations",
          technology: "Data Layer",
        },
      }
    )
  }

  private getIntegrationTechnology(integrationId: string): string {
    const techMap: Record<string, string> = {
      servicenow: "REST API/SOAP",
      salesforce: "REST API/OAuth",
      github: "REST API/Webhooks",
      "github-enterprise": "REST API/Webhooks",
      gitlab: "REST API/Webhooks",
      okta: "SAML/OAuth 2.0",
      "azure-ad": "SAML/OAuth 2.0",
      "google-workspace": "REST API",
      slack: "REST API/Webhooks",
      "microsoft-teams": "Graph API/Webhooks",
      zoom: "REST API/Webhooks",
      tableau: "REST API/JDBC",
      "power-bi": "REST API/OData",
      looker: "REST API",
      jenkins: "REST API/Webhooks",
      "azure-devops": "REST API",
      circleci: "REST API",
      aws: "AWS SDK/REST API",
      azure: "Azure SDK/REST API",
      "google-cloud": "Google Cloud SDK/REST API",
      docker: "Docker API",
      kubernetes: "Kubernetes API",
      "audit-framework": "REST API",
      "reporting-engine": "REST API",
      "automation-platform": "REST API",
      "work-item-classifier": "AI API",
      "data-ingestion": "REST API",
    }
    return techMap[integrationId] || "REST API"
  }

  private hasCICDIntegrations(): boolean {
    return (
      this.selectedIntegrations.some((id) => ["jenkins", "github", "bitbucket", "azure"].includes(id)) ||
      this.selectedComponents.includes("bitbucket")
    )
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

export function createMultiLevelAtlassianC4Model(
  selectedComponents: string[],
  selectedIntegrations: string[],
  title: string,
): MultiLevelC4Model {
  const generator = new MultiLevelC4Generator(title, selectedComponents, selectedIntegrations)
  return generator.generateAllLevels()
}

function getAtlassianComponent(id: string) {
  const components: Record<string, { name: string; description: string }> = {
    "jira-software": { name: "Jira Software", description: "Project management and issue tracking" },
    "jira-service-management": { name: "Jira Service Management", description: "IT service management platform" },
    "jira-work-management": { name: "Jira Work Management", description: "Business team project management" },
    confluence: { name: "Confluence", description: "Team collaboration and documentation" },
    bitbucket: { name: "Bitbucket", description: "Git repository management" },
    compass: { name: "Compass", description: "Developer experience platform" },
    atlas: { name: "Atlas", description: "Team directory and insights" },
    statuspage: { name: "Statuspage", description: "Status communication platform" },
    opsgenie: { name: "Opsgenie", description: "Incident management and alerting" },
    "jira-align": { name: "Jira Align", description: "Enterprise agile planning" },
    bamboo: { name: "Bamboo", description: "Continuous integration and deployment" },
    crowd: { name: "Crowd", description: "Identity management and single sign-on" },
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
    "github-enterprise": { name: "GitHub Enterprise", description: "Enterprise code repository and collaboration" },
    gitlab: { name: "GitLab", description: "DevOps platform with integrated CI/CD" },
    okta: { name: "Okta", description: "Identity and access management" },
    "azure-ad": { name: "Azure Active Directory", description: "Microsoft identity platform" },
    "google-workspace": { name: "Google Workspace", description: "Google productivity and collaboration tools" },
    slack: { name: "Slack", description: "Team communication and collaboration" },
    "microsoft-teams": { name: "Microsoft Teams", description: "Unified communication platform" },
    zoom: { name: "Zoom", description: "Video conferencing and communication" },
    tableau: { name: "Tableau", description: "Business intelligence and analytics" },
    "power-bi": { name: "Power BI", description: "Microsoft business analytics" },
    looker: { name: "Looker", description: "Business intelligence and data platform" },
    jenkins: { name: "Jenkins", description: "Continuous integration and deployment" },
    "azure-devops": { name: "Azure DevOps", description: "Microsoft DevOps platform" },
    circleci: { name: "CircleCI", description: "Continuous integration and delivery" },
    aws: { name: "Amazon Web Services", description: "Cloud infrastructure and services" },
    azure: { name: "Microsoft Azure", description: "Cloud computing platform" },
    "google-cloud": { name: "Google Cloud Platform", description: "Google cloud infrastructure and services" },
    docker: { name: "Docker", description: "Containerization platform" },
    kubernetes: { name: "Kubernetes", description: "Container orchestration platform" },
    "audit-framework": { name: "Audit Framework", description: "Compliance and audit trail management" },
    "reporting-engine": { name: "Reporting Engine", description: "Custom reporting and analytics" },
    "automation-platform": { name: "Automation Platform", description: "Workflow and process automation" },
    "work-item-classifier": { name: "Work Item Classifier", description: "AI-powered work item classification" },
    "data-ingestion": { name: "Data Ingestion Service", description: "Custom data import and processing" },
  }
  return integrations[id]
}
