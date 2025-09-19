"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, Palette, Layout, FileText } from "lucide-react"

interface ConfigurationPanelProps {
  config: {
    title: string
    level: string
    theme: string
  }
  onConfigChange: (config: any) => void
}

export function ConfigurationPanel({ config, onConfigChange }: ConfigurationPanelProps) {
  const updateConfig = (key: string, value: any) => {
    onConfigChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* Diagram Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Diagram Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Diagram Title</Label>
            <Input
              id="title"
              value={config.title}
              onChange={(e) => updateConfig("title", e.target.value)}
              placeholder="Enter diagram title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">C4 Model Level</Label>
            <Select value={config.level} onValueChange={(value) => updateConfig("level", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select diagram level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="context">Level 1: System Context</SelectItem>
                <SelectItem value="container">Level 2: Container</SelectItem>
                <SelectItem value="component">Level 3: Component</SelectItem>
                <SelectItem value="code">Level 4: Code</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add a description for your architecture diagram..."
              className="min-h-20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Visual Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Visual Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Color Theme</Label>
            <Select value={config.theme} onValueChange={(value) => updateConfig("theme", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select color theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional Blue</SelectItem>
                <SelectItem value="modern">Modern Gradient</SelectItem>
                <SelectItem value="minimal">Minimal Grayscale</SelectItem>
                <SelectItem value="vibrant">Vibrant Colors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-descriptions">Show Descriptions</Label>
              <Switch id="show-descriptions" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-technology">Show Technology Stack</Label>
              <Switch id="show-technology" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-relationships">Show Relationships</Label>
              <Switch id="show-relationships" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-primary" />
            Layout Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="layout-direction">Layout Direction</Label>
            <Select defaultValue="top-bottom">
              <SelectTrigger>
                <SelectValue placeholder="Select layout direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-bottom">Top to Bottom</SelectItem>
                <SelectItem value="left-right">Left to Right</SelectItem>
                <SelectItem value="bottom-top">Bottom to Top</SelectItem>
                <SelectItem value="right-left">Right to Left</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spacing">Element Spacing</Label>
            <Select defaultValue="medium">
              <SelectTrigger>
                <SelectValue placeholder="Select spacing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-layout">Auto Layout</Label>
              <Switch id="auto-layout" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="grid-snap">Snap to Grid</Label>
              <Switch id="grid-snap" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-legend">Include Legend</Label>
              <Switch id="include-legend" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-metadata">Include Metadata</Label>
              <Switch id="include-metadata" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-version">Include Version Info</Label>
              <Switch id="include-version" />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input id="author" placeholder="Enter author name..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input id="version" placeholder="1.0.0" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
