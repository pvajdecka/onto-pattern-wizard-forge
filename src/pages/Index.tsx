
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
        <div className="flex-shrink-0">
          <div className="border-r border-gray-200 bg-white h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="space-y-4">
                <img 
                  src="/lovable-uploads/13622cbc-bd03-4bdc-a031-240546ddc6d7.png" 
                  alt="ONTO-DESIDE Logo" 
                  className="w-full h-12 object-contain"
                />
                <img 
                  src="/lovable-uploads/6ae6085c-e6e5-405c-9e01-6fbe7331b9e4.png" 
                  alt="VSE Faculty Logo" 
                  className="w-full h-12 object-contain"
                />
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="space-y-4">
                <h3 className="text-slate-700 font-semibold text-sm">Model Configuration</h3>
                <ModelParameters 
                  onParametersChange={handleModelParametersChange}
                  initialParams={modelParams}
                />
              </div>
            </div>
          </div>
        </div>
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
      </div>
    </SidebarProvider>
  );
};

export default Index;
