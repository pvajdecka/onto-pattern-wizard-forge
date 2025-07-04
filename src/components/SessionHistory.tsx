
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, RotateCcw, Clock, Sparkles, Layers } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getSessionHistory, clearSessionHistory, SessionData } from '@/utils/sessionStorage';

interface SessionHistoryProps {
  onLoadSession?: (sessionData: SessionData, patternType: 'shortcut' | 'subclass') => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ onLoadSession }) => {
  const [sessions, setSessions] = useState<SessionData[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const sessionData = getSessionHistory();
    // Sort by timestamp descending (newest first) with improved date parsing
    const sortedSessions = sessionData.sort((a, b) => {
      // Parse date format: "DD/MM/YYYY at HH:MM:SS"
      const parseDate = (dateString: string) => {
        const [datePart, timePart] = dateString.split(' at ');
        const [day, month, year] = datePart.split('/');
        const [hour, minute, second] = timePart.split(':');
        return new Date(
          parseInt(year),
          parseInt(month) - 1, // months are 0-indexed
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          parseInt(second || '0')
        ).getTime();
      };
      
      const timeA = parseDate(a.time);
      const timeB = parseDate(b.time);
      return timeB - timeA; // newest first
    });
    setSessions(sortedSessions);
  };

  const handleExport = () => {
    if (sessions.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Session history is empty",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content with all columns for both patterns
    const headers = [
      'pattern', 'A_label', 'p_label', 'B_label', 'r_label', 'C_label', 'result', 'timestamp',
      'model_name', 'use_few_shot', 'temperature', 'top_p', 'frequency_penalty', 
      'presence_penalty', 'repeat_penalty', 'explanation'
    ];
    
    const csvContent = [
      headers.join(','),
      ...sessions.map(session => {
        const pattern = session.property_name ? 'Shortcut' : 'Subclass';
        const result = session.property_name || session.class_name || '';
        const row = [
          pattern,
          session.A_label,
          session.p_label,
          session.B_label,
          session.r_label || '', // Always include r_label column, empty for subclass
          session.C_label,
          result,
          session.time,
          session.model_name,
          session.use_few_shot,
          session.temperature,
          session.top_p,
          session.frequency_penalty,
          session.presence_penalty,
          session.repeat_penalty,
          `"${session.explanation.replace(/"/g, '""')}"`
        ];
        return row.join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patterns_history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Session history exported successfully",
    });
  };

  const handleClearHistory = () => {
    clearSessionHistory();
    setSessions([]);
    toast({
      title: "History Cleared",
      description: "All session data has been removed",
    });
  };

  const handleLoad = (session: SessionData) => {
    const patternType = session.property_name ? 'shortcut' : 'subclass';
    
    if (onLoadSession) {
      onLoadSession(session, patternType);
    }
    
    toast({
      title: "Session Loaded",
      description: `Loaded ${patternType} pattern configuration`,
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
              {sessions.map((session, index) => {
                const pattern = session.property_name ? 'Shortcut' : 'Subclass';
                const result = session.property_name || session.class_name || '';
                
                return (
                  <Card key={index} className="border-gray-200 hover:border-green-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {pattern === 'Shortcut' ? (
                            <Sparkles className="h-6 w-6 text-green-600" />
                          ) : (
                            <Layers className="h-6 w-6 text-green-600" />
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {pattern}: {result}
                            </h3>
                            <p className="text-sm text-gray-500">{session.time}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-2">
                            {session.use_few_shot && (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                few-shot
                              </Badge>
                            )}
                          </div>
                          
                          {/* Model Parameters Section - Single Line Layout with Full Names */}
                          <div className="bg-gray-50 rounded-lg px-4 py-2 text-xs text-gray-700 border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <span className="font-semibold text-gray-800">{session.model_name}</span>
                              <span className="text-gray-400">|</span>
                              <span><span className="font-medium">Temperature:</span> {session.temperature}</span>
                              <span><span className="font-medium">Top-p:</span> {session.top_p}</span>
                              <span><span className="font-medium">Frequency Penalty:</span> {session.frequency_penalty}</span>
                              <span><span className="font-medium">Presence Penalty:</span> {session.presence_penalty}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Class A:</span>
                          <p className="text-gray-800">{session.A_label}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Property p:</span>
                          <p className="text-gray-800">{session.p_label}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Class B:</span>
                          <p className="text-gray-800">{session.B_label}</p>
                        </div>
                        {pattern === 'Shortcut' && (
                          <div>
                            <span className="font-medium text-gray-600">Property r:</span>
                            <p className="text-gray-800">{session.r_label || '-'}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-600">
                            {pattern === 'Shortcut' ? 'Class C:' : 'Class C (⊆ B):'}
                          </span>
                          <p className="text-gray-800">{session.C_label}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="font-medium text-gray-600 text-sm">Few-shot enabled:</span>
                        <p className="text-gray-700 text-sm mt-1">
                          {session.use_few_shot ? 'Yes' : 'No'}
                          {session.use_few_shot && session.few_shot_examples && session.few_shot_examples.length > 0 && (
                            <span className="ml-2 text-gray-500">
                              ({session.few_shot_examples.length} example{session.few_shot_examples.length !== 1 ? 's' : ''})
                            </span>
                          )}
                        </p>
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
                        Load Pattern {pattern === 'Shortcut' ? '1' : '2'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
