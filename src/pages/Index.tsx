
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
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
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
    classA: 'Organization',
    classB: 'Residence Object',
    classC: 'BasicAddress',
    propertyP: 'delivery location',
    propertyR: 'addres',
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

  // Valid model names - update this list as needed
  const validModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4.5-preview'];

  const validateModelName = (modelName: string): string => {
    if (validModels.includes(modelName)) {
      return modelName;
    }
    
    toast({
      title: "Invalid Model Detected",
      description: `The model "${modelName}" from session history is no longer available. Defaulting to gpt-4o.`,
      variant: "destructive",
    });
    
    return 'gpt-4o'; // Default fallback model
  };

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
      classA: 'Organization',
      classB: 'Residence Object',
      classC: 'BasicAddress',
      propertyP: 'delivery location',
      propertyR: 'addres',
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
    console.log('Model parameters changed in Index:', params);
    setModelParams(params);
  };

  const handleLoadSession = (sessionData: SessionData, patternType: 'shortcut' | 'subclass') => {
    // Validate and potentially correct the model name
    const validatedModelName = validateModelName(sessionData.model_name);
    
    // Load model parameters from session with validated model name
    const newModelParams = {
      modelName: validatedModelName,
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

    // Show success toast only if model was valid
    if (validatedModelName === sessionData.model_name) {
      toast({
        title: "Session Loaded",
        description: `Loaded ${patternType} pattern configuration successfully.`,
      });
    } else {
      toast({
        title: "Session Loaded with Model Update",
        description: `Loaded ${patternType} pattern but updated model to ${validatedModelName}.`,
      });
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 to-emerald-50">
        <AppSidebar 
          modelParams={modelParams}
          onParametersChange={handleModelParametersChange}
        />
        <SidebarInset>
          <main className={`flex-1 ${isMobile ? 'p-3' : 'p-6'}`}>
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className={`${isMobile ? 'mb-6' : 'mb-8'} text-center relative`}>
                <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2`}>
                  Ontology Pattern Generator
                </h1>
                <p className={`text-gray-600 ${isMobile ? 'text-base' : 'text-lg'}`}>
                  {isMobile ? 'AI-powered ontology engineering' : 'Advanced AI-powered ontology engineering platform'}
                </p>
                <div className={`${isMobile ? 'mt-2' : 'mt-4'} text-sm text-green-600`}>
                  Welcome back, <span className="font-semibold">{username}</span>
                </div>
                
                {/* Logout Button */}
                <div className={`absolute ${isMobile ? 'top-0 right-0' : 'top-0 right-0'}`}>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size={isMobile ? "sm" : "sm"}
                    className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    {!isMobile && 'Logout'}
                  </Button>
                </div>
              </div>

              {/* Main Content */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className={`flex justify-center ${isMobile ? 'mb-4' : 'mb-8'}`}>
                  <TabsList className={`${isMobile ? 'grid grid-cols-2 w-full max-w-md' : 'grid grid-cols-4 w-full max-w-2xl'} bg-white/80 backdrop-blur-sm border border-green-200`}>
                    <TabsTrigger 
                      value="pattern1" 
                      className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all duration-300 ${isMobile ? 'text-xs' : ''}`}
                    >
                      {isMobile ? 'Shortcut' : 'Pattern 1: Shortcut'}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="pattern2"
                      className={`data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all duration-300 ${isMobile ? 'text-xs' : ''}`}
                    >
                      {isMobile ? 'Subclass' : 'Pattern 2: Subclass'}
                    </TabsTrigger>
                    {isMobile && (
                      <>
                        <TabsTrigger 
                          value="history"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all duration-300 text-xs"
                        >
                          History
                        </TabsTrigger>
                        <TabsTrigger 
                          value="docs"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all duration-300 text-xs"
                        >
                          Docs
                        </TabsTrigger>
                      </>
                    )}
                    {!isMobile && (
                      <>
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
                      </>
                    )}
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
