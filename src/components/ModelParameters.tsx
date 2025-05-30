
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { clearSessionHistory } from '@/utils/sessionStorage';

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

export const ModelParameters: React.FC<ModelParametersProps> = React.memo(({ 
  onParametersChange, 
  initialParams 
}) => {
  const [modelName, setModelName] = useState(initialParams?.modelName || 'gpt-4o');
  const [temperature, setTemperature] = useState([initialParams?.temperature ?? 0.0]);
  const [topP, setTopP] = useState([initialParams?.topP ?? 1.0]);
  const [frequencyPenalty, setFrequencyPenalty] = useState([initialParams?.frequencyPenalty ?? 0.0]);
  const [presencePenalty, setPresencePenalty] = useState([initialParams?.presencePenalty ?? 0.0]);
  const [repeatPenalty, setRepeatPenalty] = useState([initialParams?.repeatPenalty ?? 1.1]);
  
  const [modelProviderMap, setModelProviderMap] = useState<{[key: string]: string}>({});
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  // Use the specified backend URL
  const BACKEND_URL = 'http://127.0.0.1:8000';

  // Fetch available models from backend
  useEffect(() => {
    const fetchModels = async () => {
      try {
        console.log('Fetching models from:', BACKEND_URL);
        
        const response = await fetch(`${BACKEND_URL}/model_provider_map`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
        }
        
        const modelMap = await response.json();
        console.log('Fetched model map:', modelMap);
        setModelProviderMap(modelMap);
        
        // Check if initial model is available, if not use first available
        if (initialParams?.modelName && !modelMap[initialParams.modelName]) {
          const availableModels = Object.keys(modelMap);
          if (availableModels.length > 0) {
            setModelName(availableModels[0]);
            console.log(`Model "${initialParams.modelName}" not available. Using "${availableModels[0]}".`);
          }
        }
      } catch (error) {
        console.error('Error fetching model provider map:', error);
        
        // Clear session storage on fetch failure to prevent future issues
        try {
          clearSessionHistory();
          console.log('Cleared session history due to backend connection issues');
        } catch (clearError) {
          console.error('Error clearing session history:', clearError);
        }
        
        // Use fallback models without showing error to user
        const fallbackModels = {
          'gpt-4o': 'openai',
          'gpt-4o-mini': 'openai',
          'gpt-3.5-turbo': 'openai',
        };
        
        setModelProviderMap(fallbackModels);
        
        // Ensure we use a valid fallback model
        if (initialParams?.modelName && !fallbackModels[initialParams.modelName]) {
          setModelName('gpt-4o');
        }
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, [initialParams?.modelName]);

  // Update state when initialParams change - but only once to avoid loops
  useEffect(() => {
    if (initialParams) {
      if (initialParams.modelName && initialParams.modelName !== modelName) {
        // Validate model exists in current map, otherwise use default
        if (modelProviderMap[initialParams.modelName] || Object.keys(modelProviderMap).length === 0) {
          setModelName(initialParams.modelName);
        } else {
          setModelName('gpt-4o');
        }
      }
      if (initialParams.temperature !== undefined && initialParams.temperature !== temperature[0]) {
        setTemperature([initialParams.temperature]);
      }
      if (initialParams.topP !== undefined && initialParams.topP !== topP[0]) {
        console.log('Setting topP from initialParams:', initialParams.topP);
        setTopP([initialParams.topP]);
      }
      if (initialParams.frequencyPenalty !== undefined && initialParams.frequencyPenalty !== frequencyPenalty[0]) {
        setFrequencyPenalty([initialParams.frequencyPenalty]);
      }
      if (initialParams.presencePenalty !== undefined && initialParams.presencePenalty !== presencePenalty[0]) {
        setPresencePenalty([initialParams.presencePenalty]);
      }
      if (initialParams.repeatPenalty !== undefined && initialParams.repeatPenalty !== repeatPenalty[0]) {
        setRepeatPenalty([initialParams.repeatPenalty]);
      }
    }
  }, [initialParams, modelProviderMap]);

  const provider = modelProviderMap[modelName] || 'openai';

  // Memoized callbacks to prevent re-renders
  const handleTemperatureChange = useCallback((value: number[]) => {
    setTemperature(value);
  }, []);

  const handleTopPChange = useCallback((value: number[]) => {
    console.log('Top-p changed to:', value[0]);
    setTopP(value);
  }, []);

  const handleFrequencyPenaltyChange = useCallback((value: number[]) => {
    setFrequencyPenalty(value);
  }, []);

  const handlePresencePenaltyChange = useCallback((value: number[]) => {
    setPresencePenalty(value);
  }, []);

  const handleRepeatPenaltyChange = useCallback((value: number[]) => {
    setRepeatPenalty(value);
  }, []);

  const handleModelChange = useCallback((value: string) => {
    setModelName(value);
  }, []);

  // Notify parent component when parameters change - debounced
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onParametersChange) {
        const params = {
          modelName,
          temperature: temperature[0],
          topP: topP[0],
          frequencyPenalty: frequencyPenalty[0],
          presencePenalty: presencePenalty[0],
          repeatPenalty: repeatPenalty[0]
        };
        console.log('Sending parameters to parent:', params);
        onParametersChange(params);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [modelName, temperature, topP, frequencyPenalty, presencePenalty, repeatPenalty, onParametersChange]);

  const getProviderBadgeColor = useCallback((provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-blue-100 text-blue-700';
      case 'ollama':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }, []);

  const getProviderDisplayName = useCallback((provider: string) => {
    switch (provider) {
      case 'openai':
        return 'OpenAI';
      case 'ollama':
        return 'Ollama';
      default:
        return provider;
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Model Selection</Label>
        <Select 
          value={modelName} 
          onValueChange={handleModelChange}
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
            <span className="text-sm text-green-600 font-mono">{temperature[0].toFixed(1)}</span>
          </div>
          <Slider
            value={temperature}
            onValueChange={handleTemperatureChange}
            max={2.0}
            min={0.0}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-gray-700">Top-p</Label>
            <span className="text-sm text-green-600 font-mono">{topP[0].toFixed(2)}</span>
          </div>
          <Slider
            value={topP}
            onValueChange={handleTopPChange}
            max={1.0}
            min={0.0}
            step={0.01}
            className="w-full"
          />
        </div>

        {provider === 'openai' && (
          <>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">Frequency Penalty</Label>
                <span className="text-sm text-green-600 font-mono">{frequencyPenalty[0].toFixed(1)}</span>
              </div>
              <Slider
                value={frequencyPenalty}
                onValueChange={handleFrequencyPenaltyChange}
                max={2.0}
                min={0.0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">Presence Penalty</Label>
                <span className="text-sm text-green-600 font-mono">{presencePenalty[0].toFixed(1)}</span>
              </div>
              <Slider
                value={presencePenalty}
                onValueChange={handlePresencePenaltyChange}
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
              <span className="text-sm text-green-600 font-mono">{repeatPenalty[0].toFixed(1)}</span>
            </div>
            <Slider
              value={repeatPenalty}
              onValueChange={handleRepeatPenaltyChange}
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
});

ModelParameters.displayName = 'ModelParameters';
