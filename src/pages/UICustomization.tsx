
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Palette, Layout, Settings, Code, Save } from 'lucide-react';

const UICustomization = () => {
  const [appSettings, setAppSettings] = useState({
    appName: 'Business Management System',
    appDescription: 'Comprehensive business management and project tracking',
    primaryColor: '#3b82f6',
    secondaryColor: '#f1f5f9',
    accentColor: '#10b981',
    logo: '',
    favicon: '',
    theme: 'light'
  });

  const [layoutSettings, setLayoutSettings] = useState({
    sidebarWidth: '256px',
    headerHeight: '64px',
    cardRadius: '8px',
    spacing: 'normal',
    density: 'comfortable'
  });

  const handleSaveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
    localStorage.setItem('layoutSettings', JSON.stringify(layoutSettings));
    toast({
      title: "Settings Saved",
      description: "UI customization settings have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">UI Customization</h1>
          <p className="text-muted-foreground">Customize the appearance and layout of your application</p>
        </div>
        <Button onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                App Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appName">Application Name</Label>
                  <Input
                    id="appName"
                    value={appSettings.appName}
                    onChange={(e) => setAppSettings({...appSettings, appName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={appSettings.theme} onValueChange={(value) => setAppSettings({...appSettings, theme: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appDescription">Application Description</Label>
                <Textarea
                  id="appDescription"
                  value={appSettings.appDescription}
                  onChange={(e) => setAppSettings({...appSettings, appDescription: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    placeholder="https://example.com/logo.png"
                    value={appSettings.logo}
                    onChange={(e) => setAppSettings({...appSettings, logo: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon URL</Label>
                  <Input
                    id="favicon"
                    placeholder="https://example.com/favicon.ico"
                    value={appSettings.favicon}
                    onChange={(e) => setAppSettings({...appSettings, favicon: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Color Scheme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={appSettings.primaryColor}
                      onChange={(e) => setAppSettings({...appSettings, primaryColor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={appSettings.primaryColor}
                      onChange={(e) => setAppSettings({...appSettings, primaryColor: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={appSettings.secondaryColor}
                      onChange={(e) => setAppSettings({...appSettings, secondaryColor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={appSettings.secondaryColor}
                      onChange={(e) => setAppSettings({...appSettings, secondaryColor: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={appSettings.accentColor}
                      onChange={(e) => setAppSettings({...appSettings, accentColor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={appSettings.accentColor}
                      onChange={(e) => setAppSettings({...appSettings, accentColor: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layout className="h-5 w-5 mr-2" />
                Layout Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sidebarWidth">Sidebar Width</Label>
                  <Select value={layoutSettings.sidebarWidth} onValueChange={(value) => setLayoutSettings({...layoutSettings, sidebarWidth: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="200px">Narrow (200px)</SelectItem>
                      <SelectItem value="256px">Normal (256px)</SelectItem>
                      <SelectItem value="320px">Wide (320px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="density">UI Density</Label>
                  <Select value={layoutSettings.density} onValueChange={(value) => setLayoutSettings({...layoutSettings, density: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardRadius">Card Border Radius</Label>
                  <Select value={layoutSettings.cardRadius} onValueChange={(value) => setLayoutSettings({...layoutSettings, cardRadius: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4px">Small (4px)</SelectItem>
                      <SelectItem value="8px">Medium (8px)</SelectItem>
                      <SelectItem value="12px">Large (12px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spacing">Spacing</Label>
                  <Select value={layoutSettings.spacing} onValueChange={(value) => setLayoutSettings({...layoutSettings, spacing: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Component Customization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Component customization allows you to modify individual UI elements. 
                  See the developer documentation for detailed instructions on creating custom components.
                </p>
                <Button variant="outline" className="w-full">
                  View Component Library
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UICustomization;
