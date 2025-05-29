
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Sparkles, Layers, Settings, History, Upload, Edit, Plus, Trash2 } from 'lucide-react';

export const Documentation = () => {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-green-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <BookOpen className="h-6 w-6" />
            <span>Ontology Patterns Documentation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              The Ontology Patterns Generator is an advanced AI-powered tool designed to assist in ontology engineering 
              by automating the generation of ontology patterns using large language models (LLMs). It supports two 
              fundamental patterns for ontological knowledge representation and enhancement.
            </p>
          </section>

          {/* Models Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Settings className="h-6 w-6 mr-2 text-green-600" />
              Models & Parameters
            </h2>
            <p className="text-gray-700 mb-4">
              The model selection consists of available OpenAI models and models served through Ollama running 
              on VŠE Infrastructure. The last used Ollama model will stay loaded in memory for an hour.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-green-50">
                    <th className="border border-gray-300 p-3 text-left font-semibold">Parameter</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold">Description</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold">Availability</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">
                      <Badge variant="secondary">temperature</Badge>
                    </td>
                    <td className="border border-gray-300 p-3">
                      Controls randomness in token selection. 0.0 = deterministic, higher values increase creativity.
                    </td>
                    <td className="border border-gray-300 p-3">All models</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">
                      <Badge variant="secondary">top_p</Badge>
                    </td>
                    <td className="border border-gray-300 p-3">
                      Nucleus sampling: selects tokens with cumulative probability up to specified value.
                    </td>
                    <td className="border border-gray-300 p-3">All models</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">
                      <Badge variant="secondary">frequency_penalty</Badge>
                    </td>
                    <td className="border border-gray-300 p-3">
                      Penalizes repeated tokens based on frequency. Higher values reduce repetition.
                    </td>
                    <td className="border border-gray-300 p-3">
                      <Badge className="bg-blue-100 text-blue-700">OpenAI models</Badge>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">
                      <Badge variant="secondary">presence_penalty</Badge>
                    </td>
                    <td className="border border-gray-300 p-3">
                      Penalizes tokens that appeared once, encouraging new topics.
                    </td>
                    <td className="border border-gray-300 p-3">
                      <Badge className="bg-blue-100 text-blue-700">OpenAI models</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">
                      <Badge variant="secondary">repeat_penalty</Badge>
                    </td>
                    <td className="border border-gray-300 p-3">
                      Ollama-specific penalty reducing likelihood of token repetition.
                    </td>
                    <td className="border border-gray-300 p-3">
                      <Badge className="bg-green-100 text-green-700">Ollama models</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Pattern 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-green-600" />
              Pattern 1: Object Property Chain Shortcut
            </h2>
            <p className="text-gray-700 mb-4">
              Creates a direct property connecting two classes via an object property chain, eliminating 
              the need to traverse intermediate relationships.
            </p>
            
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-green-50">
                    <th className="border border-gray-300 p-3 text-left font-semibold">Input Field</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">Class A label</td>
                    <td className="border border-gray-300 p-3">Label of the starting class (e.g., "corpus_part")</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Property p label</td>
                    <td className="border border-gray-300 p-3">Property linking Class A to Class B (e.g., "genre")</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Class B label</td>
                    <td className="border border-gray-300 p-3">Label of the intermediate class (e.g., "Genre")</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Property r label</td>
                    <td className="border border-gray-300 p-3">Property linking Class B to Class C (e.g., "has sub-genre")</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Class C label</td>
                    <td className="border border-gray-300 p-3">Label of the target class (e.g., "Music Genre")</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">
                <strong>Output:</strong> Property Name - the suggested direct property (e.g., "has_music_genre")
              </p>
              <p className="text-green-700 text-sm mt-2">
                <strong>CSV Columns:</strong> ?A_label, ?p_label, ?B_label, ?r_label, ?C_label, Property
              </p>
            </div>
          </section>

          {/* Pattern 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Layers className="h-6 w-6 mr-2 text-green-600" />
              Pattern 2: Subclass Enrichment
            </h2>
            <p className="text-gray-700 mb-4">
              Proposes a new subclass of an existing class based on specific relationship patterns, 
              enriching the ontological hierarchy with more specialized concepts.
            </p>
            
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-green-50">
                    <th className="border border-gray-300 p-3 text-left font-semibold">Input Field</th>
                    <th className="border border-gray-300 p-3 text-left font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">Class A label</td>
                    <td className="border border-gray-300 p-3">Label of the parent class (e.g., "System")</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Property p label</td>
                    <td className="border border-gray-300 p-3">Property linking Class A to Class B (e.g., "has component")</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Class B label</td>
                    <td className="border border-gray-300 p-3">Label of the intermediate class (e.g., "Component")</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Class C label</td>
                    <td className="border border-gray-300 p-3">Label of the subclass of B (e.g., "Storage Device")</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">
                <strong>Output:</strong> Class Name - the suggested subclass name (e.g., "StorageSystem")
              </p>
              <p className="text-green-700 text-sm mt-2">
                <strong>CSV Columns:</strong> ?A_label, ?p_label, ?B_label, ?C_label, Subclass, Human
              </p>
            </div>
          </section>

          {/* Few-Shot Data Management */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Upload className="h-6 w-6 mr-2 text-green-600" />
              Few-Shot Data Management
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">CSV Upload Requirements</h3>
                <p className="text-gray-700 mb-4">
                  You can upload your own few-shot examples by providing a CSV file with the exact column names required for each pattern. 
                  The system will validate your CSV and show an error if any required columns are missing.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Pattern 1 CSV Columns
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div><Badge variant="outline" className="text-xs">?A_label</Badge> - Starting class label</div>
                      <div><Badge variant="outline" className="text-xs">?p_label</Badge> - Property from A to B</div>
                      <div><Badge variant="outline" className="text-xs">?B_label</Badge> - Intermediate class label</div>
                      <div><Badge variant="outline" className="text-xs">?r_label</Badge> - Property from B to C</div>
                      <div><Badge variant="outline" className="text-xs">?C_label</Badge> - Target class label</div>
                      <div><Badge variant="outline" className="text-xs">Property</Badge> - Expected shortcut property</div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                      <Layers className="h-4 w-4 mr-2" />
                      Pattern 2 CSV Columns
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div><Badge variant="outline" className="text-xs">?A_label</Badge> - Parent class label</div>
                      <div><Badge variant="outline" className="text-xs">?p_label</Badge> - Property from A to B</div>
                      <div><Badge variant="outline" className="text-xs">?B_label</Badge> - Intermediate class label</div>
                      <div><Badge variant="outline" className="text-xs">?C_label</Badge> - Subclass of B label</div>
                      <div><Badge variant="outline" className="text-xs">Subclass</Badge> - Expected new subclass</div>
                      <div><Badge variant="outline" className="text-xs">Human</Badge> - Human evaluation (optional)</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 text-sm">
                    <strong>Important:</strong> Column names are case-sensitive and must match exactly as shown above, including the "?" prefix where applicable.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Interactive Table Editing</h3>
                <p className="text-gray-700 mb-4">
                  The few-shot examples table provides full editing capabilities to manage your training data effectively:
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Plus className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Adding New Examples</h4>
                      <p className="text-gray-600 text-sm">
                        Click the "Add Example" button to create a new row. Fill in all required fields and click the green checkmark to save.
                        The system will validate that all required columns are completed before saving.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Edit className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Editing Existing Rows</h4>
                      <p className="text-gray-600 text-sm">
                        Click the edit icon (pencil) next to any row to modify its values. Use the green checkmark to save changes 
                        or the X button to cancel without saving.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Deleting Rows</h4>
                      <p className="text-gray-600 text-sm">
                        Click the delete icon (trash can) to remove a row permanently. This action cannot be undone, 
                        so please confirm before deletion.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Preloaded Examples</h3>
                <p className="text-gray-700 mb-2">
                  Each pattern comes with preloaded example data to help you get started quickly. When you enable few-shot learning:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm ml-4">
                  <li>Default examples are automatically loaded when the table is empty</li>
                  <li>You can edit, delete, or add to these preloaded examples</li>
                  <li>Uploading a new CSV file will replace all existing data</li>
                  <li>The table shows "(preloaded)" indicator when using default examples</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Data Persistence</h3>
                <p className="text-gray-700 text-sm">
                  Your few-shot data modifications are maintained during your session but are not permanently stored. 
                  If you want to preserve custom examples, export them by creating a CSV from your edited table data.
                </p>
              </div>
            </div>
          </section>

          {/* Session History */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <History className="h-6 w-6 mr-2 text-green-600" />
              Session History
            </h2>
            <p className="text-gray-700 mb-4">
              Session data is stored securely in the browser's local storage and never transmitted to external servers, 
              ensuring privacy and data security.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Export CSV</h4>
                <p className="text-blue-700 text-sm">Download all session interactions as a CSV file for analysis</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Clear History</h4>
                <p className="text-red-700 text-sm">Remove all stored session data from local storage</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Load Sessions</h4>
                <p className="text-green-700 text-sm">Reuse previous inputs and results by loading past sessions</p>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};
