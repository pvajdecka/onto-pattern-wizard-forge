
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LoginForm } from '@/components/LoginForm';
import { PatternOne } from '@/components/PatternOne';
import { PatternTwo } from '@/components/PatternTwo';
import { SessionHistory } from '@/components/SessionHistory';
import { Documentation } from '@/components/Documentation';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SessionData } from '@/utils/sessionStorage';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('pattern1');

  // Model parameters state
  const [modelParams, setModelParams] = useState({
    modelName: 'gpt-4o',
    temperature: 0.0,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    repeatPenalty: 1.1
  });

  // Pattern 1 state
  const [pattern1Data, setPattern1Data] = useState({
    classA: 'corpus_part',
    classB: 'Genre',
    classC: 'Music Genre',
    propertyP: 'genre',
    propertyR: 'has sub-genre',
    useFewShot: false,
    result: null,
    prompt: null,
    fewShotData: []
  });

  // Pattern 2 state
  const [pattern2Data, setPattern2Data] = useState({
    classA: 'System',
    classB: 'Component',
    classC: 'Storage Device',
    propertyP: 'has component',
    useFewShot: false,
    result: null,
    prompt: null,
    fewShotData: []
  });

  const handleLogin = (user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    toast({
      title: "Welcome!",
      description: `Successfully logged in as ${user}`,
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setActiveTab('pattern1');
    // Reset all data states
    setPattern1Data({
      classA: 'corpus_part',
      classB: 'Genre',
      classC: 'Music Genre',
      propertyP: 'genre',
      propertyR: 'has sub-genre',
      useFewShot: false,
      result: null,
      prompt: null,
      fewShotData: []
    });
    setPattern2Data({
      classA: 'System',
      classB: 'Component',
      classC: 'Storage Device',
      propertyP: 'has component',
      useFewShot: false,
      result: null,
      prompt: null,
      fewShotData: []
    });
    setModelParams({
      modelName: 'gpt-4o',
      temperature: 0.0,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      repeatPenalty: 1.1
    });
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const handleModelParametersChange = (params: typeof modelParams) => {
    setModelParams(params);
  };

  const handleLoadSession = (sessionData: SessionData, patternType: 'shortcut' | 'subclass') => {
    // Load model parameters from session
    const newModelParams = {
      modelName: sessionData.model_name,
      temperature: sessionData.temperature,
      topP: sessionData.top_p,
      frequencyPenalty: sessionData.frequency_penalty,
      presencePenalty: sessionData.presence_penalty,
      repeatPenalty: sessionData.repeat_penalty
    };
    setModelParams(newModelParams);

    if (patternType === 'shortcut') {
      setPattern1Data({
        classA: sessionData.A_label,
        classB: sessionData.B_label,
        classC: sessionData.C_label,
        propertyP: sessionData.p_label,
        propertyR: sessionData.r_label || 'has sub-genre',
        useFewShot: sessionData.use_few_shot,
        result: sessionData.property_name ? {
          property_name: sessionData.property_name,
          explanation: sessionData.explanation
        } : null,
        prompt: null,
        fewShotData: sessionData.few_shot_examples || []
      });
      setActiveTab('pattern1');
    } else {
      setPattern2Data({
        classA: sessionData.A_label,
        classB: sessionData.B_label,
        classC: sessionData.C_label,
        propertyP: sessionData.p_label,
        useFewShot: sessionData.use_few_shot,
        result: sessionData.class_name ? {
          class_name: sessionData.class_name,
          explanation: sessionData.explanation
        } : null,
        prompt: null,
        fewShotData: sessionData.few_shot_examples || []
      });
      setActiveTab('pattern2');
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 to-emerald-50">
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8 text-center relative">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  Ontology Pattern Generator
                </h1>
                <p className="text-gray-600 text-lg">
                  Advanced AI-powered ontology engineering platform
                </p>
                <div className="mt-4 text-sm text-green-600">
                  Welcome back, <span className="font-semibold">{username}</span>
                </div>
                
                {/* Logout Button */}
                <div className="absolute top-0 right-0">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>

              {/* Main Content */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  <PatternOne 
                    initialData={pattern1Data}
                    onDataChange={setPattern1Data}
                    modelParams={modelParams}
                  />
                </TabsContent>

                <TabsContent value="pattern2" className="mt-6">
                  <PatternTwo 
                    initialData={pattern2Data}
                    onDataChange={setPattern2Data}
                    modelParams={modelParams}
                  />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <SessionHistory onLoadSession={handleLoadSession} />
                </TabsContent>

                <TabsContent value="docs" className="mt-6">
                  <Documentation />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
