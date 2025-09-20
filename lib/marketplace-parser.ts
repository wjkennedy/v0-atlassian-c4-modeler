export interface MarketplaceApp {
  name: string
  key: string
  tagline: string
  summary: string
  category: string
}

export interface PluginRelationship {
  plugin: MarketplaceApp
  atlassianProduct: string
  integrationPoints: string[]
  businessFunction: string
}

export class MarketplaceParser {
  private apps: MarketplaceApp[] = []

  constructor(marketplaceData: string) {
    this.parseMarketplaceData(marketplaceData)
  }

  private parseMarketplaceData(data: string): void {
    const lines = data.split("\n").filter((line) => line.trim())

    for (const line of lines) {
      const columns = line.split("\t")
      if (columns.length >= 4 && columns[0] && columns[1]) {
        const app: MarketplaceApp = {
          name: columns[0].trim(),
          key: columns[1].trim(),
          tagline: columns[2].trim(),
          summary: columns[3].trim(),
          category: this.categorizeApp(columns[0], columns[2], columns[3]),
        }
        this.apps.push(app)
      }
    }
  }

  private categorizeApp(name: string, tagline: string, summary: string): string {
    const text = `${name} ${tagline} ${summary}`.toLowerCase()

    if (text.includes("test") || text.includes("qa") || text.includes("quality")) return "Testing & QA"
    if (text.includes("time") || text.includes("track") || text.includes("timesheet")) return "Time Tracking"
    if (text.includes("report") || text.includes("chart") || text.includes("dashboard") || text.includes("analytics"))
      return "Reporting & Analytics"
    if (text.includes("git") || text.includes("github") || text.includes("gitlab") || text.includes("devops"))
      return "Development & CI/CD"
    if (text.includes("workflow") || text.includes("automation") || text.includes("script"))
      return "Workflow & Automation"
    if (text.includes("project") || text.includes("portfolio") || text.includes("gantt") || text.includes("planning"))
      return "Project Management"
    if (text.includes("integration") || text.includes("connect") || text.includes("sync"))
      return "Integration & Connectivity"
    if (text.includes("diagram") || text.includes("visual") || text.includes("chart")) return "Visualization"
    if (text.includes("security") || text.includes("auth") || text.includes("permission")) return "Security & Access"
    if (text.includes("communication") || text.includes("chat") || text.includes("teams") || text.includes("slack"))
      return "Communication"

    return "Other"
  }

  public getApps(): MarketplaceApp[] {
    return this.apps
  }

  public getAppsByCategory(): Record<string, MarketplaceApp[]> {
    return this.apps.reduce(
      (acc, app) => {
        if (!acc[app.category]) acc[app.category] = []
        acc[app.category].push(app)
        return acc
      },
      {} as Record<string, MarketplaceApp[]>,
    )
  }

  public generatePluginRelationships(): PluginRelationship[] {
    return this.apps.map((app) => ({
      plugin: app,
      atlassianProduct: this.determineAtlassianProduct(app),
      integrationPoints: this.extractIntegrationPoints(app),
      businessFunction: this.extractBusinessFunction(app),
    }))
  }

  private determineAtlassianProduct(app: MarketplaceApp): string {
    const text = `${app.name} ${app.tagline} ${app.summary}`.toLowerCase()

    if (text.includes("confluence")) return "Confluence"
    if (text.includes("bitbucket")) return "Bitbucket"
    if (text.includes("service management") || text.includes("jsm")) return "Jira Service Management"
    return "Jira Software"
  }

  private extractIntegrationPoints(app: MarketplaceApp): string[] {
    const text = `${app.name} ${app.tagline} ${app.summary}`.toLowerCase()
    const points: string[] = []

    if (text.includes("workflow")) points.push("Workflow")
    if (text.includes("field") || text.includes("custom field")) points.push("Custom Fields")
    if (text.includes("dashboard")) points.push("Dashboard")
    if (text.includes("api") || text.includes("rest")) points.push("REST API")
    if (text.includes("webhook")) points.push("Webhooks")
    if (text.includes("automation")) points.push("Automation")
    if (text.includes("jql")) points.push("JQL")
    if (text.includes("issue")) points.push("Issue Management")
    if (text.includes("project")) points.push("Project Management")

    return points.length > 0 ? points : ["Standard Integration"]
  }

  private extractBusinessFunction(app: MarketplaceApp): string {
    const category = app.category
    const text = `${app.tagline} ${app.summary}`.toLowerCase()

    if (category === "Testing & QA") return "Quality Assurance"
    if (category === "Time Tracking") return "Resource Management"
    if (category === "Reporting & Analytics") return "Business Intelligence"
    if (category === "Development & CI/CD") return "Software Development"
    if (category === "Workflow & Automation") return "Process Optimization"
    if (category === "Project Management") return "Project Delivery"
    if (category === "Integration & Connectivity") return "System Integration"
    if (category === "Visualization") return "Data Visualization"
    if (category === "Security & Access") return "Security & Compliance"
    if (category === "Communication") return "Team Collaboration"

    return "Business Operations"
  }
}
