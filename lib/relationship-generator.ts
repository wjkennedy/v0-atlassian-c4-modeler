export function generateComponentRelationships(components: any[], integrations: any[]) {
  const relationships: any[] = []

  // Generate relationships between components and integrations
  components.forEach((component, index) => {
    // Connect each component to relevant integrations
    integrations.forEach((integration) => {
      if (shouldConnectComponentToIntegration(component, integration)) {
        relationships.push({
          from: component.id,
          to: integration.id,
          description: `Integrates with ${integration.name}`,
          technology: integration.technology || "API",
        })
      }
    })

    // Connect components to each other in a logical flow
    if (index > 0) {
      const previousComponent = components[index - 1]
      relationships.push({
        from: previousComponent.id,
        to: component.id,
        description: "Data flow",
        technology: "Internal API",
      })
    }
  })

  return relationships
}

function shouldConnectComponentToIntegration(component: any, integration: any): boolean {
  // Simple logic to determine if a component should connect to an integration
  // This can be made more sophisticated based on actual business logic

  const componentIntegrationMap: Record<string, string[]> = {
    "jira-software": ["github", "bitbucket", "slack", "microsoft-teams"],
    "jira-service-management": ["servicenow", "slack", "microsoft-teams"],
    confluence: ["slack", "microsoft-teams", "github"],
    bitbucket: ["jira-software", "jenkins"],
    compass: ["github", "bitbucket", "jenkins"],
    atlas: ["slack", "microsoft-teams"],
    statuspage: ["opsgenie", "slack"],
    opsgenie: ["statuspage", "slack", "microsoft-teams"],
  }

  const allowedIntegrations = componentIntegrationMap[component.id] || []
  return allowedIntegrations.includes(integration.id)
}
