
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, FileText, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { NetworkGraph3D } from '@/components/NetworkGraph3D';
import { FewShotEditor } from '@/components/FewShotEditor';

export const PatternOne = () => {
  const [classA, setClassA] = useState('corpus_part');
  const [classB, setClassB] = useState('Genre');
  const [classC, setClassC] = useState('Music Genre');
  const [propertyP, setPropertyP] = useState('genre');
  const [propertyR, setPropertyR] = useState('has sub-genre');
  const [useFewShot, setUseFewShot] = useState(false);
  const [result, setResult] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setPrompt(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResult = {
      property_name: 'has_music_genre',
      explanation: 'This property creates a direct relationship between corpus parts and music genres, bypassing the intermediate Genre class. It represents the transitive closure of the genre → has sub-genre property chain.'
    };
    
    setResult(mockResult);
    setIsLoading(false);
    
    toast({
      title: "Pattern Generated Successfully",
      description: "New shortcut property has been created",
    });
  };

  const handleShowPrompt = async () => {
    setIsLoading(true);
    setResult(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockPrompt = `Generate a shortcut property for the pattern:
Class A: ${classA}
Property p: ${propertyP}
Class B: ${classB}
Property r: ${propertyR}
Class C: ${classC}

Create a direct property that connects ${classA} to ${classC} via the property chain ${propertyP} → ${propertyR}.`;
    
    setPrompt(mockPrompt);
    setIsLoading(false);
  };

  const graphData = {
    nodes: [
      { id: 'A', label: classA, color: '#10b981', x: 0, y: -2.5, z: 0 },
      { id: 'B', label: classB, color: '#059669', x: 0, y: 0, z: 0 },
      { id: 'C', label: classC, color: '#047857', x: 0, y: 2.5, z: 0 },
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2 col-span-2">
                  <Label className="text-sm font-medium text-gray-700">Class C Label</Label>
                  <Input
                    value={classC}
                    onChange={(e) => setClassC(e.target.value)}
                    className="border-green-200 focus:border-green-400"
                    placeholder="Enter class C label"
                  />
                </div>
              </div>

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

              {useFewShot && <FewShotEditor pattern="shortcut" />}

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

            {/* 3D Visualization */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Interactive 3D Graph</h3>
              <div className="h-96 border-2 border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <NetworkGraph3D data={graphData} />
              </div>
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
