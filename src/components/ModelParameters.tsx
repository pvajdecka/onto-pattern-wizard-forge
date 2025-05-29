
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export const ModelParameters = () => {
  const [modelName, setModelName] = useState('gpt-4o');
  const [temperature, setTemperature] = useState([0.0]);
  const [topP, setTopP] = useState([1.0]);
  const [frequencyPenalty, setFrequencyPenalty] = useState([0.0]);
  const [presencePenalty, setPresencePenalty] = useState([0.0]);
  const [repeatPenalty, setRepeatPenalty] = useState([1.1]);

  const modelProviderMap = {
    'gpt-4o': 'openai',
    'gpt-4o-mini': 'openai',
    'gpt-3.5-turbo': 'openai',
    'llama3.1:8b': 'ollama',
    'llama3.1:70b': 'ollama',
    'mistral:7b': 'ollama',
  };

  const provider = modelProviderMap[modelName] || 'openai';

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Model Selection</Label>
        <Select value={modelName} onValueChange={setModelName}>
          <SelectTrigger className="border-green-200 focus:border-green-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o">
              <div className="flex items-center space-x-2">
                <span>GPT-4O</span>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">OpenAI</Badge>
              </div>
            </SelectItem>
            <SelectItem value="gpt-4o-mini">
              <div className="flex items-center space-x-2">
                <span>GPT-4O Mini</span>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">OpenAI</Badge>
              </div>
            </SelectItem>
            <SelectItem value="gpt-3.5-turbo">
              <div className="flex items-center space-x-2">
                <span>GPT-3.5 Turbo</span>
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">OpenAI</Badge>
              </div>
            </SelectItem>
            <SelectItem value="llama3.1:8b">
              <div className="flex items-center space-x-2">
                <span>Llama 3.1 8B</span>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Ollama</Badge>
              </div>
            </SelectItem>
            <SelectItem value="llama3.1:70b">
              <div className="flex items-center space-x-2">
                <span>Llama 3.1 70B</span>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Ollama</Badge>
              </div>
            </SelectItem>
            <SelectItem value="mistral:7b">
              <div className="flex items-center space-x-2">
                <span>Mistral 7B</span>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Ollama</Badge>
              </div>
            </SelectItem>
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
