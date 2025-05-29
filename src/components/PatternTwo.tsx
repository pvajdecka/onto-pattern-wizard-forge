
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, FileText, Layers } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { NetworkGraph3D } from '@/components/NetworkGraph3D';
import { FewShotEditor } from '@/components/FewShotEditor';

export const PatternTwo = () => {
  const [classA, setClassA] = useState('System');
  const [classB, setClassB] = useState('Component');
  const [classC, setClassC] = useState('Storage Device');
  const [propertyP, setPropertyP] = useState('has component');
  const [useFewShot, setUseFewShot] = useState(false);
  const [result, setResult] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fewShotData, setFewShotData] = useState([]);

  const buildPayload = () => {
    const basePayload = {
      A_label: classA,
      p_label: propertyP,
      B_label: classB,
      C_label: classC,
      use_few_shot: useFewShot,
      few_shot_examples: useFewShot ? fewShotData : []
    };
    return basePayload;
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setPrompt(null);
    
    try {
      const payload = buildPayload();
      console.log('Calling /generate_subclass with payload:', payload);
      
      // Simulate API call to /generate_subclass endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        class_name: 'StorageSystem',
        explanation: useFewShot 
          ? 'This specialized subclass represents systems that specifically include storage devices as components. It inherits from System while being more specific about the type of components it contains. Based on the provided few-shot examples, this follows established patterns for creating specialized subclasses that represent entities with specific component relationships.'
          : 'This specialized subclass represents systems that specifically include storage devices as components. It inherits from System while being more specific about the type of components it contains.'
      };
      
      setResult(mockResult);
      
      toast({
        title: "Subclass Generated Successfully",
        description: "New specialized subclass has been created",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate subclass",
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
      console.log('Calling /subclass_prompt with payload:', payload);
      
      // Simulate API call to /subclass_prompt endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPrompt = useFewShot 
        ? `Generate a specialized subclass for the pattern using few-shot learning:

Few-shot examples:
${fewShotData.map((example, index) => 
  `Example ${index + 1}:
  - Class A: ${example['?A_label']}
  - Property p: ${example['?p_label']}
  - Class B: ${example['?B_label']}
  - Class C (subclass of B): ${example['?C_label']}
  - Result Subclass: ${example.Subclass}
  - Human annotation: ${example.Human || 'N/A'}`
).join('\n\n')}

Now generate for:
Class A: ${classA}
Property p: ${propertyP}
Class B: ${classB}
Class C (subclass of B): ${classC}

Create a new subclass of ${classA} that represents ${classA} instances that have ${classC} as components, following the patterns shown in the examples above.`
        : `Generate a specialized subclass for the pattern:
Class A: ${classA}
Property p: ${propertyP}
Class B: ${classB}
Class C (subclass of B): ${classC}

Create a new subclass of ${classA} that represents ${classA} instances that have ${classC} as components.`;
      
      setPrompt(mockPrompt);
    } catch (error) {
      toast({
        title: "Prompt Retrieval Failed",
        description: "Failed to retrieve complete prompt",
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
