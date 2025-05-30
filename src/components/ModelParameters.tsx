
import React, { useState, useEffect, useCallback } from 'react';
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

// Default fallback models that should always be available
const DEFAULT_MODELS = {
  'gpt-4o': 'openai',
  'gpt-4o-mini': 'openai',
  'gpt-3.5-turbo': 'openai',
};

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
  
  const [modelProviderMap, setModelProviderMap] = useState<{[key: string]: string}>(DEFAULT_MODELS);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [apiError, setApiError] = useState(false);

  // Get API base URL - try to detect from current location or fall back to localhost
  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const currentHost = window.location.hostname;
      if (currentHost === 'patterns.vse.cz' || currentHost === 'www.patterns.vse.cz') {
        return 'https://patterns.vse.cz:8000';
      }
      // For local development, try to use the same host but different port
      if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
        return `http://${currentHost}:8000`;
      }
    }
    return 'http://localhost:8000';
  };

  // Fetch available models from backend
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const apiBaseUrl = getApiBaseUrl();
        console.log('Fetching models from:', `${apiBaseUrl}/model_provider_map`);
        
        const response = await fetch(`${apiBaseUrl}/model_provider_map`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const modelMap = await response.json();
        setModelProviderMap(modelMap);
        setApiError(false);
        
        // Check if initial model is available, if not use first available or fallback
        if (initialParams?.modelName && !modelMap[initialParams.modelName]) {
          const availableModels = Object.keys(modelMap);
          if (availableModels.length > 0) {
            setModelName(availableModels[0]);
            console.warn(`Model "${initialParams.modelName}" not available, switched to "${availableModels[0]}"`);
          } else {
            // If no models from API, use default
            setModelName('gpt-4o');
            console.warn(`No models available from API, using default: gpt-4o`);
          }
        }
      } catch (error) {
        console.error('Error fetching model provider map:', error);
        setApiError(true);
        
        // Use fallback models and don't show error toast unless it's a critical issue
        setModelProviderMap(DEFAULT_MODELS);
        
        // Only show toast for actual connectivity issues, not for expected local dev scenarios
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (!errorMessage.includes('fetch')) {
          toast({
            title: "Model API Warning",
            description: "Using default model options. Backend API may be unavailable.",
            variant: "default",
          });
        }
        
        // If initial model is not in defaults, use gpt-4o
        if (initialParams?.modelName && !DEFAULT_MODELS[initialParams.modelName]) {
          setModelName('gpt-4o');
          console.warn(`Model "${initialParams.modelName}" not in defaults, using gpt-4o`);
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
        // Validate the model exists in our available models
        if (modelProviderMap[initialParams.modelName]) {
          setModelName(initialParams.modelName);
        } else {
          console.warn(`Model "${initialParams.modelName}" not available, keeping current: ${modelName}`);
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
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700">Model Selection</Label>
          {apiError && (
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
              Using defaults
            </Badge>
          )}
        </div>
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
