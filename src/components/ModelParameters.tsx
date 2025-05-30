
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface ModelParametersProps {
  onParametersChange?: (params: {
    modelName: string;
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    repeatPenalty: number;
  }) => void;
  initialParams?: {
    modelName?: string;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    repeatPenalty?: number;
  };
}

export const ModelParameters: React.FC<ModelParametersProps> = ({ 
  onParametersChange, 
  initialParams 
}) => {
  const [modelName, setModelName] = useState(initialParams?.modelName || 'gpt-4o');
  const [temperature, setTemperature] = useState([initialParams?.temperature || 0.0]);
  const [topP, setTopP] = useState([initialParams?.topP || 1.0]);
  const [frequencyPenalty, setFrequencyPenalty] = useState([initialParams?.frequencyPenalty || 0.0]);
  const [presencePenalty, setPresencePenalty] = useState([initialParams?.presencePenalty || 0.0]);
  const [repeatPenalty, setRepeatPenalty] = useState([initialParams?.repeatPenalty || 1.1]);
  
  const [modelProviderMap, setModelProviderMap] = useState<{[key: string]: string}>({});
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  // Fetch available models from backend
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('http://localhost:8000/model_provider_map');
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status}`);
        }
        const modelMap = await response.json();
        setModelProviderMap(modelMap);
        
        // Check if initial model is available, if not show warning and use first available
        if (initialParams?.modelName && !modelMap[initialParams.modelName]) {
          const availableModels = Object.keys(modelMap);
          if (availableModels.length > 0) {
            setModelName(availableModels[0]);
            toast({
              title: "Model Not Available",
              description: `Model "${initialParams.modelName}" is not currently available. Switched to "${availableModels[0]}".`,
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Error fetching model provider map:', error);
        toast({
          title: "Failed to Load Models",
          description: "Could not fetch available models from backend. Using default options.",
          variant: "destructive",
        });
        // Fallback to hardcoded models if API fails
        setModelProviderMap({
          'gpt-4o': 'openai',
          'gpt-4o-mini': 'openai',
          'gpt-3.5-turbo': 'openai',
          'llama3.1:8b': 'ollama',
          'llama3.1:70b': 'ollama',
          'mistral:7b': 'ollama',
        });
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, [initialParams?.modelName]);

  // Update state when initialParams change
  useEffect(() => {
    if (initialParams) {
      if (initialParams.modelName) setModelName(initialParams.modelName);
      if (initialParams.temperature !== undefined) setTemperature([initialParams.temperature]);
      if (initialParams.topP !== undefined) setTopP([initialParams.topP]);
      if (initialParams.frequencyPenalty !== undefined) setFrequencyPenalty([initialParams.frequencyPenalty]);
      if (initialParams.presencePenalty !== undefined) setPresencePenalty([initialParams.presencePenalty]);
      if (initialParams.repeatPenalty !== undefined) setRepeatPenalty([initialParams.repeatPenalty]);
    }
  }, [initialParams]);

  const provider = modelProviderMap[modelName] || 'openai';

  // Notify parent component when parameters change
  useEffect(() => {
    if (onParametersChange) {
      onParametersChange({
        modelName,
        temperature: temperature[0],
        topP: topP[0],
        frequencyPenalty: frequencyPenalty[0],
        presencePenalty: presencePenalty[0],
        repeatPenalty: repeatPenalty[0]
      });
    }
  }, [modelName, temperature, topP, frequencyPenalty, presencePenalty, repeatPenalty, onParametersChange]);

  const getProviderBadgeColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-blue-100 text-blue-700';
      case 'ollama':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'OpenAI';
      case 'ollama':
        return 'Ollama';
      default:
        return provider;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Model Selection</Label>
        <Select 
          value={modelName} 
          onValueChange={setModelName}
          disabled={isLoadingModels}
        >
          <SelectTrigger className="border-green-200 focus:border-green-400">
            <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Select a model"} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(modelProviderMap).map(([model, provider]) => (
              <SelectItem key={model} value={model}>
                <div className="flex items-center space-x-2">
                  <span>{model}</span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getProviderBadgeColor(provider)}`}
                  >
                    {getProviderDisplayName(provider)}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-gray-700">Temperature</Label>
            <span className="text-sm text-green-600 font-mono">{temperature[0]}</span>
          </div>
          <Slider
            value={temperature}
            onValueChange={setTemperature}
            max={2.0}
            min={0.0}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-gray-700">Top-p</Label>
            <span className="text-sm text-green-600 font-mono">{topP[0]}</span>
          </div>
          <Slider
            value={topP}
            onValueChange={setTopP}
            max={1.0}
            min={0.0}
            step={0.05}
            className="w-full"
          />
        </div>

        {provider === 'openai' && (
          <>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">Frequency Penalty</Label>
                <span className="text-sm text-green-600 font-mono">{frequencyPenalty[0]}</span>
              </div>
              <Slider
                value={frequencyPenalty}
                onValueChange={setFrequencyPenalty}
                max={2.0}
                min={0.0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">Presence Penalty</Label>
                <span className="text-sm text-green-600 font-mono">{presencePenalty[0]}</span>
              </div>
              <Slider
                value={presencePenalty}
                onValueChange={setPresencePenalty}
                max={2.0}
                min={0.0}
                step={0.1}
                className="w-full"
              />
            </div>
          </>
        )}

        {provider === 'ollama' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-gray-700">Repeat Penalty</Label>
              <span className="text-sm text-green-600 font-mono">{repeatPenalty[0]}</span>
            </div>
            <Slider
              value={repeatPenalty}
              onValueChange={setRepeatPenalty}
              max={2.0}
              min={0.0}
              step={0.1}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};
