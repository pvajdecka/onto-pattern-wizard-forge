
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { LoginForm } from '@/components/LoginForm';
import { PatternOne } from '@/components/PatternOne';
import { PatternTwo } from '@/components/PatternTwo';
import { SessionHistory } from '@/components/SessionHistory';
import { Documentation } from '@/components/Documentation';
import { ModelParameters } from '@/components/ModelParameters';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogin = (user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    toast({
      title: "Welcome!",
      description: `Successfully logged in as ${user}`,
    });
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 to-emerald-50">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Ontology Pattern Generator
              </h1>
              <p className="text-gray-600 text-lg">
                Advanced AI-powered ontology engineering platform
              </p>
              <div className="mt-4 text-sm text-green-600">
                Welcome back, <span className="font-semibold">{username}</span>
              </div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="pattern1" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-white/80 backdrop-blur-sm border border-green-200">
                  <TabsTrigger 
                    value="pattern1" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all duration-300"
                  >
                    Pattern 1: Shortcut
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pattern2"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all duration-300"
                  >
                    Pattern 2: Subclass
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all duration-300"
                  >
                    Session History
                  </TabsTrigger>
                  <TabsTrigger 
                    value="docs"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all duration-300"
                  >
                    Documentation
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="pattern1" className="mt-6">
                <PatternOne />
              </TabsContent>

              <TabsContent value="pattern2" className="mt-6">
                <PatternTwo />
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <SessionHistory />
              </TabsContent>

              <TabsContent value="docs" className="mt-6">
                <Documentation />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
