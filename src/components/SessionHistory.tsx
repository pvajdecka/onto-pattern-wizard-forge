
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, RotateCcw, Clock, Sparkles, Layers } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const SessionHistory = () => {
  const [sessions] = useState([
    {
      id: '1',
      pattern: 'Shortcut',
      result: 'has_music_genre',
      timestamp: '29/05/2025 at 14:30:25',
      classA: 'corpus_part',
      classB: 'Genre',
      classC: 'Music Genre',
      propertyP: 'genre',
      propertyR: 'has sub-genre',
      model: 'gpt-4o',
      temperature: 0.0,
      explanation: 'This property creates a direct relationship between corpus parts and music genres...'
    },
    {
      id: '2',
      pattern: 'Subclass',
      result: 'StorageSystem',
      timestamp: '29/05/2025 at 13:15:42',
      classA: 'System',
      classB: 'Component',
      classC: 'Storage Device',
      propertyP: 'has component',
      model: 'gpt-4o-mini',
      temperature: 0.2,
      explanation: 'This specialized subclass represents systems that specifically include storage devices...'
    }
  ]);

  const handleExport = () => {
    // Create CSV content
    const csvContent = sessions.map(session => 
      `${session.pattern},${session.classA},${session.classB},${session.classC},${session.result},${session.timestamp}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patterns_history.csv';
    a.click();
    
    toast({
      title: "Export Complete",
      description: "Session history exported successfully",
    });
  };

  const handleClearHistory = () => {
    toast({
      title: "History Cleared",
      description: "All session data has been removed",
    });
  };

  const handleLoad = (session: any) => {
    toast({
      title: "Session Loaded",
      description: `Loaded ${session.pattern} pattern configuration`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-green-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Clock className="h-6 w-6" />
            <span>Session History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <Button
                onClick={handleExport}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={handleClearHistory}
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} stored locally
            </p>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Session history is empty</p>
              <p className="text-gray-400 text-sm">Generate some patterns to see them here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="border-gray-200 hover:border-green-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {session.pattern === 'Shortcut' ? (
                          <Sparkles className="h-6 w-6 text-green-600" />
                        ) : (
                          <Layers className="h-6 w-6 text-green-600" />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {session.pattern}: {session.result}
                          </h3>
                          <p className="text-sm text-gray-500">{session.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {session.model}
                        </Badge>
                        <Badge variant="outline">
                          temp: {session.temperature}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Class A:</span>
                        <p className="text-gray-800">{session.classA}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Property p:</span>
                        <p className="text-gray-800">{session.propertyP}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Class B:</span>
                        <p className="text-gray-800">{session.classB}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          {session.pattern === 'Shortcut' ? 'Class C:' : 'Class C (⊆ B):'}
                        </span>
                        <p className="text-gray-800">{session.classC}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="font-medium text-gray-600 text-sm">Explanation:</span>
                      <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                        {session.explanation}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleLoad(session)}
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Load Pattern {session.pattern === 'Shortcut' ? '1' : '2'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
