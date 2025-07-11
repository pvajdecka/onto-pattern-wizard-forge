import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, FileText, Layers, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NetworkGraph3D } from '@/components/NetworkGraph3D';
import { FewShotEditor } from '@/components/FewShotEditor';
import { saveSessionData, getIsoTime } from '@/utils/sessionStorage';

interface PatternTwoProps {
  initialData?: {
    classA: string;
    classB: string;
    classC: string;
    propertyP: string;
    useFewShot: boolean;
    result: any;
    prompt: any;
    fewShotData: any[];
  };
  onDataChange?: (data: any) => void;
  modelParams?: {
    modelName: string;
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    repeatPenalty: number;
  };
}

export const PatternTwo: React.FC<PatternTwoProps> = ({ initialData, onDataChange, modelParams }) => {
  const [classA, setClassA] = useState(initialData?.classA || 'System');
  const [classB, setClassB] = useState(initialData?.classB || 'Component');
  const [classC, setClassC] = useState(initialData?.classC || 'Storage Device');
  const [propertyP, setPropertyP] = useState(initialData?.propertyP || 'has component');
  const [useFewShot, setUseFewShot] = useState(initialData?.useFewShot || false);
  const [result, setResult] = useState(initialData?.result || null);
  const [prompt, setPrompt] = useState(initialData?.prompt || null);
  const [isLoading, setIsLoading] = useState(false);
  const [fewShotData, setFewShotData] = useState(initialData?.fewShotData || []);
  const [showTemperatureWarning, setShowTemperatureWarning] = useState(false);
  const [attemptedWithCorrectTemp, setAttemptedWithCorrectTemp] = useState(false);

  // Update state when initialData changes
  useEffect(() => {
    if (initialData) {
      setClassA(initialData.classA);
      setClassB(initialData.classB);
      setClassC(initialData.classC);
      setPropertyP(initialData.propertyP);
      setUseFewShot(initialData.useFewShot);
      setResult(initialData.result);
      setPrompt(initialData.prompt);
      setFewShotData(initialData.fewShotData);
    }
  }, [initialData]);

  // Notify parent of changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        classA,
        classB,
        classC,
        propertyP,
        useFewShot,
        result,
        prompt,
        fewShotData
      });
    }
  }, [classA, classB, classC, propertyP, useFewShot, result, prompt, fewShotData, onDataChange]);

  // Use proxy endpoint instead of direct backend URL
  const getBackendUrl = () => {
    return '/api'; // This will be proxied to http://127.0.0.1:8000
  };

  const buildPayload = () => {
    const basePayload = {
      A_label: classA,
      p_label: propertyP,
      B_label: classB,
      C_label: classC,
      model_name: modelParams?.modelName || "gpt-4o",
      use_few_shot: useFewShot,
      few_shot_examples: useFewShot ? fewShotData.map(row => ({
        A_label: row.A_label || row['?A_label'] || '',
        p_label: row.p_label || row['?p_label'] || '',
        B_label: row.B_label || row['?B_label'] || '',
        C_label: row.C_label || row['?C_label'] || '',
        Subclass: row.Subclass || '',
        Human: row.Human || ''
      })) : [],
      temperature: modelParams?.temperature || 0.0,
      top_p: modelParams?.topP || 1.0,
      frequency_penalty: modelParams?.frequencyPenalty || 0.0,
      presence_penalty: modelParams?.presencePenalty || 0.0,
      repeat_penalty: modelParams?.repeatPenalty || 1.1
    };
    return basePayload;
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setPrompt(null);
    setShowTemperatureWarning(false);
    
    try {
      const payload = buildPayload();
      console.log('Calling proxy endpoint /api/generate_subclass with payload:', payload);
      
      const response = await fetch('/api/generate_subclass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 500) {
        if (modelParams?.temperature !== 1.0 && !attemptedWithCorrectTemp) {
          setShowTemperatureWarning(true);
          setAttemptedWithCorrectTemp(true);
          toast({
            title: "Model Configuration Issue",
            description: "Some models require temperature to be set to 1.0. Please adjust the temperature in the sidebar.",
            variant: "destructive",
          });
          return;
        } else {
          throw new Error("Backend server error. Please try again later or contact support if the issue persists.");
        }
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setResult(result);
      setShowTemperatureWarning(false);
      setAttemptedWithCorrectTemp(false);
      
      // Save to session storage exactly like Streamlit app
      const sessionData = {
        time: getIsoTime(),
        ...payload,
        class_name: result.class_name,
        explanation: result.explanation
      };
      saveSessionData(sessionData);
      
      toast({
        title: "Subclass Generated Successfully",
        description: "New specialized subclass has been created",
      });
    } catch (error) {
      console.error('Generate subclass error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate subclass",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowPrompt = async () => {
    setIsLoading(true);
    setResult(null);
    setShowTemperatureWarning(false);
    
    try {
      const payload = buildPayload();
      console.log('Calling proxy endpoint /api/subclass_prompt with payload:', payload);
      
      const response = await fetch('/api/subclass_prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 500) {
        if (modelParams?.temperature !== 1.0 && !attemptedWithCorrectTemp) {
          setShowTemperatureWarning(true);
          setAttemptedWithCorrectTemp(true);
          toast({
            title: "Model Configuration Issue",
            description: "Some models require temperature to be set to 1.0. Please adjust the temperature in the sidebar.",
            variant: "destructive",
          });
          return;
        } else {
          throw new Error("Backend server error. Please try again later or contact support if the issue persists.");
        }
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setPrompt(result.prompt);
      setShowTemperatureWarning(false);
      setAttemptedWithCorrectTemp(false);
    } catch (error) {
      console.error('Show prompt error:', error);
      toast({
        title: "Prompt Retrieval Failed",
        description: error.message || "Failed to retrieve complete prompt",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFewShotDataChange = (newData) => {
    setFewShotData(newData);
  };

  const graphData = {
    nodes: [
      { id: 'A', label: classA, color: '#10b981', x: -1, y: 0, z: 0 },
      { id: 'B', label: classB, color: '#059669', x: 1, y: 1, z: 0 },
      { id: 'C', label: classC, color: '#047857', x: 1, y: -1, z: 0 },
      ...(result ? [{ id: 'NEW', label: result.class_name, color: '#3b82f6', x: -1, y: -1.5, z: 0 }] : [])
    ],
    links: [
      { source: 'A', target: 'B', label: propertyP, color: '#6b7280' },
      { source: 'C', target: 'B', label: 'subclassOf', color: '#9ca3af', style: 'dashed' },
      ...(result ? [{ source: 'NEW', target: 'A', label: 'subclassOf', color: '#3b82f6', style: 'dashed', width: 3 }] : [])
    ]
  };

  return (
    <div className="space-y-8">
      {/* Temperature Warning Alert */}
      {showTemperatureWarning && (
        <Alert className="border-orange-200 bg-orange-50/50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="space-y-2">
              <p className="font-semibold">Model Configuration Issue</p>
              <p>Some models require the temperature to be set to 1.0. Please:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Open the sidebar (Model Parameters)</li>
                <li>Set Temperature to 1.0</li>
                <li>Try running the generation again</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg border-green-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Layers className="h-6 w-6" />
            <span>Pattern 2: Subclass Enrichment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Class A Label</Label>
                <Input
                  value={classA}
                  onChange={(e) => setClassA(e.target.value)}
                  className="border-green-200 focus:border-green-400"
                  placeholder="Enter class A label"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Property p Label</Label>
                <Input
                  value={propertyP}
                  onChange={(e) => setPropertyP(e.target.value)}
                  className="border-green-200 focus:border-green-400"
                  placeholder="Enter property p label"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Class B Label</Label>
                <Input
                  value={classB}
                  onChange={(e) => setClassB(e.target.value)}
                  className="border-green-200 focus:border-green-400"
                  placeholder="Enter class B label"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Class C Label (subclass of B)</Label>
                <Input
                  value={classC}
                  onChange={(e) => setClassC(e.target.value)}
                  className="border-green-200 focus:border-green-400"
                  placeholder="Enter class C label"
                />
              </div>
            </div>

            {/* 3D Visualization */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Graph</h3>
              <div className="h-96 border-2 border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <NetworkGraph3D data={graphData} />
              </div>
            </div>
          </div>

          {/* Few-Shot Section */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fewshot-2"
                checked={useFewShot}
                onCheckedChange={(checked) => setUseFewShot(checked === true)}
              />
              <Label htmlFor="fewshot-2" className="text-sm font-medium text-gray-700">
                Use Few-Shot Examples
              </Label>
            </div>

            {useFewShot && (
              <FewShotEditor 
                pattern="subclass" 
                onDataChange={handleFewShotDataChange}
              />
            )}

            <div className="flex space-x-4">
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Play className="h-4 w-4" />
                    <span>Generate Subclass</span>
                  </div>
                )}
              </Button>
              <Button
                onClick={handleShowPrompt}
                disabled={isLoading}
                variant="outline"
                className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Show Prompt</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {(result || prompt) && (
            <div className="mt-8 space-y-6">
              {result && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="text-green-800">Generation Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-semibold text-green-700">Suggested Subclass:</Label>
                        <p className="text-lg font-mono text-green-800 mt-1">{result.class_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-green-700">Explanation:</Label>
                        <p className="text-gray-700 mt-1 leading-relaxed">{result.explanation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {prompt && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <CardTitle className="text-blue-800">Complete Prompt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm text-blue-700 whitespace-pre-wrap font-mono bg-white p-4 rounded border border-blue-200">
                      {prompt}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
