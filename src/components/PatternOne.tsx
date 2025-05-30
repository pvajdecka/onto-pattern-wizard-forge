import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, FileText, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { NetworkGraph3D } from '@/components/NetworkGraph3D';
import { FewShotEditor } from '@/components/FewShotEditor';
import { saveSessionData, getIsoTime } from '@/utils/sessionStorage';

interface PatternOneProps {
  initialData?: {
    classA: string;
    classB: string;
    classC: string;
    propertyP: string;
    propertyR: string;
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

export const PatternOne: React.FC<PatternOneProps> = ({ initialData, onDataChange, modelParams }) => {
  const [classA, setClassA] = useState(initialData?.classA || 'corpus_part');
  const [classB, setClassB] = useState(initialData?.classB || 'Genre');
  const [classC, setClassC] = useState(initialData?.classC || 'Music Genre');
  const [propertyP, setPropertyP] = useState(initialData?.propertyP || 'genre');
  const [propertyR, setPropertyR] = useState(initialData?.propertyR || 'has sub-genre');
  const [useFewShot, setUseFewShot] = useState(initialData?.useFewShot || false);
  const [result, setResult] = useState(initialData?.result || null);
  const [prompt, setPrompt] = useState(initialData?.prompt || null);
  const [isLoading, setIsLoading] = useState(false);
  const [fewShotData, setFewShotData] = useState(initialData?.fewShotData || []);

  // Update state when initialData changes
  useEffect(() => {
    if (initialData) {
      setClassA(initialData.classA);
      setClassB(initialData.classB);
      setClassC(initialData.classC);
      setPropertyP(initialData.propertyP);
      setPropertyR(initialData.propertyR);
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
        propertyR,
        useFewShot,
        result,
        prompt,
        fewShotData
      });
    }
  }, [classA, classB, classC, propertyP, propertyR, useFewShot, result, prompt, fewShotData, onDataChange]);

  const buildPayload = () => {
    const basePayload = {
      A_label: classA,
      p_label: propertyP,
      B_label: classB,
      r_label: propertyR,
      C_label: classC,
      model_name: modelParams?.modelName || "gpt-4o",
      use_few_shot: useFewShot,
      few_shot_examples: useFewShot ? fewShotData.map(row => ({
        A_label: row.A_label || row['?A_label'] || '',
        p_label: row.p_label || row['?p_label'] || '',
        B_label: row.B_label || row['?B_label'] || '',
        r_label: row.r_label || row['?r_label'] || '',
        C_label: row.C_label || row['?C_label'] || '',
        Property: row.Property || ''
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
    
    try {
      const payload = buildPayload();
      console.log('Calling http://localhost:8000/generate_shortcut with payload:', payload);
      
      const response = await fetch('http://localhost:8000/generate_shortcut', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setResult(result);
      
      // Save to session storage exactly like Streamlit app
      const sessionData = {
        time: getIsoTime(),
        ...payload,
        property_name: result.property_name,
        explanation: result.explanation
      };
      saveSessionData(sessionData);
      
      toast({
        title: "Pattern Generated Successfully",
        description: "New shortcut property has been created",
      });
    } catch (error) {
      console.error('Generate shortcut error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate shortcut property",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowPrompt = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const payload = buildPayload();
      console.log('Calling http://localhost:8000/shortcut_prompt with payload:', payload);
      
      const response = await fetch('http://localhost:8000/shortcut_prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setPrompt(result.prompt);
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
      { id: 'A', label: classA, color: '#10b981', x: -2, y: 1, z: 0 },
      { id: 'B', label: classB, color: '#059669', x: 0, y: 0, z: 0 },
      { id: 'C', label: classC, color: '#047857', x: 2, y: -1, z: 0 },
    ],
    links: [
      { source: 'A', target: 'B', label: propertyP, color: '#6b7280' },
      { source: 'B', target: 'C', label: propertyR, color: '#6b7280' },
      ...(result ? [{ source: 'A', target: 'C', label: result.property_name, color: '#3b82f6', width: 3 }] : [])
    ]
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-green-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Sparkles className="h-6 w-6" />
            <span>Pattern 1: Object Property Chain Shortcut</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Section - Reordered */}
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
                <Label className="text-sm font-medium text-gray-700">Property r Label</Label>
                <Input
                  value={propertyR}
                  onChange={(e) => setPropertyR(e.target.value)}
                  className="border-green-200 focus:border-green-400"
                  placeholder="Enter property r label"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Class C Label</Label>
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
                id="fewshot"
                checked={useFewShot}
                onCheckedChange={(checked) => setUseFewShot(checked === true)}
              />
              <Label htmlFor="fewshot" className="text-sm font-medium text-gray-700">
                Use Few-Shot Examples
              </Label>
            </div>

            {useFewShot && (
              <FewShotEditor 
                pattern="shortcut" 
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
                    <span>Generate Shortcut</span>
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
                        <Label className="text-sm font-semibold text-green-700">Suggested Property:</Label>
                        <p className="text-lg font-mono text-green-800 mt-1">{result.property_name}</p>
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
